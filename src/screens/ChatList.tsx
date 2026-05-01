import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type RootStackParamList = {
  ChatList: undefined;
  ChatScreen: {
    chatId: string;
    otherUserId: string;
    otherUserName: string;
    avatar?: string;
  };
};

type ChatListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ChatList"
>;

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigationProp>();

  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    // ❌ removed orderBy("updatedAt", "desc") to avoid index requirement
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const otherUserId = data.participants.find(
            (p: string) => p !== user.uid
          );

          let otherUser: any = {};
          if (data.users?.[otherUserId]) {
            otherUser = data.users[otherUserId];
          } else {
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) {
              otherUser = userDoc.data();
            }
          }

          return {
            id: docSnap.id,
            chatId: docSnap.id,
            otherUserId,
            name: otherUser.name || "Unknown",
            avatar: otherUser.avatar || "https://via.placeholder.com/44",
            lastMessage: data.lastMessage || "",
            updatedAt: data.updatedAt?.toDate?.() || null,
          };
        })
      );

      // ✅ Sort manually in JS by updatedAt (latest first)
      chatList.sort(
        (a, b) =>
          (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0)
      );

      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(search.toLowerCase()) ||
      (chat.lastMessage || "").toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          chatId: item.chatId,
          otherUserId: item.otherUserId,
          otherUserName: item.name,
          avatar: item.avatar,
        })
      }
    >
      <View>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.onlineDot} />
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.time}>
          {item.updatedAt
            ? new Date(item.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#555" style={{ marginLeft: 10 }} />
        <TextInput
          placeholder="Search chats"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
            {loading ? "Loading chats..." : "No chats yet"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#F6C90E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    margin: 10,
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: "#000",
    fontSize: 14,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatInfo: { flex: 1, marginLeft: 12 },
  name: { color: "#000", fontWeight: "bold", fontSize: 16 },
  lastMessage: { color: "#555", marginTop: 2 },
  meta: { alignItems: "flex-end" },
  time: { fontSize: 12, color: "#999" },
});
