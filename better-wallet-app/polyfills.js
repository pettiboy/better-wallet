// Import polyfills for React Native
import "react-native-get-random-values";
import { Buffer } from "buffer";
import process from "process";

console.log("🔧 Loading polyfills...");

// Setup global variables
global.Buffer = Buffer;
global.process = process;

// Test if crypto.getRandomValues works
try {
  const testArray = new Uint8Array(10);
  crypto.getRandomValues(testArray);
  console.log("✅ crypto.getRandomValues works");
} catch (e) {
  console.error("❌ crypto.getRandomValues failed:", e);
}

console.log("✅ Polyfills loaded successfully");
