// src/screens/FavoritesScreen.tsx
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FavoritesContext } from "../context/FavoritesContext";

/* ✅ Firebase */
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

export default function FavoritesScreen({ navigation }: any) {
  const { favorites } = useContext(FavoritesContext);

  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const favRef = doc(db, "favorites", user.uid);
          const snapshot = await getDoc(favRef);

          if (snapshot.exists()) {
            setUserFavorites(snapshot.data().items || []);
          } else {
            setUserFavorites([]);
          }
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Save to Firestore whenever favorites change
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const favRef = doc(db, "favorites", user.uid);
      setDoc(favRef, { items: favorites }, { merge: true });
      setUserFavorites(favorites);
    }
  }, [favorites]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F6C90E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F6C90E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      {/* Empty State */}
      {!userFavorites.length ? (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16 }}>No favorites yet ❤️</Text>
        </View>
      ) : (
        <FlatList
          data={userFavorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Product", { product: item })}
            >
              <Image
                source={{
                  uri:
                    item.image ||
                    (item.images && item.images.length > 0
                      ? item.images[0]
                      : "https://via.placeholder.com/150"),
                }}
                style={styles.image}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>AED {item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "#F6C90E",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },

  card: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  price: {
    color: "#555",
    marginTop: 4,
  },
});
