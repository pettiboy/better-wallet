const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js core modules
config.resolver.extraNodeModules = {
  crypto: path.resolve(__dirname, "crypto-shim.js"),
  stream: require.resolve("readable-stream"),
  buffer: require.resolve("buffer"),
  events: require.resolve("events"),
  vm: require.resolve("vm-browserify"),
  process: require.resolve("process/browser"),
};

// Ensure the resolver can find modules
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs"];

module.exports = config;
