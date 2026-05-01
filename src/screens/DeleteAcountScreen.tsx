import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase/firebaseConfig";// ✅ import your firebase config
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert("Error", "No user logged in");
        return;
      }

      // ✅ Step 1: Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // ✅ Step 2: Delete from Firestore (optional)
      await deleteDoc(doc(db, "users", user.uid));

      // ✅ Step 3: Delete account from Firebase Auth
      await deleteUser(user);

      Alert.alert("Account Deleted", "Your account has been removed permanently.");
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" as never }], // go back to login screen
      });
    } catch (error: any) {
      console.error("Delete failed:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.circle}>
          <Icon name="delete-outline" size={48} color="#000" />
        </View>
      </View>

      {/* Info */}
      <Text style={styles.warningText}>
        This action is permanent and cannot be undone.
        Please enter your password to confirm.
      </Text>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#888"
          secureTextEntry
        />
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={[styles.deleteBtn, loading && { opacity: 0.6 }]}
        onPress={handleDelete}
        disabled={loading}
      >
        <Text style={styles.deleteText}>
          {loading ? "Deleting..." : "Delete My Account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    height: 60,
    backgroundColor: "#FFD600",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  iconWrapper:
  {
    alignItems: "center",
    marginTop: 18
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFD600",
    alignItems: "center",
    justifyContent: "center",
  },
  warningText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#333",
    marginTop: 20,
    paddingHorizontal: 25,
    lineHeight: 20,
  },
  inputRow: {
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
    fontFamily: "Poppins-Regular",
  },
  deleteBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    marginHorizontal: 20,
  },
  deleteText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
