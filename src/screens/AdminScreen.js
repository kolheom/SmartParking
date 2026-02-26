// ─────────────────────────────────────────────────────────────
// src/screens/AdminScreen.js
// Admin panel — toggle individual slot states, reset all data,
// view live tree & graph stats.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch, ActivityIndicator,
} from "react-native";
import {
  loadOccupied, saveOccupied, clearAllStorage,
} from "../storage/BookingStorage";
import { buildParkingTree, countFreeSlots } from "../algorithms/tree";
import { SLOT_LABELS, ALL_SLOT_IDS, TW_SLOT_IDS, FW_SLOT_IDS, COLORS, INITIAL_OCCUPIED } from "../data/parkingData";

export default function AdminScreen() {
  const [occupied, setOccupied] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [stats, setStats] = useState({ twoWheeler: 0, fourWheeler: 0 });

  const fetchData = useCallback(async () => {
    const occ = await loadOccupied();
    setOccupied(occ);
    const tree = buildParkingTree(occ);
    setStats(countFreeSlots(tree));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, []);

  async function toggleSlot(slotId) {
    setSaving(slotId);
    const updated = { ...occupied, [slotId]: !occupied[slotId] };
    await saveOccupied(updated);
    setOccupied(updated);
    const tree = buildParkingTree(updated);
    setStats(countFreeSlots(tree));
    setSaving(null);
  }

  async function handleReset() {
    Alert.alert(
      "Reset All Data",
      "This will clear all bookings and reset slot states to default. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearAllStorage();
            await fetchData();
            Alert.alert("Done", "All data has been reset.");
          },
        },
      ]
    );
  }

  async function handleFillAll() {
    const allOcc = {};
    ALL_SLOT_IDS.forEach((id) => { allOcc[id] = true; });
    await saveOccupied(allOcc);
    setOccupied(allOcc);
    setStats({ twoWheeler: 0, fourWheeler: 0 });
  }

  async function handleFreeAll() {
    const allFree = {};
    ALL_SLOT_IDS.forEach((id) => { allFree[id] = false; });
    await saveOccupied(allFree);
    setOccupied(allFree);
    const tree = buildParkingTree(allFree);
    setStats(countFreeSlots(tree));
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={COLORS.path} size="large" /></View>;
  }

  const totalFree = stats.twoWheeler + stats.fourWheeler;
  const totalSlots = ALL_SLOT_IDS.length;
  const occupancyPct = Math.round(((totalSlots - totalFree) / totalSlots) * 100);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <Text style={styles.sectionLabel}>🔧 ADMIN PANEL</Text>

      {/* Live Stats */}
      <View style={styles.statsRow}>
        <StatBox label="Total Slots" val={totalSlots} color={COLORS.text} />
        <StatBox label="Free" val={totalFree} color={COLORS.path} />
        <StatBox label="Occupied" val={totalSlots - totalFree} color={COLORS.occupied} />
        <StatBox label="Fill %" val={`${occupancyPct}%`} color={COLORS.accent4W} />
      </View>

      {/* Occupancy Bar */}
      <View style={styles.occBar}>
        <View style={[styles.occBarFill, {
          width: `${occupancyPct}%`,
          backgroundColor: occupancyPct > 80 ? COLORS.occupied : occupancyPct > 50 ? COLORS.accent4W : COLORS.path,
        }]} />
      </View>
      <Text style={styles.occLabel}>{occupancyPct}% occupied</Text>

      {/* Bulk Actions */}
      <Text style={styles.sectionLabel}>BULK ACTIONS</Text>
      <View style={styles.bulkRow}>
        <ActionBtn label="Free All" color={COLORS.path} onPress={handleFreeAll} />
        <ActionBtn label="Fill All" color={COLORS.occupied} onPress={handleFillAll} />
        <ActionBtn label="Reset Default" color={COLORS.accent4W} onPress={handleReset} />
      </View>

      {/* Two Wheeler Slots */}
      <Text style={styles.sectionLabel}>🛵 TWO WHEELER SLOTS</Text>
      <View style={styles.slotGrid}>
        {TW_SLOT_IDS.map((id) => (
          <SlotToggle
            key={id}
            id={id}
            label={SLOT_LABELS[id]}
            occupied={occupied[id]}
            saving={saving === id}
            color={COLORS.accent2W}
            onToggle={() => toggleSlot(id)}
          />
        ))}
      </View>

      {/* Four Wheeler Slots */}
      <Text style={styles.sectionLabel}>🚗 FOUR WHEELER SLOTS</Text>
      <View style={styles.slotGrid}>
        {FW_SLOT_IDS.map((id) => (
          <SlotToggle
            key={id}
            id={id}
            label={SLOT_LABELS[id]}
            occupied={occupied[id]}
            saving={saving === id}
            color={COLORS.accent4W}
            onToggle={() => toggleSlot(id)}
          />
        ))}
      </View>

      {/* Danger Zone */}
      <Text style={[styles.sectionLabel, { color: COLORS.occupied }]}>⚠️ DANGER ZONE</Text>
      <TouchableOpacity onPress={handleReset} activeOpacity={0.85} style={styles.dangerBtn}>
        <Text style={styles.dangerBtnText}>🗑 CLEAR ALL BOOKINGS & RESET</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatBox({ label, val, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statVal, { color }]}>{val}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({ label, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={[styles.bulkBtn, { borderColor: `${color}44`, backgroundColor: `${color}11` }]}>
      <Text style={[styles.bulkBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SlotToggle({ id, label, occupied, saving, color, onToggle }) {
  return (
    <View style={[styles.slotRow, { borderColor: occupied ? `${COLORS.occupied}44` : `${color}33` }]}>
      <View style={[styles.slotDot, { backgroundColor: occupied ? COLORS.occupied : color }]} />
      <Text style={[styles.slotLabel, { color: occupied ? COLORS.occupied : color }]}>{label}</Text>
      <Text style={styles.slotId}>{id}</Text>
      {saving
        ? <ActivityIndicator size="small" color={color} />
        : <Switch
            value={occupied}
            onValueChange={onToggle}
            trackColor={{ false: "#0c2030", true: `${COLORS.occupied}88` }}
            thumbColor={occupied ? COLORS.occupied : color}
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" },
  sectionLabel: { fontSize: 9, fontFamily: "monospace", letterSpacing: 3, color: COLORS.muted, marginBottom: 12, marginTop: 8, fontWeight: "700" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: "#060f1c", borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, alignItems: "center" },
  statVal: { fontSize: 20, fontWeight: "800", fontFamily: "monospace" },
  statLabel: { fontSize: 9, color: COLORS.muted, fontFamily: "monospace", marginTop: 3, letterSpacing: 1 },

  occBar: { height: 6, backgroundColor: "#0c2030", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  occBarFill: { height: "100%", borderRadius: 3 },
  occLabel: { fontSize: 10, color: COLORS.muted, fontFamily: "monospace", textAlign: "right", marginBottom: 20 },

  bulkRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  bulkBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  bulkBtnText: { fontSize: 10, fontFamily: "monospace", fontWeight: "700" },

  slotGrid: { gap: 8, marginBottom: 20 },
  slotRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#060f1c", borderRadius: 10, borderWidth: 1, padding: 12,
  },
  slotDot: { width: 10, height: 10, borderRadius: 5 },
  slotLabel: { fontSize: 16, fontWeight: "800", fontFamily: "monospace", width: 28 },
  slotId: { flex: 1, fontSize: 10, color: COLORS.muted, fontFamily: "monospace" },

  dangerBtn: {
    backgroundColor: "#1c0000", borderWidth: 1, borderColor: `${COLORS.occupied}44`,
    borderRadius: 12, padding: 16, alignItems: "center",
  },
  dangerBtnText: { color: COLORS.occupied, fontFamily: "monospace", fontWeight: "700", letterSpacing: 1, fontSize: 12 },
});