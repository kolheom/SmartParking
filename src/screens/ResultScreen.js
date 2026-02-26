// ─────────────────────────────────────────────────────────────
// src/screens/ResultScreen.js
// Shows shortest path, parking map SVG, all empty slots ranked,
// and allows user to confirm booking.
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import Svg, { Rect, Circle, Line, Text as SvgText, G } from "react-native-svg";
import { addBooking, updateSlot } from "../storage/BookingStorage";
import { SLOT_LABELS, MAP_POSITIONS, MAP_EDGES, COLORS, PARKING_GRAPH } from "../data/parkingData";

// ── Helpers ───────────────────────────────────────────────────

function isPathEdge(path, a, b) {
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === a && path[i + 1] === b) ||
        (path[i] === b && path[i + 1] === a)) return true;
  }
  return false;
}

// ── Component ─────────────────────────────────────────────────

export default function ResultScreen({ route, navigation }) {
  const { vehicleType, vehicleNumber, shortest, ranked, occupied: initOccupied } = route.params;
  const [occupied, setOccupied] = useState(initOccupied);
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(false);

  const pathSet = new Set(shortest?.path || []);
  const isTW = vehicleType === "2W";
  const accent = isTW ? COLORS.accent2W : COLORS.accent4W;

  const HUB_IDS = ["2W-A", "2W-B", "4W-C", "4W-D"];
  const SLOT_IDS = Object.keys(SLOT_LABELS);

  async function handleConfirm() {
    if (!shortest?.slot) return;
    setLoading(true);
    try {
      const updatedOcc = await updateSlot(occupied, shortest.slot.id, true);
      setOccupied(updatedOcc);
      await addBooking({
        slotId: shortest.slot.id,
        slotLabel: SLOT_LABELS[shortest.slot.id],
        vehicleType,
        vehicleNumber,
        path: shortest.path,
        distance: shortest.dist,
      });
      setAssigned(true);
    } catch (e) {
      Alert.alert("Error", "Could not confirm booking.");
      console.error(e);
    }
    setLoading(false);
  }

  function handleDone() {
    navigation.navigate("Home");
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>

      {/* ── Shortest Path ──────────────────────────────────── */}
      <Text style={styles.sectionLabel}>⚡ SHORTEST PATH · DIJKSTRA</Text>
      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.pathRow}>
            {shortest?.path?.map((node, i) => {
              const isE = node === "entrance";
              const isT = node === shortest?.slot?.id;
              return (
                <View key={node} style={styles.pathStep}>
                  <View style={[styles.pathNode, {
                    backgroundColor: isT ? "#052e1c" : isE ? "#0a1f35" : "#0c1a2e",
                    borderColor: isT ? COLORS.path : isE ? COLORS.accent2W : "#818cf833",
                  }]}>
                    <Text style={[styles.pathNodeText, {
                      color: isT ? COLORS.path : isE ? COLORS.accent2W : "#818cf8",
                    }]}>
                      {isE ? "🚪 ENT" : isT ? `🎯 ${SLOT_LABELS[node] || node}` : node}
                    </Text>
                  </View>
                  {i < shortest.path.length - 1 && (
                    <Text style={styles.pathArrow}>→</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View style={styles.distRow}>
          <Text style={styles.distLabel}>TOTAL DISTANCE</Text>
          <Text style={styles.distVal}>{shortest?.dist} units</Text>
        </View>
      </View>

      {/* ── Target Slot ────────────────────────────────────── */}
      {shortest?.slot && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>🎯 RECOMMENDED SLOT</Text>
          <View style={styles.targetRow}>
            <View style={styles.slotBadge}>
              <Text style={styles.slotBadgeText}>{SLOT_LABELS[shortest.slot.id]}</Text>
            </View>
            <View>
              <Text style={styles.slotId}>{shortest.slot.id}</Text>
              <Text style={styles.slotType}>{isTW ? "🛵 Two Wheeler" : "🚗 Four Wheeler"}</Text>
              <Text style={styles.slotDist}>📍 {shortest.dist} units from entrance</Text>
              <Text style={styles.vehicleNum}>🚘 {vehicleNumber}</Text>
            </View>
          </View>

          {!assigned ? (
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.confirmBtn}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.path} />
              ) : (
                <Text style={styles.confirmBtnText}>✅ CONFIRM PARKING</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.successBadge}>
                <Text style={styles.successText}>✅ PARKED SUCCESSFULLY</Text>
              </View>
              <TouchableOpacity onPress={handleDone} activeOpacity={0.85} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>← BACK TO HOME</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* ── Map ────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>🗺 PARKING MAP</Text>
      <View style={styles.mapCard}>
        <Svg viewBox="0 0 680 490" width="100%" height={240}>
          {/* Zone backgrounds */}
          <Rect x={5} y={75} width={215} height={310} rx={14} fill="#050e1c" stroke="#22d3ee18" strokeWidth={1.5} />
          <Rect x={460} y={75} width={215} height={310} rx={14} fill="#140800" stroke="#fb923c18" strokeWidth={1.5} />
          <SvgText x={112} y={97} textAnchor="middle" fill="#22d3ee30" fontSize={10}>TWO WHEELER</SvgText>
          <SvgText x={567} y={97} textAnchor="middle" fill="#fb923c30" fontSize={10}>FOUR WHEELER</SvgText>

          {/* Edges */}
          {MAP_EDGES.map(([a, b]) => {
            const pa = MAP_POSITIONS[a], pb = MAP_POSITIONS[b];
            if (!pa || !pb) return null;
            const ip = isPathEdge(shortest?.path || [], a, b);
            return (
              <Line key={`${a}-${b}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={ip ? COLORS.path : "#1e3a5a"}
                strokeWidth={ip ? 3 : 1}
                strokeDasharray={ip ? "8 4" : "none"}
                opacity={ip ? 1 : 0.5}
              />
            );
          })}

          {/* Hub nodes */}
          {HUB_IDS.map((id) => {
            const pos = MAP_POSITIONS[id]; if (!pos) return null;
            const ip = pathSet.has(id);
            const c = id.startsWith("2W") ? COLORS.accent2W : COLORS.accent4W;
            return (
              <G key={id}>
                <Circle cx={pos.x} cy={pos.y} r={22}
                  fill={ip ? "#052e1c" : "#050d18"}
                  stroke={ip ? COLORS.path : c} strokeWidth={ip ? 2.5 : 1.5} />
                <SvgText x={pos.x} y={pos.y + 4} textAnchor="middle"
                  fill={ip ? COLORS.path : c} fontSize={9}>{id}</SvgText>
              </G>
            );
          })}

          {/* Slot nodes */}
          {SLOT_IDS.map((id) => {
            const pos = MAP_POSITIONS[id]; if (!pos) return null;
            const isT = id === shortest?.slot?.id;
            const occ = occupied[id];
            const tw = id.startsWith("2W");
            const c = isT ? COLORS.path : occ ? COLORS.occupied : (tw ? COLORS.accent2W : COLORS.accent4W);
            const bg = isT ? "#052e1c" : occ ? "#1c0000" : (tw ? "#04131f" : "#1a0800");
            const w = tw ? 28 : 36, h = tw ? 20 : 24;
            return (
              <G key={id}>
                <Rect x={pos.x - w / 2} y={pos.y - h / 2} width={w} height={h} rx={5}
                  fill={bg} stroke={c} strokeWidth={isT ? 2 : 1.5} />
                <SvgText x={pos.x} y={pos.y + 4} textAnchor="middle"
                  fill={c} fontSize={8}>{SLOT_LABELS[id]}</SvgText>
              </G>
            );
          })}

          {/* Entrance */}
          {(() => {
            const pos = MAP_POSITIONS["entrance"]; if (!pos) return null;
            const ip = pathSet.has("entrance");
            return (
              <G>
                <Rect x={pos.x - 38} y={pos.y - 14} width={76} height={28} rx={8}
                  fill={ip ? "#052e1c" : "#05101a"}
                  stroke={ip ? COLORS.path : COLORS.accent2W} strokeWidth={ip ? 2 : 1.5} />
                <SvgText x={pos.x} y={pos.y + 4} textAnchor="middle"
                  fill={ip ? COLORS.path : COLORS.accent2W} fontSize={9}>🚪 ENTRANCE</SvgText>
              </G>
            );
          })()}
        </Svg>
      </View>

      {/* ── All Slots Ranked ───────────────────────────────── */}
      <Text style={styles.sectionLabel}>📋 ALL EMPTY SLOTS — RANKED</Text>
      <View style={styles.card}>
        {ranked.map((item, i) => {
          const isBest = item.slot.id === shortest?.slot?.id;
          return (
            <View key={item.slot.id} style={[styles.rankRow, {
              backgroundColor: isBest ? "#052e1c" : "#060f1c",
              borderColor: isBest ? `${COLORS.path}44` : COLORS.border,
            }]}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
              <View style={[styles.rankBadge, { borderColor: isBest ? `${COLORS.path}44` : COLORS.border }]}>
                <Text style={[styles.rankBadgeText, { color: isBest ? COLORS.path : COLORS.textDim }]}>
                  {SLOT_LABELS[item.slot.id]}
                </Text>
              </View>
              <View style={styles.rankMeta}>
                <Text style={[styles.rankId, { color: isBest ? `${COLORS.path}88` : COLORS.muted }]}>
                  {item.slot.id}
                </Text>
                <View style={styles.distBar}>
                  <View style={[styles.distBarFill, {
                    backgroundColor: isBest ? COLORS.path : "#1e3a5a",
                    width: `${Math.max(10, Math.min(100, 100 - item.dist * 8))}%`,
                  }]} />
                </View>
              </View>
              <Text style={[styles.rankDist, { color: isBest ? COLORS.path : COLORS.muted }]}>
                {item.dist}u
              </Text>
              {isBest && <Text style={styles.rankStar}>⭐</Text>}
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 9, fontFamily: "monospace", letterSpacing: 3,
    color: COLORS.muted, marginBottom: 10, fontWeight: "700",
  },
  card: {
    backgroundColor: "#060f1c", borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 14, marginBottom: 16,
  },

  // Path
  pathRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  pathStep: { flexDirection: "row", alignItems: "center", gap: 6 },
  pathNode: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  pathNodeText: { fontSize: 10, fontFamily: "monospace", fontWeight: "600" },
  pathArrow: { color: "#1e3a5a", fontSize: 14 },
  distRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingTop: 10, borderTopWidth: 1, borderColor: COLORS.border,
  },
  distLabel: { fontSize: 10, fontFamily: "monospace", color: COLORS.muted },
  distVal: { fontSize: 15, fontFamily: "monospace", color: COLORS.path, fontWeight: "700" },

  // Target slot
  targetRow: { flexDirection: "row", gap: 16, marginBottom: 16, alignItems: "center" },
  slotBadge: {
    width: 64, height: 64, borderRadius: 14, backgroundColor: "#052e1c",
    borderWidth: 2, borderColor: COLORS.path,
    alignItems: "center", justifyContent: "center",
  },
  slotBadgeText: { fontSize: 22, fontWeight: "800", fontFamily: "monospace", color: COLORS.path },
  slotId: { fontSize: 11, fontFamily: "monospace", color: COLORS.muted },
  slotType: { fontSize: 13, color: COLORS.text, marginTop: 3 },
  slotDist: { fontSize: 11, color: COLORS.path, fontFamily: "monospace", marginTop: 3 },
  vehicleNum: { fontSize: 12, color: COLORS.accent2W, fontFamily: "monospace", marginTop: 3 },
  confirmBtn: {
    backgroundColor: "#052e1c", borderWidth: 2, borderColor: COLORS.path,
    borderRadius: 10, padding: 14, alignItems: "center",
  },
  confirmBtnText: { color: COLORS.path, fontWeight: "800", fontFamily: "monospace", letterSpacing: 2 },
  successBadge: {
    backgroundColor: "#052e1c", borderWidth: 1, borderColor: `${COLORS.path}44`,
    borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 10,
  },
  successText: { color: COLORS.path, fontWeight: "700", fontFamily: "monospace", letterSpacing: 2 },
  doneBtn: {
    backgroundColor: "#0a1929", borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 12, alignItems: "center",
  },
  doneBtnText: { color: COLORS.textDim, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 },

  // Map
  mapCard: {
    backgroundColor: "#040d18", borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 10, marginBottom: 16, overflow: "hidden",
  },

  // Ranked list
  rankRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6,
  },
  rankNum: { fontSize: 10, fontFamily: "monospace", color: COLORS.muted, width: 20 },
  rankBadge: {
    width: 32, height: 32, borderRadius: 6, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  rankBadgeText: { fontSize: 11, fontWeight: "700", fontFamily: "monospace" },
  rankMeta: { flex: 1 },
  rankId: { fontSize: 10, fontFamily: "monospace", marginBottom: 4 },
  distBar: { height: 3, backgroundColor: "#0c2030", borderRadius: 2, overflow: "hidden" },
  distBarFill: { height: "100%", borderRadius: 2 },
  rankDist: { fontSize: 11, fontFamily: "monospace", fontWeight: "600" },
  rankStar: { fontSize: 12 },
});