import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // ✅ import this
import { RootStackParamList } from "../types/navigation"; // ✅ your routes type

// ✅ Tell TypeScript this screen uses RootStack navigation
type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

const SettingsScreen = () => {
  const [pushNotifications, setPushNotifications] = useState(true);

  // ✅ pass the type here
  const navigation = useNavigation<SettingsNavProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Settings Options */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("EditProfile")} // ✅ works now
      >
        <Icon name="pencil-outline" size={22} color="#FDCB00" />
        <Text style={styles.optionText}>Edit profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("ChangePassword")} // ✅ works now
      >
        <Icon name="lock-outline" size={22} color="#FDCB00" />
        <Text style={styles.optionText}>Change password</Text>
      </TouchableOpacity>

      <View style={styles.option}>
        <Icon name="bell-outline" size={22} color="#FDCB00" />
        <Text style={styles.optionText}>Push notifications</Text>
        <Switch
          value={pushNotifications}
          onValueChange={(value) => setPushNotifications(value)}
        />
      </View>

      <TouchableOpacity style={styles.option}>
        <Icon name="web" size={22} color="#FDCB00" />
        <Text style={styles.optionText}>Website</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Icon name="shield-lock-outline" size={22} color="#FDCB00" />
        <Text style={styles.optionText}>Privacy policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Icon name="file-document-outline" size={22} color="#FDCB00" />
        <Text style={styles.optionText}>Terms and conditions</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    backgroundColor: "#F6C90E",
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
});
