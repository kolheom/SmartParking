// ─────────────────────────────────────────────────────────────
// src/screens/HomeScreen.js
// Landing screen — shows free slot counts and navigation options
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator,
} from "react-native";
import { loadOccupied } from "../storage/BookingStorage";
import { buildParkingTree, countFreeSlots } from "../algorithms/tree";
import { COLORS } from "../data/parkingData";

export default function HomeScreen({ navigation }) {
  const [free, setFree] = useState({ twoWheeler: 0, fourWheeler: 0 });
  const [loading, setLoading] = useState(true);

  // Refresh counts every time this screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchCounts);
    return unsubscribe;
  }, [navigation]);

  async function fetchCounts() {
    setLoading(true);
    const occupied = await loadOccupied();
    const root = buildParkingTree(occupied);
    setFree(countFreeSlots(root));
    setLoading(false);
  }

  const menuItems = [
    {
      icon: "🛵",
      label: "Find Parking",
      sub: "Shortest path to empty slot",
      screen: "Vehicle",
      color: COLORS.accent2W,
    },
    {
      icon: "📋",
      label: "Booking History",
      sub: "View & release bookings",
      screen: "History",
      color: "#818cf8",
    },
    {
      icon: "⛽",
      label: "Nearby Fuel",
      sub: "Find fuel stations",
      screen: "Fuel",
      color: "#fbbf24",
    },
    {
      icon: "🔧",
      label: "Admin Panel",
      sub: "Manage slots & reset data",
      screen: "Admin",
      color: "#f472b6",
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#030810" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>🅿</Text>
          </View>
          <Text style={styles.heroTitle}>SMART PARKING</Text>
          <Text style={styles.heroSub}>
            Dijkstra · Graph · Tree Structure
          </Text>
        </View>

        {/* Availability Cards */}
        <View style={styles.statsRow}>
          <StatCard
            icon="🛵"
            label="Two Wheeler"
            count={loading ? "—" : free.twoWheeler}
            color={COLORS.accent2W}
          />
          <StatCard
            icon="🚗"
            label="Four Wheeler"
            count={loading ? "—" : free.fourWheeler}
            color={COLORS.accent4W}
          />
        </View>

        {loading && <ActivityIndicator color={COLORS.path} style={{ marginBottom: 20 }} />}

        {/* Menu */}
        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.8}
            style={[styles.menuRow, { borderColor: `${item.color}33` }]}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={[styles.arrow, { color: `${item.color}88` }]}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Algo info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works</Text>
          {[
            ["🌳", "Tree", "Parking hierarchy: Root → Section → Zone → Slot"],
            ["🕸", "Graph", "Weighted edges connect zones to entrance"],
            ["⚡", "Dijkstra", "Finds nearest empty slot via shortest path"],
          ].map(([icon, title, desc]) => (
            <View key={title} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{icon}</Text>
              <View>
                <Text style={styles.infoLabel}>{title}</Text>
                <Text style={styles.infoDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, count, color }) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}44` }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statSub, { color: `${color}88` }]}>slots free</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  // Hero
  hero: { alignItems: "center", marginBottom: 28, marginTop: 8 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: "#0a1f35", borderWidth: 2, borderColor: `${COLORS.accent2W}44`,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  logoText: { fontSize: 34 },
  heroTitle: {
    fontSize: 26, fontWeight: "800", color: COLORS.text,
    letterSpacing: 6, marginBottom: 6,
  },
  heroSub: { fontSize: 11, color: COLORS.muted, fontFamily: "monospace", letterSpacing: 2 },

  // Stats
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: "#060f1c", borderRadius: 14, borderWidth: 1,
    padding: 18, alignItems: "center",
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statCount: { fontSize: 36, fontWeight: "800", fontFamily: "monospace" },
  statLabel: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginTop: 4 },
  statSub: { fontSize: 11, fontFamily: "monospace", marginTop: 2 },

  // Menu
  sectionLabel: {
    fontSize: 10, fontFamily: "monospace", letterSpacing: 4,
    color: COLORS.muted, marginBottom: 12, fontWeight: "700",
  },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#060f1c", borderRadius: 12, borderWidth: 1,
    padding: 16, marginBottom: 10,
  },
  menuIcon: { fontSize: 26 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  menuSub: { fontSize: 11, color: COLORS.muted },
  arrow: { fontSize: 28, marginRight: 4 },

  // Info
  infoBox: {
    backgroundColor: "#060f1c", borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 18, marginTop: 20,
  },
  infoTitle: {
    fontSize: 12, fontFamily: "monospace", letterSpacing: 3,
    color: COLORS.muted, marginBottom: 14, fontWeight: "600",
  },
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  infoIcon: { fontSize: 20, width: 28 },
  infoLabel: { fontSize: 12, fontWeight: "700", color: COLORS.textDim, fontFamily: "monospace" },
  infoDesc: { fontSize: 11, color: COLORS.muted, marginTop: 2, lineHeight: 16 },
});