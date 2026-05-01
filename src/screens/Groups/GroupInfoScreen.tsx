// src/screens/Groups/GroupInfoScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
  Alert,
  TextInput,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import {
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { RootStackParamList } from "../../types/navigation";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Contacts from "react-native-contacts";

type GroupInfoRouteProp = RouteProp<RootStackParamList, "GroupInfo">;

export default function GroupInfoScreen() {
  const route = useRoute<GroupInfoRouteProp>();
  const navigation = useNavigation();
  const { groupId, groupName, avatar } = route.params;

  const [group, setGroup] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(groupName || "");
  const [newImage, setNewImage] = useState(avatar || "");
  const [contacts, setContacts] = useState<any[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ new loading state

  // 🔹 Listen to Firestore group
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "groups", groupId), (snapshot) => {
      if (snapshot.exists()) {
        setGroup(snapshot.data());
        if (!newName) setNewName(snapshot.data().name);
        if (!newImage) setNewImage(snapshot.data().avatar);
      } else {
        setGroup(null);
      }
      setLoading(false); // ✅ stop loading once Firestore responds
    });
    return unsub;
  }, [groupId]);

  // 🔹 Load device contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (Platform.OS === "android") {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
          );
          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permission Denied", "Cannot access contacts.");
            return;
          }
        }
        const contactsList = await Contacts.getAll();
        const formatted = contactsList.map((c) => ({
          id: c.recordID,
          name: c.displayName,
          avatar: c?.thumbnailPath || "https://via.placeholder.com/40",
          phone: c?.phoneNumbers?.[0]?.number || "",
        }));
        setContacts(formatted);
      } catch (err) {
        console.warn("Error fetching contacts:", err);
      }
    };
    loadContacts();
  }, []);

  // ✅ While loading, show spinner (no flicker)
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading group...</Text>
      </SafeAreaView>
    );
  }

  // ✅ Show "not found" only after loading finishes
  if (!group) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.warning}>⚠️ Group not found</Text>
      </SafeAreaView>
    );
  }

  // 🔹 Remove Member
  const handleRemove = async (member: any) => {
    await updateDoc(doc(db, "groups", groupId), {
      members: arrayRemove(member),
    });
  };

  // 🔹 Delete Group
  const handleDeleteGroup = async () => {
    Alert.alert("Delete Group", "Are you sure you want to delete this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "groups", groupId));
          navigation.goBack();
        },
      },
    ]);
  };

  // 🔹 Add Member
  const handleAddMember = async (contact: any) => {
    await updateDoc(doc(db, "groups", groupId), {
      members: arrayUnion(contact),
    });
    setShowContacts(false);
  };

  // 🔹 Pick Group Image
  const pickImage = () => {
    Alert.alert("Upload Group Image", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const result = await launchCamera({ mediaType: "photo" });
          if (result.assets && result.assets[0].uri) {
            setNewImage(result.assets[0].uri);
            await updateDoc(doc(db, "groups", groupId), {
              avatar: result.assets[0].uri,
            });
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: "photo" });
          if (result.assets && result.assets[0].uri) {
            setNewImage(result.assets[0].uri);
            await updateDoc(doc(db, "groups", groupId), {
              avatar: result.assets[0].uri,
            });
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // 🔹 Save edits
  const saveGroupEdits = async () => {
    await updateDoc(doc(db, "groups", groupId), {
      name: newName,
    });
    setIsEditing(false);
  };

  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberCard}>
      <Image
        source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
        style={styles.avatar}
      />
      <Text style={styles.memberName}>{item.name}</Text>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
        <Ionicons name="remove-circle" size={26} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Info</Text>
        <TouchableOpacity onPress={handleDeleteGroup}>
          <Ionicons name="trash-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <TouchableOpacity onPress={pickImage}>
          {newImage ? (
            <Image source={{ uri: newImage }} style={styles.groupIconImage} />
          ) : (
            <View style={styles.groupIcon}>
              <Ionicons name="people-outline" size={60} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.groupTitleRow}>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity onPress={saveGroupEdits}>
              <Ionicons name="checkmark" size={22} color="green" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.groupTitleRow}>
            <Text style={styles.groupName}>{newName}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil-outline" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Members */}
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowContacts(true)}>
        <Ionicons name="person-add-outline" size={20} color="#000" />
        <Text style={styles.addBtnText}>Add Members</Text>
      </TouchableOpacity>

      {/* Members List */}
      <Text style={styles.memberLabel}>Members</Text>
      {(!group.members || group.members.length === 0) ? (
        <Text style={styles.noMembers}>No members yet</Text>
      ) : (
        <FlatList
          data={group.members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
        />
      )}

      {/* Contacts Modal */}
      <Modal visible={showContacts} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.contactCard}
                  onPress={() => handleAddMember(item)}
                >
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <Text style={styles.memberName}>{item.name}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowContacts(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: 
  { 
    flex: 1, 
    backgroundColor: "#fff"
   },
  center: 
  { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
   },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFD600",
    padding: 15,
    alignItems: "center",
  },
  headerTitle: 
  { fontSize: 16, 
    fontWeight: "600", 
    color: "#000", 
  },
  warning: 
  { textAlign: "center", 
    marginTop: 50, 
    fontSize: 16, 
    color: "red",
  },
  groupInfo: 
  { alignItems: "center", 
    marginTop: 20 
  },
  groupIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  groupIconImage: 
  {
     width: 100, 
    height: 100, 
    borderRadius: 50
   },
  groupTitleRow: 
  { 
    flexDirection: "row", 
    alignItems: "center",
     marginTop: 10 ,
    },
  groupName: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 5,
  },
  input:
   {
    color: "#000",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    width: 150,
    marginRight: 10,
  },
  addBtn: 
  {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    padding: 12,
    margin: 20,
    borderRadius: 10,
  },
  addBtnText: 
  { marginLeft: 10, 
    fontSize: 16, 
    fontWeight: "600", 
  },
  memberLabel: 
  { marginLeft: 20, 
    marginTop: 10, 
    fontSize: 16, 
    fontWeight: "600", 
  },
  noMembers: 
  { marginLeft: 20, 
    marginTop: 10, 
    color: "#888", 
  },
  memberCard: 
  {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginVertical: 6,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 2,
  },
  avatar: 
  { width: 40, 
    height: 40, 
    borderRadius: 20 
  },
  memberName: 
  {
    fontWeight:"semibold",
    color: "#000",
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  removeBtn: { padding: 5 },
  modalOverlay: 
  {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: 
  {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 10,
    maxHeight: "70%",
  },
  modalTitle: 
  { fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 15 
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  closeBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
});
