import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

/* ✅ Firebase config */
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

type RootStackParamList = {
  Home: undefined;
  Product: { product: any };
};

const { width } = Dimensions.get("window");
const numColumns = 2;
const spacing = 12;
const itemSize = (width - spacing * (numColumns + 1)) / numColumns;

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterText, setFilterText] = useState("Latest Ads");
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔔 Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // 📊 Filter Modal
  const [showFilter, setShowFilter] = useState(false);

  // 🔄 Fetch Ads
  const fetchAds = async (
    sortBy: "latest" | "low" | "high" | "all" = "all"
  ) => {
    try {
      let q;
      if (sortBy === "latest") {
        q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
      } else if (sortBy === "low") {
        q = query(collection(db, "ads"), orderBy("price", "asc"));
      } else if (sortBy === "high") {
        q = query(collection(db, "ads"), orderBy("price", "desc"));
      } else {
        q = collection(db, "ads");
      }

      const snapshot = await getDocs(q);
      const allAds: any[] = [];
      snapshot.forEach((doc) => {
        allAds.push({ id: doc.id, ...doc.data() });
      });

      setAds(allAds);
    } catch (error) {
      console.error("Error loading ads:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAds("latest"); // ✅ Default: latest ads
  }, []);

  // 🔔 Real-time Firestore Notifications
  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs: any[] = [];
      snapshot.forEach((doc) => {
        allNotifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(allNotifs);
    });

    return () => unsubscribe();
  }, []);

  const filteredAds = ads.filter((ad) =>
    ad.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F6C90E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {searchOpen ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            <TouchableOpacity onPress={() => setSearchOpen(false)}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => setSearchOpen(true)}>
              <Ionicons name="search-outline" size={24} color="#000" />
            </TouchableOpacity>

            {/* 🔔 Notification Icon */}
            <TouchableOpacity onPress={() => setShowNotifications(true)}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
              {notifications.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 🔔 Notification Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showNotifications}
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setShowNotifications(false)}
        >
          <View style={styles.notificationBox}>
            <Text style={styles.notifTitle}>Notifications</Text>
            {notifications.length === 0 ? (
              <Text style={styles.noNotif}>No new notifications</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.notifItem}>
                    <Ionicons
                      name="notifications-circle-outline"
                      size={20}
                      color="#F6C90E"
                    />
                    <Text style={styles.notifText}>{item.message}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 📊 Filter Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showFilter}
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity
          style={styles.overlaySmall}
          activeOpacity={1}
          onPressOut={() => setShowFilter(false)}
        >
          <View style={styles.smallFilterBox}>
            <Text style={styles.filterTitle}>Sort Ads</Text>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterText("Latest Ads");
                setShowFilter(false);
                setLoading(true);
                fetchAds("latest");
              }}
            >
              <Text style={styles.filterOptionText}>Latest Ads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterText("Low Price");
                setShowFilter(false);
                setLoading(true);
                fetchAds("low");
              }}
            >
              <Text style={styles.filterOptionText}>Low Price</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterText("High Price");
                setShowFilter(false);
                setLoading(true);
                fetchAds("high");
              }}
            >
              <Text style={styles.filterOptionText}>High Price</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterLeft}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options-outline" size={18} color="#000" />
          <Text style={styles.filterText}>{filterText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFilterText("Latest Ads");
            setLoading(true);
            fetchAds("latest");
          }}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Ads Grid */}
      <FlatList
        data={filteredAds}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={[styles.grid, { paddingBottom: 100 }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Product", { product: item })}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : "https://via.placeholder.com/150",
              }}
              style={styles.image}
            />
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noResults}>No items found</Text>
        }
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchAds("latest");
        }}
      />
    </View>
  );
}

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
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: "#000" },

  /* 🔔 Notification Styles */
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  notificationBox: {
    width: "75%",
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 70,
    marginRight: 10,
    padding: 15,
    elevation: 5,
  },
  notifTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  notifItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  notifText: { marginLeft: 8, fontSize: 14, color: "#333" },
  noNotif: { fontSize: 14, color: "#555", textAlign: "center", marginTop: 20 },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterLeft: { flexDirection: "row", alignItems: "center" },
  filterText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: "#000" },
  resetText: { fontSize: 14, fontWeight: "500", color: "red" },

  /* 📊 Filter Modal (Bottom Sheet) */
  overlaySmall: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  smallFilterBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterOptionText: { fontSize: 14, color: "#000", textAlign: "center" },

  grid: { paddingHorizontal: spacing },
  item: {
    width: itemSize,
    marginBottom: spacing,
    marginHorizontal: spacing / 2,
  },
  image: {
    width: "100%",
    height: itemSize,
    resizeMode: "cover",
    borderRadius: 10,
  },
  productTitle: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#555",
  },
});
