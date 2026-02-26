// ─────────────────────────────────────────────────────────────
// src/screens/FuelScreen.js
// Displays nearby fuel stations (static data, extendable with API).
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert,
} from "react-native";
import { COLORS } from "../data/parkingData";

const FUEL_STATIONS = [
  {
    id: "f1", name: "Indian Oil Station", distance: "0.3 km",
    address: "Near Parking Gate, Main Road",
    type: ["Petrol", "Diesel", "CNG"],
    rating: 4.5, open: true, price: { petrol: "₹102.89", diesel: "₹89.62" },
    phone: "+91-9876543210", lat: 12.9716, lng: 77.5946,
  },
  {
    id: "f2", name: "HP Petrol Pump", distance: "0.7 km",
    address: "Opposite Metro Station, Park Street",
    type: ["Petrol", "Diesel"],
    rating: 4.2, open: true, price: { petrol: "₹102.80", diesel: "₹89.55" },
    phone: "+91-9876543211", lat: 12.9726, lng: 77.5936,
  },
  {
    id: "f3", name: "BPCL Fuel Point", distance: "1.1 km",
    address: "Highway Junction, Ring Road",
    type: ["Petrol", "Diesel", "EV Charging"],
    rating: 4.7, open: false, price: { petrol: "₹102.75", diesel: "₹89.50" },
    phone: "+91-9876543212", lat: 12.9736, lng: 77.5956,
  },
  {
    id: "f4", name: "Shell Station", distance: "1.5 km",
    address: "Tech Park Boulevard, East Side",
    type: ["Petrol", "Diesel", "EV Charging", "CNG"],
    rating: 4.8, open: true, price: { petrol: "₹103.10", diesel: "₹89.80" },
    phone: "+91-9876543213", lat: 12.9746, lng: 77.5966,
  },
];

const TYPE_COLORS = {
  Petrol: COLORS.accent4W,
  Diesel: "#60a5fa",
  CNG:    "#a78bfa",
  "EV Charging": COLORS.path,
};

export default function FuelScreen() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Open Now", "CNG", "EV Charging"];

  const filtered = FUEL_STATIONS.filter((s) => {
    if (filter === "All") return true;
    if (filter === "Open Now") return s.open;
    return s.type.includes(filter);
  });

  function callStation(phone) {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Cannot open phone dialer.")
    );
  }

  function openMaps(lat, lng, name) {
    const url = `https://maps.google.com/?q=${lat},${lng}(${encodeURIComponent(name)})`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Cannot open maps.")
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <Text style={styles.sectionLabel}>⛽ NEARBY FUEL STATIONS</Text>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
              style={[styles.filterPill, { borderColor: filter === f ? COLORS.accent4W : COLORS.border,
                backgroundColor: filter === f ? `${COLORS.accent4W}22` : "#060f1c" }]}
            >
              <Text style={[styles.filterText, { color: filter === f ? COLORS.accent4W : COLORS.muted }]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Station Cards */}
      {filtered.map((station) => (
        <View key={station.id} style={[styles.card, {
          borderColor: station.open ? `${COLORS.path}33` : COLORS.border,
        }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>⛽</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.stationName}>{station.name}</Text>
              <Text style={styles.stationAddress}>{station.address}</Text>
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: station.open ? "#052e1c" : "#1a0000",
              borderColor: station.open ? `${COLORS.path}44` : `${COLORS.occupied}44`,
            }]}>
              <Text style={[styles.statusText, { color: station.open ? COLORS.path : COLORS.occupied }]}>
                {station.open ? "OPEN" : "CLOSED"}
              </Text>
            </View>
          </View>

          {/* Distance & Rating */}
          <View style={styles.metaRow}>
            <Text style={styles.distance}>📍 {station.distance}</Text>
            <Text style={styles.rating}>⭐ {station.rating}</Text>
          </View>

          {/* Fuel types */}
          <View style={styles.typeRow}>
            {station.type.map((t) => (
              <View key={t} style={[styles.typeBadge, { borderColor: `${TYPE_COLORS[t] || COLORS.muted}44`,
                backgroundColor: `${TYPE_COLORS[t] || COLORS.muted}18` }]}>
                <Text style={[styles.typeText, { color: TYPE_COLORS[t] || COLORS.muted }]}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Prices */}
          <View style={styles.priceRow}>
            <PriceItem label="Petrol" value={station.price.petrol} color={COLORS.accent4W} />
            <PriceItem label="Diesel" value={station.price.diesel} color="#60a5fa" />
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => openMaps(station.lat, station.lng, station.name)}
              style={[styles.actionBtn, { borderColor: `${COLORS.accent2W}44`, backgroundColor: `${COLORS.accent2W}11` }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionText, { color: COLORS.accent2W }]}>🗺 Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => callStation(station.phone)}
              style={[styles.actionBtn, { borderColor: `${COLORS.path}44`, backgroundColor: `${COLORS.path}11` }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionText, { color: COLORS.path }]}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function PriceItem({ label, value, color }) {
  return (
    <View style={styles.priceItem}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={[styles.priceValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 9, fontFamily: "monospace", letterSpacing: 3, color: COLORS.muted, marginBottom: 14, fontWeight: "700" },

  filterScroll: { marginBottom: 16 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 11, fontFamily: "monospace", fontWeight: "600" },

  card: { backgroundColor: "#060f1c", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  cardHeader: { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#0a1929", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 22 },
  headerInfo: { flex: 1 },
  stationName: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  stationAddress: { fontSize: 10, color: COLORS.muted, lineHeight: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 9, fontFamily: "monospace", fontWeight: "700", letterSpacing: 1 },

  metaRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  distance: { fontSize: 11, color: COLORS.textDim, fontFamily: "monospace" },
  rating: { fontSize: 11, color: "#fbbf24", fontFamily: "monospace" },

  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  typeText: { fontSize: 9, fontFamily: "monospace", fontWeight: "600" },

  priceRow: { flexDirection: "row", gap: 12, marginBottom: 14, backgroundColor: "#040d18", borderRadius: 8, padding: 10 },
  priceItem: { flex: 1, alignItems: "center" },
  priceLabel: { fontSize: 9, fontFamily: "monospace", color: COLORS.muted, marginBottom: 4, letterSpacing: 1 },
  priceValue: { fontSize: 14, fontFamily: "monospace", fontWeight: "700" },

  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  actionText: { fontSize: 12, fontFamily: "monospace", fontWeight: "600" },
});