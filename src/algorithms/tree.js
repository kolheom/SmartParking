// ─────────────────────────────────────────────────────────────
// src/algorithms/tree.js
// Parking lot tree: Root → Section → Zone → Slot
// ─────────────────────────────────────────────────────────────

/**
 * A single node in the parking tree.
 */
export class SlotNode {
  constructor(id, label, type = "slot", parentId = null) {
    this.id = id;
    this.label = label;
    this.type = type;       // "root" | "section" | "subsection" | "slot"
    this.parentId = parentId;
    this.children = [];
    this.isOccupied = false;
    this.vehicleType = null; // "2W" | "4W"
  }
}

/**
 * Build the full parking tree.
 * Structure:
 *   root
 *   ├── 2W  (Two Wheeler section)
 *   │   ├── 2W-A  (Zone A — 5 slots)
 *   │   └── 2W-B  (Zone B — 5 slots)
 *   └── 4W  (Four Wheeler section)
 *       ├── 4W-C  (Zone C — 4 slots)
 *       └── 4W-D  (Zone D — 4 slots)
 *
 * @param {Object} occupiedMap  key: slotId, value: boolean (isOccupied)
 * @returns {SlotNode} root node
 */
export function buildParkingTree(occupiedMap = {}) {
  const root = new SlotNode("root", "Parking Complex", "root");

  // ── Two Wheeler Section ───────────────────────────────────
  const tw = new SlotNode("2W", "Two Wheelers 🛵", "section", "root");
  const twA = new SlotNode("2W-A", "Zone A", "subsection", "2W");
  const twB = new SlotNode("2W-B", "Zone B", "subsection", "2W");

  for (let i = 1; i <= 5; i++) {
    const slot = new SlotNode(`2W-A-${i}`, `A${i}`, "slot", "2W-A");
    slot.vehicleType = "2W";
    slot.isOccupied = occupiedMap[`2W-A-${i}`] ?? [1, 3].includes(i);
    twA.children.push(slot);
  }
  for (let i = 1; i <= 5; i++) {
    const slot = new SlotNode(`2W-B-${i}`, `B${i}`, "slot", "2W-B");
    slot.vehicleType = "2W";
    slot.isOccupied = occupiedMap[`2W-B-${i}`] ?? [2, 4, 5].includes(i);
    twB.children.push(slot);
  }
  tw.children.push(twA, twB);

  // ── Four Wheeler Section ──────────────────────────────────
  const fw = new SlotNode("4W", "Four Wheelers 🚗", "section", "root");
  const fwC = new SlotNode("4W-C", "Zone C", "subsection", "4W");
  const fwD = new SlotNode("4W-D", "Zone D", "subsection", "4W");

  for (let i = 1; i <= 4; i++) {
    const slot = new SlotNode(`4W-C-${i}`, `C${i}`, "slot", "4W-C");
    slot.vehicleType = "4W";
    slot.isOccupied = occupiedMap[`4W-C-${i}`] ?? [2].includes(i);
    fwC.children.push(slot);
  }
  for (let i = 1; i <= 4; i++) {
    const slot = new SlotNode(`4W-D-${i}`, `D${i}`, "slot", "4W-D");
    slot.vehicleType = "4W";
    slot.isOccupied = occupiedMap[`4W-D-${i}`] ?? [1, 3, 4].includes(i);
    fwD.children.push(slot);
  }
  fw.children.push(fwC, fwD);

  root.children.push(tw, fw);
  return root;
}

/**
 * DFS traversal — collect all empty slots matching vehicleType.
 *
 * @param {SlotNode} node
 * @param {string}   vehicleType  "2W" | "4W"
 * @param {Array}    result
 * @returns {SlotNode[]}
 */
export function findEmptySlots(node, vehicleType, result = []) {
  if (
    node.type === "slot" &&
    !node.isOccupied &&
    node.vehicleType === vehicleType
  ) {
    result.push(node);
  }
  node.children.forEach((child) => findEmptySlots(child, vehicleType, result));
  return result;
}

/**
 * Flatten tree into a flat id→node map for O(1) lookup.
 *
 * @param {SlotNode} node
 * @param {Object}   map
 * @returns {Object}
 */
export function flattenTree(node, map = {}) {
  map[node.id] = node;
  node.children.forEach((child) => flattenTree(child, map));
  return map;
}

/**
 * Count free slots per section from the tree.
 *
 * @param {SlotNode} root
 * @returns {{ twoWheeler: number, fourWheeler: number }}
 */
export function countFreeSlots(root) {
  let twoWheeler = 0;
  let fourWheeler = 0;

  function dfs(node) {
    if (node.type === "slot" && !node.isOccupied) {
      if (node.vehicleType === "2W") twoWheeler++;
      else if (node.vehicleType === "4W") fourWheeler++;
    }
    node.children.forEach(dfs);
  }

  dfs(root);
  return { twoWheeler, fourWheeler };
}