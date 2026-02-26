// ─────────────────────────────────────────────────────────────
// src/data/parkingData.js
// Static configuration: slot labels, map positions, graph edges,
// initial occupancy state.
// ─────────────────────────────────────────────────────────────

/** Human-readable label for each slot id */
export const SLOT_LABELS = {
  "2W-A-1": "A1", "2W-A-2": "A2", "2W-A-3": "A3", "2W-A-4": "A4", "2W-A-5": "A5",
  "2W-B-1": "B1", "2W-B-2": "B2", "2W-B-3": "B3", "2W-B-4": "B4", "2W-B-5": "B5",
  "4W-C-1": "C1", "4W-C-2": "C2", "4W-C-3": "C3", "4W-C-4": "C4",
  "4W-D-1": "D1", "4W-D-2": "D2", "4W-D-3": "D3", "4W-D-4": "D4",
};

/**
 * (x, y) pixel positions for every node on the SVG parking map.
 * viewBox: "0 0 680 490"
 */
export const MAP_POSITIONS = {
  entrance:  { x: 340, y: 430 },

  // Section hubs
  "2W-A":    { x: 110, y: 290 },
  "2W-B":    { x: 110, y: 155 },
  "4W-C":    { x: 570, y: 290 },
  "4W-D":    { x: 570, y: 155 },

  // Zone A slots (two-wheeler)
  "2W-A-1":  { x: 30,  y: 345 }, "2W-A-2": { x: 68,  y: 345 },
  "2W-A-3":  { x: 106, y: 345 }, "2W-A-4": { x: 144, y: 345 }, "2W-A-5": { x: 182, y: 345 },

  // Zone B slots (two-wheeler)
  "2W-B-1":  { x: 30,  y: 100 }, "2W-B-2": { x: 68,  y: 100 },
  "2W-B-3":  { x: 106, y: 100 }, "2W-B-4": { x: 144, y: 100 }, "2W-B-5": { x: 182, y: 100 },

  // Zone C slots (four-wheeler)
  "4W-C-1":  { x: 496, y: 345 }, "4W-C-2": { x: 544, y: 345 },
  "4W-C-3":  { x: 592, y: 345 }, "4W-C-4": { x: 640, y: 345 },

  // Zone D slots (four-wheeler)
  "4W-D-1":  { x: 496, y: 100 }, "4W-D-2": { x: 544, y: 100 },
  "4W-D-3":  { x: 592, y: 100 }, "4W-D-4": { x: 640, y: 100 },
};

/**
 * All graph edges drawn on the map SVG.
 * Each entry is [nodeA, nodeB].
 */
export const MAP_EDGES = [
  // Entrance → section hubs
  ["entrance", "2W-A"], ["entrance", "2W-B"],
  ["entrance", "4W-C"], ["entrance", "4W-D"],

  // Hub ↔ Hub (same vehicle type)
  ["2W-A", "2W-B"], ["4W-C", "4W-D"],

  // Hub → slots (Zone A)
  ["2W-A", "2W-A-1"], ["2W-A", "2W-A-2"], ["2W-A", "2W-A-3"],
  ["2W-A", "2W-A-4"], ["2W-A", "2W-A-5"],

  // Hub → slots (Zone B)
  ["2W-B", "2W-B-1"], ["2W-B", "2W-B-2"], ["2W-B", "2W-B-3"],
  ["2W-B", "2W-B-4"], ["2W-B", "2W-B-5"],

  // Hub → slots (Zone C)
  ["4W-C", "4W-C-1"], ["4W-C", "4W-C-2"],
  ["4W-C", "4W-C-3"], ["4W-C", "4W-C-4"],

  // Hub → slots (Zone D)
  ["4W-D", "4W-D-1"], ["4W-D", "4W-D-2"],
  ["4W-D", "4W-D-3"], ["4W-D", "4W-D-4"],
];

/** Section/Zone hub node ids (not individual slots) */
export const HUB_IDS = ["2W-A", "2W-B", "4W-C", "4W-D"];

/** All individual slot ids */
export const ALL_SLOT_IDS = Object.keys(SLOT_LABELS);

/** All Two-Wheeler slot ids */
export const TW_SLOT_IDS = ALL_SLOT_IDS.filter((id) => id.startsWith("2W-"));

/** All Four-Wheeler slot ids */
export const FW_SLOT_IDS = ALL_SLOT_IDS.filter((id) => id.startsWith("4W-"));

/**
 * Default initial occupancy state.
 * true  = occupied
 * false = free
 */
export const INITIAL_OCCUPIED = {
  "2W-A-1": true,  "2W-A-2": false, "2W-A-3": true,  "2W-A-4": false, "2W-A-5": false,
  "2W-B-1": false, "2W-B-2": true,  "2W-B-3": false, "2W-B-4": true,  "2W-B-5": true,
  "4W-C-1": false, "4W-C-2": true,  "4W-C-3": false, "4W-C-4": false,
  "4W-D-1": true,  "4W-D-2": false, "4W-D-3": true,  "4W-D-4": true,
};

/** Colors used across the app */
export const COLORS = {
  bg:        "#030810",
  surface:   "#040d18",
  border:    "#0c2030",
  accent2W:  "#22d3ee",
  accent4W:  "#fb923c",
  path:      "#22c55e",
  occupied:  "#ef4444",
  muted:     "#334155",
  text:      "#e2e8f0",
  textDim:   "#64748b",
};