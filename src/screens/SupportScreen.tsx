import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");


export default function SupportScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!email || !details) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Show success
    Alert.alert("Submitted", "Your support request has been submitted ✅");

    // Reset fields
    setEmail("");
    setDetails("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView for responsiveness */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            {/* Back button */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={24} color="#000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.headerTitle}>Support</Text>

            {/* Right placeholder to balance layout */}
            <View style={{ width: 24 }} />
          </View>


          {/* Icon + Title */}
          <View style={styles.centerSection}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconQuestion}>?</Text>
            </View>
            <Text style={styles.supportTitle}>We’re here to help</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={details}
              onChangeText={setDetails}
              placeholder="Write your issue here..."
              placeholderTextColor="#888"
              multiline
            />
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6C90E",
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  centerSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F6C90E",
    justifyContent: "center",
    alignItems: "center",
  },
  iconQuestion: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#000",
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
  },
  form: {
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    color: "#000",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#F6C90E",
    paddingVertical: 14,
    marginHorizontal: 80,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
