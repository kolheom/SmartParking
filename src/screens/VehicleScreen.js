// ─────────────────────────────────────────────────────────────
// src/screens/VehicleScreen.js
// Step 1 — User selects vehicle type and enters vehicle number.
// Runs Dijkstra and navigates to ResultScreen.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { loadOccupied } from "../storage/BookingStorage";
import { buildParkingTree, findEmptySlots } from "../algorithms/tree";
import { findShortestSlot, rankAllEmptySlots } from "../algorithms/graph";
import { COLORS } from "../data/parkingData";

export default function VehicleScreen({ navigation }) {
  const [vehicleType, setVehicleType] = useState(null); // "2W" | "4W"
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [occupied, setOccupied] = useState({});
  const [freeCount, setFreeCount] = useState({ "2W": 0, "4W": 0 });

  useEffect(() => {
    (async () => {
      const occ = await loadOccupied();
      setOccupied(occ);
      const tree = buildParkingTree(occ);
      setFreeCount({
        "2W": findEmptySlots(tree, "2W").length,
        "4W": findEmptySlots(tree, "4W").length,
      });
    })();
  }, []);

  const handleFind = async () => {
    if (!vehicleType) {
      Alert.alert("Select Vehicle", "Please choose Two Wheeler or Four Wheeler.");
      return;
    }
    if (!vehicleNumber.trim()) {
      Alert.alert("Vehicle Number", "Please enter your vehicle number.");
      return;
    }

    setLoading(true);
    try {
      const occ = await loadOccupied();
      const tree = buildParkingTree(occ);
      const emptySlots = findEmptySlots(tree, vehicleType);

      if (emptySlots.length === 0) {
        Alert.alert("No Slots", `All ${vehicleType} slots are currently occupied.`);
        setLoading(false);
        return;
      }

      const shortest = findShortestSlot(emptySlots);
      const ranked   = rankAllEmptySlots(emptySlots);

      navigation.navigate("Result", {
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        shortest,
        ranked,
        occupied: occ,
      });
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>VEHICLE ENTRY</Text>

      {/* Vehicle Type Selection */}
      <Text style={styles.label}>SELECT VEHICLE TYPE</Text>
      <View style={styles.typeRow}>
        <TypeCard
          emoji="🛵"
          title="Two Wheeler"
          subtitle="Bike / Scooter"
          freeCount={freeCount["2W"]}
          color={COLORS.accent2W}
          selected={vehicleType === "2W"}
          onPress={() => setVehicleType("2W")}
        />
        <TypeCard
          emoji="🚗"
          title="Four Wheeler"
          subtitle="Car / SUV"
          freeCount={freeCount["4W"]}
          color={COLORS.accent4W}
          selected={vehicleType === "4W"}
          onPress={() => setVehicleType("4W")}
        />
      </View>

      {/* Vehicle Number Input */}
      <Text style={[styles.label, { marginTop: 24 }]}>VEHICLE NUMBER</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. KA01AB1234"
        placeholderTextColor={COLORS.muted}
        value={vehicleNumber}
        onChangeText={setVehicleNumber}
        autoCapitalize="characters"
        maxLength={12}
      />

      {/* Algorithm Info */}
      {vehicleType && (
        <View style={styles.algoCard}>
          <Text style={styles.algoTitle}>⚡ What happens next?</Text>
          <Text style={styles.algoDesc}>
            1. DFS traversal of the parking tree finds all empty {vehicleType} slots.{"\n"}
            2. Dijkstra's algorithm runs on the graph from{" "}
            <Text style={{ color: COLORS.accent2W }}>entrance</Text> to each empty slot.{"\n"}
            3. The slot with{" "}
            <Text style={{ color: COLORS.path }}>shortest distance</Text> is recommended.
          </Text>
        </View>
      )}

      {/* Find Button */}
      <TouchableOpacity
        onPress={handleFind}
        activeOpacity={0.85}
        disabled={loading}
        style={[
          styles.findBtn,
          { opacity: vehicleType && vehicleNumber.trim() ? 1 : 0.5 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.findBtnText}>⚡ FIND SHORTEST SLOT</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function TypeCard({ emoji, title, subtitle, freeCount, color, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.typeCard,
        {
          borderColor: selected ? color : `${color}33`,
          backgroundColor: selected ? `${color}18` : "#060f1c",
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <Text style={styles.typeEmoji}>{emoji}</Text>
      <Text style={[styles.typeTitle, { color: selected ? color : COLORS.text }]}>{title}</Text>
      <Text style={styles.typeSub}>{subtitle}</Text>
      <Text style={[styles.typeFree, { color: freeCount > 0 ? color : COLORS.occupied }]}>
        {freeCount} free
      </Text>
      {selected && <Text style={[styles.checkmark, { color }]}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 11, fontFamily: "monospace", letterSpacing: 4,
    color: COLORS.muted, marginBottom: 20, fontWeight: "700",
  },
  label: {
    fontSize: 10, fontFamily: "monospace", letterSpacing: 3,
    color: COLORS.muted, marginBottom: 10, fontWeight: "600",
  },

  // Type cards
  typeRow: { flexDirection: "row", gap: 12 },
  typeCard: {
    flex: 1, borderRadius: 14, padding: 18, alignItems: "center",
    position: "relative",
  },
  typeEmoji: { fontSize: 36, marginBottom: 8 },
  typeTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  typeSub: { fontSize: 11, color: COLORS.muted, marginBottom: 8 },
  typeFree: { fontSize: 12, fontFamily: "monospace", fontWeight: "600" },
  checkmark: {
    position: "absolute", top: 8, right: 12, fontSize: 16, fontWeight: "800",
  },

  // Input
  input: {
    backgroundColor: "#060f1c", borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 16, color: COLORS.text,
    fontSize: 18, fontFamily: "monospace", letterSpacing: 3, fontWeight: "700",
  },

  // Algo info
  algoCard: {
    marginTop: 20, backgroundColor: "#060f1c", borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 16,
  },
  algoTitle: {
    fontSize: 11, fontFamily: "monospace", color: COLORS.textDim,
    letterSpacing: 2, fontWeight: "700", marginBottom: 10,
  },
  algoDesc: { fontSize: 12, color: COLORS.muted, lineHeight: 20 },

  // Button
  findBtn: {
    marginTop: 28, backgroundColor: COLORS.path + "22",
    borderWidth: 2, borderColor: COLORS.path,
    borderRadius: 14, padding: 18, alignItems: "center",
  },
  findBtnText: {
    color: COLORS.path, fontSize: 15, fontWeight: "800",
    fontFamily: "monospace", letterSpacing: 2,
  },
});