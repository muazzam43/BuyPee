import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Screens
import HomeScreen from "../screens/HomeScreen";
import MenuDrawer from "../navigation/MenuDrawer";
import FavoritesScreen from "../screens/FavoritesScreen";
import { RootStackParamList } from "../types/navigation"; // ✅ fix your import path
import ChatList from "../screens/ChatList";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatList}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={() => <View />} 
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.scanButtonContainer}
              onPress={() => navigation.navigate("CreateAd")}
            >
              <View style={styles.scanButton}>
                <Ionicons name="qr-code-outline" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Favorites */}
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={28} color={color} />
          ),
        }}
      />

      {/* Menu */}
      <Tab.Screen
        name="Menu"
        component={MenuDrawer}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu-outline" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    marginBottom: -2,
    backgroundColor: "#F6C90E",
    height: 50, // slightly taller to give space
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position:"absolute",
    paddingBottom: 1,
    paddingHorizontal: 10, 
  },
  scanButtonContainer: {
    top: -15,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: "#F6C90E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 2 },
  },
});

