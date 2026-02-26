// ─────────────────────────────────────────────────────────────
// src/storage/BookingStorage.js
// AsyncStorage wrapper — persists booking history & occupancy state
// ─────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { INITIAL_OCCUPIED } from "../data/parkingData";

const KEYS = {
  OCCUPIED:  "smartpark:occupied",
  HISTORY:   "smartpark:history",
  COUNTER:   "smartpark:counter",
};

// ── Occupancy ─────────────────────────────────────────────────

/**
 * Load persisted occupancy map.
 * Falls back to INITIAL_OCCUPIED if nothing stored yet.
 */
export async function loadOccupied() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OCCUPIED);
    return raw ? JSON.parse(raw) : { ...INITIAL_OCCUPIED };
  } catch (e) {
    console.warn("loadOccupied error:", e);
    return { ...INITIAL_OCCUPIED };
  }
}

/**
 * Persist the full occupancy map.
 * @param {Object} occupiedMap  { slotId: boolean }
 */
export async function saveOccupied(occupiedMap) {
  try {
    await AsyncStorage.setItem(KEYS.OCCUPIED, JSON.stringify(occupiedMap));
  } catch (e) {
    console.warn("saveOccupied error:", e);
  }
}

/**
 * Mark a single slot as occupied/free and persist.
 * @param {Object} currentMap
 * @param {string} slotId
 * @param {boolean} occupied
 * @returns {Object} updated map
 */
export async function updateSlot(currentMap, slotId, occupied) {
  const updated = { ...currentMap, [slotId]: occupied };
  await saveOccupied(updated);
  return updated;
}

// ── Booking History ───────────────────────────────────────────

/**
 * Load full booking history array.
 * @returns {Array<BookingRecord>}
 */
export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("loadHistory error:", e);
    return [];
  }
}

/**
 * Append a new booking record to history.
 *
 * @param {{
 *   slotId:       string,
 *   slotLabel:    string,
 *   vehicleType:  "2W" | "4W",
 *   path:         string[],
 *   distance:     number,
 *   vehicleNumber: string,
 * }} booking
 * @returns {Array<BookingRecord>} updated history
 */
export async function addBooking(booking) {
  try {
    const history = await loadHistory();
    const counter = await getCounter();
    const record = {
      id: `BK${String(counter).padStart(4, "0")}`,
      ...booking,
      bookedAt: new Date().toISOString(),
      status: "active",  // "active" | "released"
    };
    const updated = [record, ...history];
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    await incrementCounter();
    return updated;
  } catch (e) {
    console.warn("addBooking error:", e);
    return [];
  }
}

/**
 * Release a booking (mark status as "released", free the slot).
 * @param {string} bookingId
 * @param {Object} currentOccupied
 * @returns {{ history: Array, occupied: Object }}
 */
export async function releaseBooking(bookingId, currentOccupied) {
  try {
    const history = await loadHistory();
    const record = history.find((b) => b.id === bookingId);
    if (!record) return { history, occupied: currentOccupied };

    const updatedHistory = history.map((b) =>
      b.id === bookingId
        ? { ...b, status: "released", releasedAt: new Date().toISOString() }
        : b
    );
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedHistory));

    // Free the slot
    const updatedOccupied = await updateSlot(currentOccupied, record.slotId, false);
    return { history: updatedHistory, occupied: updatedOccupied };
  } catch (e) {
    console.warn("releaseBooking error:", e);
    return { history: [], occupied: currentOccupied };
  }
}

/**
 * Clear all storage (for dev/admin reset).
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.multiRemove([KEYS.OCCUPIED, KEYS.HISTORY, KEYS.COUNTER]);
  } catch (e) {
    console.warn("clearAllStorage error:", e);
  }
}

// ── Helpers ───────────────────────────────────────────────────

async function getCounter() {
  const raw = await AsyncStorage.getItem(KEYS.COUNTER);
  return raw ? parseInt(raw, 10) : 1;
}

async function incrementCounter() {
  const c = await getCounter();
  await AsyncStorage.setItem(KEYS.COUNTER, String(c + 1));
}