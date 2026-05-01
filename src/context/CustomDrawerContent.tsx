import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CustomDrawerContent = (props: any) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Yellow Header */}
      <View style={styles.header} />

      {/* Menu Items */}
      <DrawerContentScrollView {...props}>
        <ScrollView>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) {
                  props.navigation.navigate(item.route); 
                  // ✅ navigate directly
                }
              }}
            >
              <Icon
                name={item.icon}
                size={22}
                color="#FDCB00"
                style={{ marginRight: 15 }}
              />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>Version 3.2</Text>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerContent;

/*  Drawer Items  */
const menuItems = [
  { label: "My Profile", icon: "account-outline", route: "Profile" },
  { label: "Groups", icon: "account-group-outline", route: "Groups" },
  { label: "My Ads", icon: "book-outline", route: "MyAds" },
  { label: "Contacts", icon: "account-box-outline", route: "Contacts" },
  { label: "Settings", icon: "cog-outline", route: "Settings" },
  { label: "Privacy Policy", icon: "hand", route: "Privacy" },
  { label: "Website", icon: "web", route: "Website" },
  { label: "Support", icon: "lifebuoy", route: "Support" },
  { label: "Logout", icon: "logout", route: "Logout" },
];

/*  Styles  */
const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: "#FFD600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 16,
    color: "#000",
  },
  footer: {
    padding: 10,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  version: {
    fontSize: 14,
    color: "#777",
  },
});
