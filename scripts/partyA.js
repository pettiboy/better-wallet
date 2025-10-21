// partyA.js
// WebSocket client representing Device A
import WebSocket from "ws";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { numberToBytesBE, bytesToNumberBE } from "@noble/curves/abstract/utils";

const CURVE = secp256k1;
const q = CURVE.CURVE.n;

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
  console.log("[A]", ...args);
}

function computeChallenge(RbytesCompressed, PbytesCompressed, msgBytes) {
  const Rpt = CURVE.ProjectivePoint.fromHex(RbytesCompressed);
  const rx = Rpt.x % q;
  const rxBytes = bnTo32(rx);
  const data = new Uint8Array([...rxBytes, ...PbytesCompressed, ...msgBytes]);
  const h = sha256(data);
  return bytesToNumberBE(h) % q;
}

function keygen() {
  const priv = CURVE.utils.randomPrivateKey();
  const x = bytesToBn(priv) % q;
  const pub = CURVE.getPublicKey(priv);
  return { x, xBytes: priv, pub };
}

function createNonceCommit() {
  const kBytes = CURVE.utils.randomPrivateKey();
  const k = bytesToBn(kBytes) % q;
  const Rbytes = CURVE.getPublicKey(kBytes);
  const commit = sha256(Rbytes);
  return { k, kBytes, Rbytes, commit };
}

function computePartialS(k_big, x_big, c_big) {
  return (k_big + c_big * x_big) % q;
}
function combineS(s1, s2) {
  return (s1 + s2) % q;
}
function verifySignature(Rbytes, Pbytes, msgBytes, s_big) {
  const c = computeChallenge(Rbytes, Pbytes, msgBytes);
  const sG = CURVE.ProjectivePoint.BASE.multiply(s_big);
  const Ppt = CURVE.ProjectivePoint.fromHex(Pbytes);
  const RHS = CURVE.ProjectivePoint.fromHex(Rbytes).add(Ppt.multiply(c));
  return sG.equals(RHS);
}

// Connect to server
const ws = new WebSocket("ws://localhost:8070", []);

let pubB = null;
let aggregatedPub = null;
let pubA = null;
let xA = null;
let xABytes = null;
let nonceLocal = null;
let nonceRemote = null;

ws.on("open", () => {
  log("Connected to server");
  // generate key share and send HELLO
  const kg = keygen();
  xA = kg.x;
  xABytes = kg.xBytes;
  pubA = kg.pub;
  log("Generated key share xA");
  ws.send(JSON.stringify({ type: "HELLO" }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === "PUB") {
    pubB = fromHex(msg.pub);
    log("Received PUB from B");
    // send our PUB
    ws.send(JSON.stringify({ type: "PUB", pub: hex(pubA) }));
    log("Sent PUB (A)");
  } else if (msg.type === "PUB_ACK") {
    // server acked aggregation; compute aggregated pub
    const Apt = CURVE.ProjectivePoint.fromHex(pubA);
    const Bpt = CURVE.ProjectivePoint.fromHex(pubB);
    const Ppt = Apt.add(Bpt);
    aggregatedPub = Ppt.toRawBytes(true);
    log("Aggregated public key:", hex(aggregatedPub));
    // Now request a sign on an example message
    const message = "example message";
    ws.send(JSON.stringify({ type: "SIGN_REQUEST", message }));
    log("Sent SIGN_REQUEST");
  } else if (msg.type === "COMMIT") {
    // server sent commit -> produce our nonce commit and send our COMMIT
    log("Received COMMIT from B:", msg.commit.slice(0, 20) + "...");
    nonceLocal = createNonceCommit();
    ws.send(JSON.stringify({ type: "COMMIT", commit: hex(nonceLocal.commit) }));
    log("Sent COMMIT (A)");
  } else if (msg.type === "NONCE") {
    // server sent R_B -> store and send our R (open)
    nonceRemote = fromHex(msg.R);
    log("Received NONCE R_B (from B)");
    if (!nonceLocal) nonceLocal = createNonceCommit();
    ws.send(
      JSON.stringify({
        type: "NONCE",
        R: hex(nonceLocal.Rbytes),
        message: "example message",
      })
    );
    log("Sent NONCE R_A (open)");
  } else if (msg.type === "PARTIAL_S") {
    // server sent partial s (B) -> combine with our sA (we must compute and send our partial earlier or by now)
    const sB = bytesToBn(fromHex(msg.s)) % q;
    log("Received PARTIAL_S from B");
    // compute our partial (if haven't)
    // compute R = R_A + R_B
    const Rpt = CURVE.ProjectivePoint.fromHex(nonceLocal.Rbytes).add(
      CURVE.ProjectivePoint.fromHex(nonceRemote)
    );
    const Rbytes = Rpt.toRawBytes(true);
    const msgBytes = new TextEncoder().encode("example message");
    const c = computeChallenge(Rbytes, aggregatedPub, msgBytes);
    const sA = computePartialS(nonceLocal.k, xA, c);
    // Note: send our PARTIAL_S to B (maybe we sent it earlier; but ensure to send)
    ws.send(JSON.stringify({ type: "PARTIAL_S", s: hex(bnTo32(sA)) }));
    log("Sent PARTIAL_S (A)");
    // combine to final signature
    const s = combineS(sA, sB);
    const r = Rpt.x % q;
    log("Final signature (r,s):");
    log(" r =", "0x" + r.toString(16));
    log(" s =", "0x" + s.toString(16));
    // verify
    const ok = verifySignature(Rbytes, aggregatedPub, msgBytes, s);
    log("Signature valid?", ok);
  } else if (msg.type === "DONE") {
    log("B reports DONE:", msg.valid);
  } else {
    log("Unknown message:", msg);
  }
});

ws.on("close", () => {
  log("Connection closed");
});
ws.on("error", (err) => {
  log("Error:", err.message);
});
