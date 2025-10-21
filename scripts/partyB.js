// partyB.js
// WebSocket server representing Device B
import WebSocket, { WebSocketServer } from "ws";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { numberToBytesBE, bytesToNumberBE } from "@noble/curves/abstract/utils";

const CURVE = secp256k1;
const q = CURVE.CURVE.n; // order as bigint

// --- Helpers ---
function hex(b) {
  return Buffer.from(b).toString("hex");
}
function fromHex(h) {
  return Uint8Array.from(Buffer.from(h, "hex"));
}
function bnTo32(n) {
  return numberToBytesBE(n, 32);
}
function bytesToBn(b) {
  return bytesToNumberBE(b);
}

function log(...args) {
  console.log("[B]", ...args);
}

// Schnorr challenge: c = H(rx || P || msg) mod q
function computeChallenge(RbytesCompressed, PbytesCompressed, msgBytes) {
  const Rpt = CURVE.ProjectivePoint.fromHex(RbytesCompressed);
  const rx = Rpt.x % q;
  const rxBytes = bnTo32(rx);
  const data = new Uint8Array([...rxBytes, ...PbytesCompressed, ...msgBytes]);
  const h = sha256(data);
  return bytesToNumberBE(h) % q;
}

// create key share
function keygen() {
  const priv = CURVE.utils.randomPrivateKey(); // Uint8Array
  const x = bytesToBn(priv) % q;
  const pub = CURVE.getPublicKey(priv); // compressed bytes
  return { x, xBytes: priv, pub };
}

// nonce + commit
function createNonceCommit() {
  const kBytes = CURVE.utils.randomPrivateKey();
  const k = bytesToBn(kBytes) % q;
  const Rbytes = CURVE.getPublicKey(kBytes);
  const commit = sha256(Rbytes); // simple commit
  return { k, kBytes, Rbytes, commit };
}

// partial s
function computePartialS(k_big, x_big, c_big) {
  return (k_big + c_big * x_big) % q;
}

// combine s
function combineS(s1, s2) {
  return (s1 + s2) % q;
}

// verify signature: s*G == R + cP
function verifySignature(Rbytes, Pbytes, msgBytes, s_big) {
  const c = computeChallenge(Rbytes, Pbytes, msgBytes);
  const sG = CURVE.ProjectivePoint.BASE.multiply(s_big);
  const Ppt = CURVE.ProjectivePoint.fromHex(Pbytes);
  const RHS = CURVE.ProjectivePoint.fromHex(Rbytes).add(Ppt.multiply(c));
  return sG.equals(RHS);
}

// Start server

const wss = new WebSocketServer({ port: 8070 });

console.log("WebSocket server listening on port 8070");

