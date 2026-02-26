// ─────────────────────────────────────────────────────────────
// src/components/SlotCard.js
// Reusable card that displays a single parking slot's status.
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { COLORS } from "../data/parkingData";

/**
 * SlotCard
 *
 * Props:
 *   label        {string}   - Short display label, e.g. "A1"
 *   slotId       {string}   - Full id, e.g. "2W-A-1"
 *   vehicleType  {string}   - "2W" | "4W"
 *   isOccupied   {boolean}
 *   isTarget     {boolean}  - Highlighted as shortest-path target
 *   distance     {number}   - Distance units from entrance (optional)
 *   onPress      {Function} - Callback when card is tapped
 */
const SlotCard = ({
  label,
  slotId,
  vehicleType,
  isOccupied,
  isTarget = false,
  distance,
  onPress,
}) => {
  const isTW = vehicleType === "2W";
  const accent = isTW ? COLORS.accent2W : COLORS.accent4W;

  const borderColor = isTarget
    ? COLORS.path
    : isOccupied
    ? COLORS.occupied
    : accent;

  const bgColor = isTarget
    ? "#052e1c"
    : isOccupied
    ? "#1c0000"
    : isTW
    ? "#04131f"
    : "#1a0800";

  const labelColor = isTarget
    ? COLORS.path
    : isOccupied
    ? COLORS.occupied
    : accent;

  return (
    <TouchableOpacity
      onPress={!isOccupied ? onPress : undefined}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          borderColor,
          backgroundColor: bgColor,
          borderWidth: isTarget ? 2 : 1.5,
        },
      ]}
    >
      {/* Status indicator dot */}
      <View
        style={[
          styles.dot,
          {
            backgroundColor: isTarget
              ? COLORS.path
              : isOccupied
              ? COLORS.occupied
              : accent,
          },
        ]}
      />

      {/* Slot label */}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>

      {/* Slot id (small) */}
      <Text style={styles.slotId}>{slotId}</Text>

      {/* Distance badge */}
      {distance !== undefined && (
        <View style={[styles.badge, { borderColor: `${accent}44` }]}>
          <Text style={[styles.badgeText, { color: accent }]}>
            {distance}u
          </Text>
        </View>
      )}

      {/* Occupied overlay text */}
      {isOccupied && (
        <Text style={styles.occupiedTag}>TAKEN</Text>
      )}

      {/* Best slot star */}
      {isTarget && (
        <Text style={styles.star}>★</Text>
      )}
    </TouchableOpacity>
  );
};

export default SlotCard;

const styles = StyleSheet.create({
  card: {
    width: 80,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    margin: 6,
    position: "relative",
    overflow: "hidden",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  slotId: {
    fontSize: 9,
    color: COLORS.muted,
    fontFamily: "monospace",
    marginTop: 2,
    textAlign: "center",
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  occupiedTag: {
    position: "absolute",
    bottom: 4,
    right: 4,
    fontSize: 7,
    color: COLORS.occupied,
    fontFamily: "monospace",
    letterSpacing: 1,
    opacity: 0.7,
  },
  star: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 12,
    color: COLORS.path,
  },
});