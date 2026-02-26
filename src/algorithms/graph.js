// ─────────────────────────────────────────────────────────────
// src/algorithms/graph.js
// Graph data structure + Dijkstra's shortest path algorithm
// ─────────────────────────────────────────────────────────────

/**
 * Weighted undirected graph representing the parking lot layout.
 * Nodes: entrance, zone hubs (2W-A, 2W-B, 4W-C, 4W-D), individual slots.
 * Edge weight = distance units from one node to another.
 */
export const PARKING_GRAPH = {
  entrance:  { "2W-A": 2, "2W-B": 4, "4W-C": 3, "4W-D": 5 },
  "2W-A":    { entrance: 2, "2W-B": 2, "2W-A-1": 1, "2W-A-2": 1, "2W-A-3": 2, "2W-A-4": 2, "2W-A-5": 3 },
  "2W-B":    { entrance: 4, "2W-A": 2, "2W-B-1": 1, "2W-B-2": 1, "2W-B-3": 2, "2W-B-4": 2, "2W-B-5": 3 },
  "4W-C":    { entrance: 3, "4W-D": 2, "4W-C-1": 1, "4W-C-2": 1, "4W-C-3": 2, "4W-C-4": 3 },
  "4W-D":    { entrance: 5, "4W-C": 2, "4W-D-1": 1, "4W-D-2": 1, "4W-D-3": 2, "4W-D-4": 3 },

  // Two-Wheeler Zone A slots
  "2W-A-1":  { "2W-A": 1 }, "2W-A-2": { "2W-A": 1 },
  "2W-A-3":  { "2W-A": 2 }, "2W-A-4": { "2W-A": 2 }, "2W-A-5": { "2W-A": 3 },

  // Two-Wheeler Zone B slots
  "2W-B-1":  { "2W-B": 1 }, "2W-B-2": { "2W-B": 1 },
  "2W-B-3":  { "2W-B": 2 }, "2W-B-4": { "2W-B": 2 }, "2W-B-5": { "2W-B": 3 },

  // Four-Wheeler Zone C slots
  "4W-C-1":  { "4W-C": 1 }, "4W-C-2": { "4W-C": 1 },
  "4W-C-3":  { "4W-C": 2 }, "4W-C-4": { "4W-C": 3 },

  // Four-Wheeler Zone D slots
  "4W-D-1":  { "4W-D": 1 }, "4W-D-2": { "4W-D": 1 },
  "4W-D-3":  { "4W-D": 2 }, "4W-D-4": { "4W-D": 3 },
};

/**
 * Dijkstra's Algorithm
 * Finds shortest path from `start` to `end` in the parking graph.
 *
 * @param {Object} graph  - Adjacency list with weights
 * @param {string} start  - Source node (e.g. "entrance")
 * @param {string} end    - Destination node (e.g. "2W-A-2")
 * @returns {{ path: string[], dist: number }}
 */
export function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const nodes = Object.keys(graph);

  // Initialize distances to Infinity
  nodes.forEach((n) => {
    dist[n] = Infinity;
    prev[n] = null;
  });
  dist[start] = 0;

  while (true) {
    // Pick unvisited node with smallest distance
    let u = null;
    nodes.forEach((n) => {
      if (!visited.has(n) && (u === null || dist[n] < dist[u])) u = n;
    });

    if (u === null || dist[u] === Infinity || u === end) break;
    visited.add(u);

    // Relax neighbours
    const neighbours = graph[u] || {};
    Object.entries(neighbours).forEach(([v, weight]) => {
      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    });
  }

  // Reconstruct path
  const path = [];
  let cur = end;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  if (path[0] !== start) return { path: [], dist: Infinity };
  return { path, dist: dist[end] };
}

/**
 * Among all emptySlots, find the one with the shortest path from entrance.
 *
 * @param {Array}  emptySlots  - Array of SlotNode objects (from tree.js)
 * @param {Object} graph       - PARKING_GRAPH
 * @returns {{ path: string[], dist: number, slot: SlotNode|null }}
 */
export function findShortestSlot(emptySlots, graph = PARKING_GRAPH) {
  let best = { path: [], dist: Infinity, slot: null };

  emptySlots.forEach((slot) => {
    if (!graph[slot.id]) return; // slot not in graph
    const result = dijkstra(graph, "entrance", slot.id);
    if (result.dist < best.dist) {
      best = { ...result, slot };
    }
  });

  return best;
}

/**
 * Rank ALL empty slots by distance from entrance.
 *
 * @param {Array}  emptySlots
 * @param {Object} graph
 * @returns {Array<{ slot, path, dist }>} sorted ascending by dist
 */
export function rankAllEmptySlots(emptySlots, graph = PARKING_GRAPH) {
  return emptySlots
    .map((slot) => {
      if (!graph[slot.id]) return { slot, path: [], dist: Infinity };
      const result = dijkstra(graph, "entrance", slot.id);
      return { slot, ...result };
    })
    .sort((a, b) => a.dist - b.dist);
}