wss.on("connection", (ws) => {
  log("Client connected");

  // Generate B's keyshare
  const { x: xB, xBytes: xBBytes, pub: pubB } = keygen();
  log("Generated key share xB");

  // We'll hold state for this session
  let pubA = null;
  let aggregatedPub = null;

  // Nonce state for signing
  let nonceLocal = null;
  let nonceRemote = null;

  // When messages arrive
  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === "HELLO") {
      log("Received HELLO from A");
      // send our pub
      ws.send(JSON.stringify({ type: "PUB", pub: hex(pubB) }));
      log("Sent PUB (pubB)");
    } else if (msg.type === "PUB") {
      pubA = fromHex(msg.pub);
      log("Received PUB from A:", msg.pub.slice(0, 20) + "...");
      // compute aggregated pub
      const Apt = CURVE.ProjectivePoint.fromHex(pubA);
      const Bpt = CURVE.ProjectivePoint.fromHex(pubB);
      const Ppt = Apt.add(Bpt);
      aggregatedPub = Ppt.toRawBytes(true); // compressed
      log("Aggregated public key:", hex(aggregatedPub));
      // reply ACK
      ws.send(JSON.stringify({ type: "PUB_ACK" }));
    } else if (msg.type === "SIGN_REQUEST") {
      // A requested a signing session for message
      const msgText = msg.message;
      log("Sign request for message:", msgText);
      // generate our nonce and commit, send commit
      nonceLocal = createNonceCommit();
      ws.send(
        JSON.stringify({ type: "COMMIT", commit: hex(nonceLocal.commit) })
      );
      log("Sent COMMIT (B)");
    } else if (msg.type === "COMMIT") {
      // received A's commit -> store it, then send our NONCE (open)
      const commitA = msg.commit;
      log("Received COMMIT from A:", commitA.slice(0, 20) + "...");
      // send our R (open)
      if (!nonceLocal) nonceLocal = createNonceCommit();
      ws.send(JSON.stringify({ type: "NONCE", R: hex(nonceLocal.Rbytes) }));
      log("Sent NONCE (R_B)");
    } else if (msg.type === "NONCE") {
      // received A's R (open)
      nonceRemote = fromHex(msg.R);
      log("Received NONCE R_A:", msg.R.slice(0, 20) + "...");

      // Now we should have nonceLocal and nonceRemote, compute R aggregate
      if (!nonceLocal) {
        // if we hadn't produced a nonce yet, create one (shouldn't happen normally)
        nonceLocal = createNonceCommit();
        ws.send(JSON.stringify({ type: "NONCE", R: hex(nonceLocal.Rbytes) }));
        log("Sent NONCE (R_B) late");
      }

      // compute R = R_A + R_B
      const Rpt = CURVE.ProjectivePoint.fromHex(nonceRemote).add(
        CURVE.ProjectivePoint.fromHex(nonceLocal.Rbytes)
      );
      const Rbytes = Rpt.toRawBytes(true);
      // compute challenge c = H(r || P || msg)
      const msgText = msg.message || "example message"; // A can include message in NONCE or we agreed earlier; here A sent message in initial sign request
      const msgBytes = new TextEncoder().encode(msgText);

      const c = computeChallenge(Rbytes, aggregatedPub, msgBytes);
      const sB = computePartialS(nonceLocal.k, xB, c);

      // send our partial s
      ws.send(JSON.stringify({ type: "PARTIAL_S", s: hex(bnTo32(sB)) }));
      log("Sent PARTIAL_S (B)");
    } else if (msg.type === "PARTIAL_S") {
      // Received A's partial s -> combine and produce full signature
      const sA_bytes = fromHex(msg.s);
      const sA = bytesToBn(sA_bytes) % q;
      log("Received PARTIAL_S from A");

      // compute our partial s if not computed/sent yet (we already sent sB above)
      const sB = computePartialS(
        nonceLocal.k,
        xB,
        computeChallenge(
          CURVE.ProjectivePoint.fromHex(nonceRemote)
            .add(CURVE.ProjectivePoint.fromHex(nonceLocal.Rbytes))
            .toRawBytes(true),
          aggregatedPub,
          new TextEncoder().encode("example message")
        )
      );

      const s = combineS(sA, sB);

      // compute r
      const Rpt = CURVE.ProjectivePoint.fromHex(nonceRemote).add(
        CURVE.ProjectivePoint.fromHex(nonceLocal.Rbytes)
      );
      const r = Rpt.x % q;

      log("Final signature (r,s):");
      log(" r =", "0x" + r.toString(16));
      log(" s =", "0x" + s.toString(16));

      // verify locally
      const Rbytes = Rpt.toRawBytes(true);
      const msgBytes = new TextEncoder().encode("example message");
      const ok = verifySignature(Rbytes, aggregatedPub, msgBytes, s);
      log("Signature valid?", ok);
      // send DONE
      ws.send(JSON.stringify({ type: "DONE", valid: ok }));
    } else if (msg.type === "DONE") {
      log("Peer reports DONE:", msg.valid);
    } else {
      log("Unknown message:", msg);
    }
  });

  ws.on("close", () => {
    log("Client disconnected");
  });
});
