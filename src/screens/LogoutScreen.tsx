import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type LogoutScreenProps = {
  navigation: any; // ✅ comes from React Navigation
  setIsLoggedIn: (value: boolean) => void; // ✅ passed manually
};

export default function LogoutScreen({
  navigation,
  setIsLoggedIn,
}: LogoutScreenProps) {
  const handleLogout = () => {
    Alert.alert("Logged Out", "You have been logged out successfully ✅", [
      {
        text: "OK",
        onPress: () => {
          setIsLoggedIn(false); // ✅ update app state
          navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
        <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logout</Text>
        <View style={{ width: 24 }} />
      </View>


      {/* 🔹 Body */}
      <View style={styles.container}>
        <Text style={styles.title}>Are you sure you want to Logout?</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#F6C90E",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#000",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 40,
    color: "#000",
    textAlign: "center",
  },
  logoutBtn: {
    backgroundColor: "#F6C90E",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
