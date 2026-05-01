// src/screens/CreateAdScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// ✅ Navigation typing
type RootStackParamList = {
  CreateAd: { imageUri?: string };
};
type CreateAdNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateAd"
>;

export default function CreateAdScreen({ route }: any) {
  const navigation = useNavigation<CreateAdNavigationProp>();
  const [images, setImages] = useState<string[]>(
    route?.params?.imageUri ? [route.params.imageUri] : []
  );
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // 📸 Pick image
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.7 }, (res) => {
      const uri = res.assets?.[0]?.uri;
      if (uri) setImages((prev) => [...prev, uri]);
    });
  };

  // 🏷️ Add tag
  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // 🗑️ Remove image
  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  // 📤 Post Ad
  const postAd = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please add a title for your ad.");
      return;
    }

    if (!isFree && !price.trim()) {
      Alert.alert("Error", "Please enter a price or mark it as FREE.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to post ads.");
      return;
    }

    const newAd = {
      title,
      price: isFree ? "Free" : price,
      tags,
      images,
      createdAt: serverTimestamp(),
      userId: user.uid,
    };

    try {
      await addDoc(collection(db, "ads"), newAd);

      // ✅ Optional: push notification to Firestore
      await addDoc(collection(db, "notifications"), {
        message: `New ad posted: ${title}`,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });

      Alert.alert("Success", "Ad posted successfully!");
      setTitle("");
      setPrice("");
      setTags([]);
      setImages([]);
      setIsFree(false);

      navigation.goBack();
    } catch (error) {
      console.error("Error saving ad:", error);
      Alert.alert("Error", "Could not save your ad. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Ad</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Images */}
        <View style={styles.imageGrid}>
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Ionicons name="add" size={30} color="#999" />
          </TouchableOpacity>

          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(uri)}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        {/* Price */}
        <View style={styles.priceRow}>
          {!isFree && (
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Add Price"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          )}
          <TouchableOpacity
            style={[styles.priceBtn, isFree && styles.priceBtnActive]}
            onPress={() => setIsFree(true)}
          >
            <Text style={{ color: isFree ? "#fff" : "#000" }}>FREE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priceBtn, !isFree && styles.priceBtnActive]}
            onPress={() => setIsFree(false)}
          >
            <Text style={{ color: !isFree ? "#fff" : "#000" }}>PRICE</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Add #tags"
            placeholderTextColor="#aaa"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
            <Text style={{ color: "#fff" }}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Tags list */}
        <View style={styles.tagsContainer}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={{ color: "#000" }}>#{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Post button */}
      <TouchableOpacity style={styles.postBtn} onPress={postAd}>
        <Text style={styles.postText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: 
  { flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    backgroundColor: "#FFD700",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: 
  { padding: 6, 
    borderRadius: 20, 
    marginRight: 8 
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#000",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  imageWrapper: 
  { position: "relative", 
    margin: 4 },
  image: 
  { width: 80, 
    height: 80, 
    borderRadius: 8 
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: "#000",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priceBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    marginLeft: 8,
  },
  priceBtnActive: 
  { backgroundColor: "#FFD700"

   },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addTagBtn: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  postBtn: 
  { backgroundColor: "#FFD700", 
    padding: 16, alignItems: "center"
   },
  postText: 
  { fontWeight: "bold", 
    color: "#000" 
  },
});
