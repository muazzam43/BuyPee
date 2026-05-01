import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Share,
  PermissionsAndroid,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, Contact } from "../types/navigation";
import Contacts from "react-native-contacts";
import { useDispatch } from "react-redux";
import { setContacts } from "../redux/contactSlice";
import { AppDispatch } from "../redux/store"; 
import { getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";


type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Contacts">;

export default function ContactsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [phoneContacts, setPhoneContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 📩 Invite
  const invitePerson = async (name: string) => {
    try {
      await Share.share({
        message: `Hey ${name}, join me on this awesome app! Download now: https://yourapp.link`,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  // 🔑 Fetch contacts
  const getContacts = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "android") {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission denied", "Cannot access contacts.");
          setLoading(false);
          return;
        }
      }

      const contactsList = await Contacts.getAll();
      const formatted: Contact[] = contactsList.map((c) => ({
        id: c.recordID,
        name: c.displayName ?? "Unknown",
        phone: c.phoneNumbers[0]?.number || "",
        avatar: c.thumbnailPath || "https://via.placeholder.com/44",
      }));

      setPhoneContacts(formatted);
      dispatch(setContacts(formatted));
    } catch (e) {
      console.log("Error fetching contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  // 🆕 Start chat in Firestore
  const startChat = async (contact: Contact) => {
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in first.");
      return;
    }

    const otherUserId = contact.id;
    const chatId =
      user.uid < otherUserId
        ? `${user.uid}_${otherUserId}`
        : `${otherUserId}_${user.uid}`;

    try {
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [user.uid, otherUserId],
          lastMessage: "",
          updatedAt: serverTimestamp(),
          users: {
            [user.uid]: {
              name: user.displayName || "You",
              avatar: user.photoURL || "",
            },
            [otherUserId]: {
              name: contact.name,
              avatar: contact.avatar,
              phone: contact.phone,
            },
          },
        },
        { merge: true }
      );

      navigation.navigate("ChatScreen", {
        chatId,
        otherUserId,
        otherUserName: contact.name,
        avatar: contact.avatar,
        contact,
      });
    } catch (err) {
      console.error("Error starting chat:", err);
      Alert.alert("Error", "Could not start chat.");
    }
  };

  // Merge contacts with invite section
  const allContacts: Contact[] = [
    ...phoneContacts,
    { id: "inviteHeader", name: "", phone: "", avatar: "", type: "inviteHeader" },
    {
      id: "i1",
      name: "Elena Yuri",
      phone: "+971 00 000 0000",
      avatar: "https://randomuser.me/api/portraits/women/36.jpg",
      invite: true,
    },
    {
      id: "i2",
      name: "John Eric",
      phone: "+971 00 000 0000",
      avatar: "https://randomuser.me/api/portraits/men/37.jpg",
      invite: true,
    },
    {
      id: "i3",
      name: "Athalia Putri",
      phone: "+971 00 000 0000",
      avatar: "https://randomuser.me/api/portraits/women/39.jpg",
      invite: true,
    },
  ];

  // 🔎 Filter contacts by search
  const filteredContacts = allContacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  // Render contact row
  const renderItem = ({ item }: { item: Contact }) => {
    if (item.type === "inviteHeader") {
      return (
        <View style={styles.inviteRow}>
          <Text style={styles.inviteTitle}>Invite People</Text>
          <Text style={styles.count}>
            ({allContacts.length - phoneContacts.length - 1} Contacts)
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => {
          if (item.invite) {
            invitePerson(item.name ?? "").then(() =>
              console.log("Invite sent")
            );
          } else {
            startChat(item); // ✅ Use Firestore chat creation
          }
        }}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
        {item.invite && (
          <View style={styles.inviteBtn}>
            <Text style={styles.inviteText}>INVITE</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity onPress={getContacts}>
          <Ionicons
            name={loading ? "sync" : "refresh"}
            size={22}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {/* 🔎 Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* FlatList */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="send-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F6C90E",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#000",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  phone: {
    fontSize: 13,
    color: "#777",
  },
  inviteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F6C90E",
    borderRadius: 20,
  },
  inviteText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginRight: 6,
  },
  count: {
    fontSize: 13,
    color: "#888",
    fontWeight: "400",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#F6C90E",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
