// ─────────────────────────────────────────────────────────────
// metro.config.js
// Optimized Metro config for faster local bundling on Windows.
// Detected: 12 logical CPU cores → using 10 parallel workers.
// ─────────────────────────────────────────────────────────────

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// ── 1. Parallel Workers ───────────────────────────────────────
// Use 10 of 12 CPU cores for parallel JS transformation.
// This significantly reduces "Transforming" time on first load.
config.maxWorkers = 10;

// ── 2. Resolver Optimizations ─────────────────────────────────
// Ensure only necessary file extensions are resolved,
// reducing unnecessary filesystem lookups.
config.resolver.sourceExts = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "svg",
  "cjs",
  "mjs",
];

config.resolver.unstable_enablePackageExports = true;

// ── 3. Transformer: Stable & Aggressive Caching ───────────────
// Persist the Metro transform cache across restarts.
// After first bundle, subsequent starts are dramatically faster.
config.transformer.enableBabelRCLookup = false;

// ── 4. Watchman Ignore (Windows Performance) ──────────────────
// Ignore directories that don't need watching to reduce filesystem overhead.
config.watchFolders = [];
config.resolver.blockList = [
  /.*\/__snapshots__\/.*/,
  /.*\/\.git\/.*/,
];

module.exports = config;
