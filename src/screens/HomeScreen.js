// ─────────────────────────────────────────────────────────────
// src/screens/HomeScreen.js
// Landing screen — shows free slot counts and navigation options
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { loadOccupied } from "../storage/BookingStorage";
import { buildParkingTree, countFreeSlots } from "../algorithms/tree";
import { COLORS } from "../data/parkingData";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [free, setFree] = useState({ twoWheeler: 0, fourWheeler: 0 });
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Modern Hero Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/home_hero.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", COLORS.bg]}
            style={styles.heroOverlay}
          />
          <View style={styles.headerContent}>
            <View style={styles.userRow}>
              <View>
                <Text style={styles.greeting}>Good Morning,</Text>
                <Text style={styles.userName}>{user?.username || "Driver"}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {/* Availability Dashboard */}
          <Text style={styles.sectionTitle}>PARKING AVAILABILITY</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="🛵"
              label="Two Wheeler"
              count={loading ? "—" : free.twoWheeler}
              color={COLORS.accent2W}
              gradient={["#083344", "#0e7490"]}
            />
            <StatCard
              icon="🚗"
              label="Four Wheeler"
              count={loading ? "—" : free.fourWheeler}
              color={COLORS.accent4W}
              gradient={["#431407", "#9a3412"]}
            />
          </View>

          {loading && <ActivityIndicator color={COLORS.path} style={{ marginBottom: 20 }} />}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
                style={styles.menuItem}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                  style={styles.menuGradient}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: `${item.color}22` }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSubText}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, count, color, gradient }) {
  return (
    <LinearGradient colors={gradient} style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statInfo}>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statSub}>Available</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  contentPadding: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  headerContainer: {
    height: 240,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    paddingTop: 40,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: "600",
  },
  userName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 12,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textDim,
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 10,
  },

  // Stats
  statsRow: { flexDirection: "row", gap: 15, marginBottom: 30 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  statIcon: { fontSize: 32 },
  statInfo: { flex: 1 },
  statCount: { fontSize: 24, fontWeight: "900", color: "#fff" },
  statLabel: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  statSub: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600", textTransform: "uppercase" },

  // Menu List
  menuContainer: { gap: 12 },
  menuItem: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  menuGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingRight: 10,
  },
  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuIcon: { fontSize: 24 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  menuSubText: { fontSize: 12, color: COLORS.textDim },
});