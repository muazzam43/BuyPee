// src/screens/ProductScreen.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FavoritesContext } from "../context/FavoritesContext";

export default function ProductScreen({ route, navigation }: any) {
  const { product } = route.params || {};
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 16, color: "#555" }}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  const isFavorite = favorites.some((item) => item.id === product.id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6C90E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 26 }} /> 
      </View>

      <ScrollView>
        {/* ✅ Product Image */}
        <Image
          source={{
            uri:
              product.images && product.images.length > 0
                ? product.images[0]
                : "https://via.placeholder.com/350",
          }}
          style={styles.productImage}
        />

        {/* Price & Title */}
        <View style={styles.infoBox}>
          <Text style={styles.price}>PKR {product.price ?? "N/A"}</Text>
          <Text style={styles.title}>{product.title ?? "Untitled"}</Text>
        </View>

        {/* Seller Info */}
        <TouchableOpacity
          style={styles.sellerBox}
          onPress={() =>
            navigation.navigate("Profile", {
              userId: product.seller?.id,
            })
          }
        >
          {product.seller?.avatar ? (
            <Image
              source={{ uri: product.seller.avatar }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#aaa" />
          )}
          <Text style={styles.sellerName}>
            {product.seller?.name ?? "Unknown Seller"}
          </Text>
        </TouchableOpacity>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <View style={styles.tagsBox}>
            <Text style={styles.tagsHeading}>Tags</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {product.tags.map((tag: string, index: number) => (
                <Text key={index} style={styles.tag}>
                  #{tag}{" "}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        {/* Favorite Button */}
        <TouchableOpacity onPress={() => toggleFavorite(product)}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={28}
            color="#F6C90E"
          />
        </TouchableOpacity>

        {/* ✅ Chat Button → passes full seller info */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ChatScreen", {
              name: product.seller?.name ?? "Seller",
              avatar:
                product.seller?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              userId: product.seller?.id ?? null,
            })
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color="#F6C90E"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    height: 60,
    backgroundColor: "#F6C90E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },

  productImage: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
    backgroundColor: "#eee",
  },
  infoBox: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  price: { fontSize: 20, fontWeight: "bold", color: "#000" },
  title: { fontSize: 16, color: "#555", marginTop: 4 },

  sellerBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  sellerName: { fontSize: 16, fontWeight: "bold" },

  tagsBox: { padding: 16 },
  tagsHeading: { fontWeight: "bold", marginBottom: 6 },
  tag: { color: "#1e90ff", marginRight: 6, marginBottom: 4 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
