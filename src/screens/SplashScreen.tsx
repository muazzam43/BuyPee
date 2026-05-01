import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

// ✅ Explicit RootStack typing
type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("LoginScreen");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F6C90E" barStyle="dark-content" />

      {/* Logo */}
      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      {/* Main Title */}
      <Text style={styles.mainTitle}>BuyPe</Text>

      {/* Subtitle */}
      <Text style={styles.subTitle}>A Friendly Store</Text>

      {/* Footer */}
      <Text style={styles.footer}>From Enkibyte 3.x.x</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6C90E",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 50,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    fontSize: 14,
    color: "#000",
  },
});
