import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  // Load profile from Firestore + Auth
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        Alert.alert("Error", "User not logged in");
        return;
      }
      try {
        setLoading(true);
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setEmail(data.email || "");
          setAvatar(data.avatar || null);
        } else {
          // fallback from Firebase Auth
          setName(user.displayName || "");
          setEmail(user.email || "");
          setAvatar(user.photoURL || null);
        }
      } catch (err) {
        console.log("Error loading profile:", err);
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Pick Image from Gallery and convert to Base64
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.7, includeBase64: true }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.base64) {
          setAvatar(`data:${asset.type};base64,${asset.base64}`);
        } else {
          setAvatar(asset.uri || null);
        }
      }
    });
  };

  // Save Profile (Base64 avatar saved to Firestore)
  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Save to Firestore directly (Base64 string or null)
      await setDoc(
        doc(db, "users", user.uid),
        { name, email, avatar: avatar || null },
        { merge: true }
      );

      setLoading(false);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (err: any) {
      console.log("Save error:", err);
      setLoading(false);
      Alert.alert("Error", err.message || "Failed to save profile");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD600" />
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: avatar || "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
          <Icon name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email Address"
          placeholderTextColor="#888"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfileScreen;

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
  headerTitle:
  {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#000"
  },
  avatarContainer:
  {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#FFD600",
  },
  cameraBtn: {
    backgroundColor: "#FFD600",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    right: "38%",
  },
  form: { padding: 20, marginTop: 20 },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: "#000",
  },
  saveBtn: {
    backgroundColor: "#FFD600",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#000",
  },
  center:
  {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
});
