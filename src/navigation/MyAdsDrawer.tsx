// src/navigation/MyAdsDrawer.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";

// Screens
import MyAdsScreen from "../screens/MyAdsScreen";
import ContactsScreen from "../screens/ContactsScreen";
import SupportScreen from "../screens/SupportScreen";
import LogoutScreen from "../screens/LogoutScreen";

const Drawer = createDrawerNavigator();

type MyAdsDrawerProps = {
  setIsLoggedIn: (value: boolean) => void; // ✅ accept from parent
};

export default function MyAdsDrawer({ setIsLoggedIn }: MyAdsDrawerProps) {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#F6C90E" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        drawerActiveTintColor: "#F6C90E",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      {/* My Ads */}
      <Drawer.Screen
        name="MyAds"
        component={MyAdsScreen}
        options={{
          title: "My Ads",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Contacts */}
      <Drawer.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: "Contacts",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Support */}
      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: "Support",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Logout */}
      <Drawer.Screen name="Logout">
        {(props) => <LogoutScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
