import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

/* ✅ Firebase */
import { auth, db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

type Ad = {
  id: string;
  title: string;
  price: string;
  tags: string[];
  images: string[];
  userId: string;
};

export default function MyAdsScreen() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // 🔄 Load my ads from Firestore
  useEffect(() => {
    const fetchMyAds = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "ads"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        const myAds: Ad[] = [];
        snapshot.forEach((docSnap) => {
          myAds.push({ id: docSnap.id, ...docSnap.data() } as Ad);
        });

        setAds(myAds);
      } catch (err) {
        console.error("Error loading my ads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAds();
  }, []);

  // 🗑️ Delete ad (from Firestore)
  const deleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, "ads", id));
      setAds(ads.filter((ad) => ad.id !== id));
      Alert.alert("Deleted", "Ad removed successfully.");
    } catch (err) {
      console.error("Error deleting ad:", err);
      Alert.alert("Error", "Could not delete ad.");
    }
  };

  const renderAd = ({ item }: { item: Ad }) => (
    <View style={styles.card}>
      {item.images?.[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>PKR {item.price}</Text>
        <View style={styles.tags}>
          {item.tags?.map((tag, idx) => (
            <Text key={idx} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteAd(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F6C90E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Yellow Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Ads</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ Content */}
      {ads.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          No ads posted yet
        </Text>
      ) : (
        <FlatList
          data={ads}
          keyExtractor={(item) => item.id}
          renderItem={renderAd}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  
  header:
  {
    backgroundColor: "#F6C90E",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle:
  {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  card:
  {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 12,
    alignItems: "center",
  },
  image:
  {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10
  },
  info:
  {
    flex: 1

  },
  title:
  {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  price:
  {
    color: "#FFD700",
    marginVertical: 4,
  },
  tags:
  {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag:
  {
    fontSize: 12,
    color: "#555",
    marginRight: 6,
  },
  deleteBtn:
  {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
  },
});
