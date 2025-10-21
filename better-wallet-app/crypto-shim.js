// Crypto shim for React Native
// Must use CommonJS for Metro bundler compatibility
require("react-native-get-random-values");
const { Buffer } = require("buffer");

// Import crypto-browserify
const cryptoBrowserify = require("crypto-browserify");

// Override randomBytes to use react-native-get-random-values
cryptoBrowserify.randomBytes = function (size, callback) {
  const bytes = new Uint8Array(size);

  try {
    // Use the global crypto.getRandomValues from react-native-get-random-values
    crypto.getRandomValues(bytes);
    const buffer = Buffer.from(bytes);

    if (callback) {
      callback(null, buffer);
      return undefined;
    }
    return buffer;
  } catch (error) {
    if (callback) {
      callback(error);
      return undefined;
    }
    throw error;
  }
};

// Also add randomFillSync for compatibility
cryptoBrowserify.randomFillSync = function (buffer, offset, size) {
  if (!offset) offset = 0;
  if (!size) size = buffer.length - offset;

  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);

  for (let i = 0; i < size; i++) {
    buffer[offset + i] = bytes[i];
  }

  return buffer;
};

module.exports = cryptoBrowserify;
