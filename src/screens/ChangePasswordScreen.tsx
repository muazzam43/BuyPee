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
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    try {
      const storedPassword = await AsyncStorage.getItem("userPassword");

      // if there is a saved password, validate old one
      if (storedPassword && storedPassword !== oldPass) {
        Alert.alert("Error", "Current password is incorrect!");
        return;
      }

      if (newPass !== confirmPass) {
        Alert.alert("Error", "New passwords do not match!");
        return;
      }

      if (newPass.trim().length < 4) {
        Alert.alert("Error", "Password must be at least 4 characters long!");
        return;
      }

      await AsyncStorage.setItem("userPassword", newPass);
      Alert.alert("Success", "Password changed successfully!");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Icon circle */}
      <View style={styles.iconWrapper}>
        <View style={styles.circle}>
          <Icon name="key-outline" size={48} color="#000" />
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Old password */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={oldPass}
            onChangeText={setOldPass}
            placeholder="Current password"
            placeholderTextColor="#888"
            secureTextEntry={!showOld}
          />
          <TouchableOpacity onPress={() => setShowOld(!showOld)}>
            <Icon
              name={showOld ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* New password */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newPass}
            onChangeText={setNewPass}
            placeholder="New password"
            placeholderTextColor="#888"
            secureTextEntry={!showNew}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Icon
              name={showNew ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm password */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={confirmPass}
            onChangeText={setConfirmPass}
            placeholder="Confirm password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Icon
              name={showConfirm ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
          <Text style={styles.saveText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePasswordScreen;

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
  form:
  {
    padding: 20,
    marginTop: 16
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
    fontFamily: "Poppins-Regular",
  },
  saveBtn: {
    backgroundColor: "#FFD600",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#000",
  },
});
