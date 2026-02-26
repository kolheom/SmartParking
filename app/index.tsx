// app/(tabs)/index.tsx
// ─────────────────────────────────────────────────────────────────
// Replaces the default "Hello World" Expo starter page.
// Renders the Smart Parking AppNavigator inside Expo Router.
// ─────────────────────────────────────────────────────────────────

import AppNavigator from "../src/navigation/AppNavigator";

export default function Page() {
  // Expo Router already provides NavigationContainer.
  // Just render AppNavigator directly — do NOT add another wrapper.
  return <AppNavigator />;
}