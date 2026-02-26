// ─────────────────────────────────────────────────────────────
// src/screens/HistoryScreen.js
// Displays all past bookings. Allows releasing (freeing) a slot.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from "react-native";
import {
  loadHistory, loadOccupied, releaseBooking,
} from "../storage/BookingStorage";
import { COLORS } from "../data/parkingData";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [occupied, setOccupied] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [h, o] = await Promise.all([loadHistory(), loadOccupied()]);
    setHistory(h);
    setOccupied(o);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, []);

  async function handleRelease(bookingId) {
    Alert.alert(
      "Release Slot",
      "Mark this slot as free?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Release",
          style: "destructive",
          onPress: async () => {
            const { history: h, occupied: o } = await releaseBooking(bookingId, occupied);
            setHistory(h);
            setOccupied(o);
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.path} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor={COLORS.path} />
      }
    >
      <Text style={styles.sectionLabel}>BOOKING HISTORY · {history.length} RECORDS</Text>

      {history.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No bookings yet.</Text>
        </View>
      )}

      {history.map((record) => {
        const isActive = record.status === "active";
        const isTW = record.vehicleType === "2W";
        const accent = isTW ? COLORS.accent2W : COLORS.accent4W;

        return (
          <View key={record.id} style={[styles.card, {
            borderColor: isActive ? `${COLORS.path}44` : COLORS.border,
          }]}>
            {/* Header row */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.bookingId, { color: isActive ? COLORS.path : COLORS.textDim }]}>
                  {record.id}
                </Text>
                <Text style={styles.bookedAt}>
                  {new Date(record.bookedAt).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: isActive ? "#052e1c" : "#1a1a2e",
                borderColor: isActive ? `${COLORS.path}44` : COLORS.border,
              }]}>
                <Text style={[styles.statusText, { color: isActive ? COLORS.path : COLORS.muted }]}>
                  {isActive ? "ACTIVE" : "RELEASED"}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.details}>
              <Detail label="SLOT" value={`${record.slotLabel} (${record.slotId})`} color={accent} />
              <Detail label="VEHICLE" value={record.vehicleNumber} color={COLORS.text} />
              <Detail label="TYPE" value={isTW ? "🛵 Two Wheeler" : "🚗 Four Wheeler"} color={accent} />
              <Detail label="DISTANCE" value={`${record.distance} units`} color={COLORS.path} />
            </View>

            {/* Path */}
            {record.path && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pathScroll}>
                <View style={styles.pathRow}>
                  {record.path.map((node, i) => (
                    <View key={node} style={styles.pathStep}>
                      <Text style={styles.pathNode}>{node}</Text>
                      {i < record.path.length - 1 && <Text style={styles.pathArrow}>›</Text>}
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Release button */}
            {isActive && (
              <TouchableOpacity
                onPress={() => handleRelease(record.id)}
                activeOpacity={0.85}
                style={styles.releaseBtn}
              >
                <Text style={styles.releaseBtnText}>🔓 RELEASE SLOT</Text>
              </TouchableOpacity>
            )}

            {record.releasedAt && (
              <Text style={styles.releasedAt}>
                Released: {new Date(record.releasedAt).toLocaleString()}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function Detail({ label, value, color }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
  sectionLabel: {
    fontSize: 9, fontFamily: "monospace", letterSpacing: 3,
    color: COLORS.muted, marginBottom: 14, fontWeight: "700",
  },
  empty: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: COLORS.muted, fontSize: 14, fontFamily: "monospace" },

  card: {
    backgroundColor: "#060f1c", borderRadius: 12, borderWidth: 1,
    padding: 14, marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  bookingId: { fontSize: 16, fontWeight: "800", fontFamily: "monospace" },
  bookedAt: { fontSize: 10, color: COLORS.muted, marginTop: 2, fontFamily: "monospace" },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1,
  },
  statusText: { fontSize: 9, fontFamily: "monospace", fontWeight: "700", letterSpacing: 1 },

  details: { gap: 6, marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 10, fontFamily: "monospace", color: COLORS.muted, letterSpacing: 1 },
  detailValue: { fontSize: 11, fontFamily: "monospace", fontWeight: "600" },

  pathScroll: { marginBottom: 12 },
  pathRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  pathStep: { flexDirection: "row", alignItems: "center", gap: 4 },
  pathNode: {
    fontSize: 9, fontFamily: "monospace", color: "#818cf8",
    backgroundColor: "#0c1a2e", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4,
  },
  pathArrow: { color: "#1e3a5a", fontSize: 12 },

  releaseBtn: {
    backgroundColor: "#1c0a00", borderWidth: 1, borderColor: `${COLORS.occupied}44`,
    borderRadius: 8, padding: 12, alignItems: "center",
  },
  releaseBtnText: { color: COLORS.occupied, fontFamily: "monospace", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  releasedAt: { fontSize: 9, color: COLORS.muted, fontFamily: "monospace", marginTop: 8, textAlign: "center" },
});