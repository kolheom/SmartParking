import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Input Error", "Please enter both username and password.");
      return;
    }

    const success = await login(username, password);
    if (!success) {
      Alert.alert("Login Failed", "Invalid credentials.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/parking_login_bg.png")}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(10, 31, 53, 0.7)", "rgba(37, 117, 252, 0.3)"]}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Ionicons name="car-sport-outline" size={40} color="#fff" />
              </View>
              <Text style={styles.title}>SMART PARK</Text>
              <Text style={styles.subtitle}>EFFICIENT · SECURE · MODERN</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-circle-outline" size={22} color="#88aadd" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username / Email"
                  placeholderTextColor="#88aadd"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={22} color="#88aadd" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#88aadd"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.loginBtnText}>SIGN IN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPass}>
                <Text style={styles.forgotPassText}>Forgot Credentials?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity>
                <Text style={styles.signUpText}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 30,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "rgba(10, 31, 53, 0.85)",
    borderRadius: 30,
    padding: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(37, 117, 252, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#2575fc",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#88aadd",
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "rgba(37, 117, 252, 0.3)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loginBtn: {
    backgroundColor: "#2575fc",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2575fc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  forgotPass: {
    alignItems: "center",
    marginTop: 15,
  },
  forgotPassText: {
    color: "#88aadd",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#88aadd",
    fontSize: 14,
    marginRight: 8,
  },
  signUpText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
