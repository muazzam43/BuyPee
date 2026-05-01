import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import Contacts, { Contact } from "react-native-contacts";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { addGroup } from "../../redux/groupSlice";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NewGroupScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    requestContacts();
  }, []);

  const requestContacts = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts Permission",
          message: "This app would like to view your contacts.",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        loadContacts();
      }
    } else {
      loadContacts();
    }
  };

  const loadContacts = () => {
    Contacts.getAll()
      .then((contactsList) => {
        const cleaned = contactsList.filter((c) => !!c.recordID);
        setContacts(cleaned);
        setFilteredContacts(cleaned);
      })
      .catch((err) => console.warn(err));
  };

  const toggleSelect = (contact: Contact) => {
    if (selected.find((c) => c.recordID === contact.recordID)) {
      setSelected(selected.filter((c) => c.recordID !== contact.recordID));
    } else {
      setSelected([...selected, contact]);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const lower = text.toLowerCase();
      setFilteredContacts(
        contacts.filter((c) =>
          (c.displayName || "").toLowerCase().includes(lower)
        )
      );
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selected.length === 0) {
      Alert.alert("Error", "Please select at least one contact");
      return;
    }

    try {
      // 🔹 Create group document in Firestore
      const docRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        avatar: "https://cdn-icons-png.flaticon.com/512/194/194938.png", // default group avatar
        members: selected.map((c) => ({
          id: c.recordID,
          name: c.displayName || "Unknown",
          avatar:
            c.hasThumbnail && c.thumbnailPath
              ? c.thumbnailPath
              : "https://via.placeholder.com/40",
        })),
        createdAt: serverTimestamp(),
      });

      // 🔹 Also update Redux store (optional, if you still use it)
      dispatch(
        addGroup({
          id: docRef.id,
          name: groupName,
          members: selected.map((c) => ({
            id: c.recordID,
            name: c.displayName || "Unknown",
            avatar:
              c.hasThumbnail && c.thumbnailPath
                ? c.thumbnailPath
                : "https://via.placeholder.com/40",
          })),
        })
      );

      // 🔹 Navigate to GroupsChat
      navigation.replace("GroupsChat", {
        groupId: docRef.id,
      });
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    }
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = !!selected.find((c) => c.recordID === item.recordID);
    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => toggleSelect(item)}
      >
        <Image
          source={{
            uri:
              item.hasThumbnail && item.thumbnailPath
                ? item.thumbnailPath
                : "https://via.placeholder.com/40",
          }}
          style={styles.avatar}
        />
        <Text style={styles.contactName} numberOfLines={1}>
          {item.displayName || "Unknown"}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={22} color="green" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          New Group ({selected.length} Selected)
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search contacts"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Group Name Input */}
      <TextInput
        placeholder="Type Group Name"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />

      {/* Selected Members */}
      {selected.length > 0 && (
        <FlatList
          horizontal
          data={selected}
          keyExtractor={(item) => item.recordID}
          renderItem={({ item }) => (
            <View style={styles.selectedItem}>
              <Image
                source={{
                  uri:
                    item.hasThumbnail && item.thumbnailPath
                      ? item.thumbnailPath
                      : "https://via.placeholder.com/40",
                }}
                style={styles.avatarSmall}
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => toggleSelect(item)}
              >
                <Ionicons name="close-circle" size={18} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Contact List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.recordID}
        renderItem={renderContact}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Floating Create Button */}
      <TouchableOpacity
        style={[
          styles.createBtn,
          { opacity: !groupName || selected.length === 0 ? 0.5 : 1 },
        ]}
        disabled={!groupName || selected.length === 0}
        onPress={handleCreateGroup}
      >
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    padding: 15,
    justifyContent: "space-between",
  },
  headerTitle:
  {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 5,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  searchInput:
  {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 10,
    margin: 10,
    fontSize: 15,
    color: "#000",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  avatar:
  {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarSmall:
  {
    width: 35,
    height: 35,
    borderRadius: 20
  },
  contactName:
  {
    marginLeft: 10,
    fontSize: 16,
    flex: 1, color: "#000",
  },
  selectedItem:
  {
    margin: 5,
    alignItems: "center",
  },
  removeBtn:
  {
    position: "absolute",
    top: -5, right: -5,
  },
  createBtn: {
    backgroundColor: "#FFD600",
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
});
