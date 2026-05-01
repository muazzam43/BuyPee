import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  // 👤 If coming from ProductScreen, sellerId will be passed
  const userIdFromParams = route.params?.userId || null;

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        // Case 1: Seller profile (navigated with userId param)
        if (userIdFromParams && (!currentUser || userIdFromParams !== currentUser.uid)) {
          setIsOwnProfile(false);
          const snap = await getDoc(doc(db, "users", userIdFromParams));
          if (snap.exists()) {
            const data = snap.data();
            setName(data.name || "Unknown");
            setEmail(data.email || "No Email");
            setAvatar(
              data.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            );
          }
        }
        // Case 2: Logged-in user profile
        else if (currentUser) {
          setIsOwnProfile(true);
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setName(data.name || currentUser.displayName || "Unknown");
            setEmail(data.email || currentUser.email || "No Email");
            setAvatar(
              data.avatar ||
                currentUser.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            );
          }
        }
      } catch (err) {
        console.log("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) fetchProfile();
  }, [isFocused, userIdFromParams]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FDC600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isOwnProfile ? "My Profile" : "User Profile"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Options only for logged-in user */}
      {isOwnProfile && (
        <>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Icon name="pencil-outline" size={22} color="#FDC600" />
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Icon name="lock-outline" size={22} color="#FDC600" />
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("DeleteAcount")}
          >
            <Icon name="delete-outline" size={22} color="#FDC600" />
            <Text style={styles.optionText}>Delete Account</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ProfileScreen;

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
  profileSection: {
    alignItems: "center",
    marginVertical: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#555",
    marginTop: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
