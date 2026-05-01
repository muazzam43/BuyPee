import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

// ✅ Types
type GroupChatRouteProp = RouteProp<RootStackParamList, "GroupsChat">;
type GroupChatNavProp = NavigationProp<RootStackParamList, "GroupsChat">;

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
};

const GroupChatScreen = () => {
  const navigation = useNavigation<GroupChatNavProp>();
  const route = useRoute<GroupChatRouteProp>();
  const { groupId, groupName, avatar } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // 🔹 Fetch messages in real-time
  useEffect(() => {
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Message, "id">;
        list.push({ id: doc.id, ...data });
      });
      setMessages(list);
    });
    return unsub;
  }, [groupId]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!input.trim() || !auth.currentUser) return;

    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: input,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || "Unknown",
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  // 🔹 Clear chat
  const clearChat = async () => {
    try {
      const msgsRef = collection(db, "groups", groupId, "messages");
      const snapshot = await getDocs(msgsRef);

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "groups", groupId, "messages", docSnap.id))
      );
      await Promise.all(deletePromises);

      Alert.alert("Chat Cleared", "All messages have been deleted.");
    } catch (error) {
      console.error("Error clearing chat:", error);
      Alert.alert("Error", "Failed to clear chat.");
    }
  };

  // 🔹 Options for menu
  const handleMenuPress = () => {
    Alert.alert("Group Options", "Choose an action", [
      {
        text: "Clear Chat",
        style: "destructive",
        onPress: () => clearChat(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ✅ Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() =>
            navigation.navigate("GroupInfo", { groupId, groupName, avatar })
          }
        >
          <Icon name="account-group" size={28} color="#000" />
          <Text style={styles.headerTitle}>{groupName ?? "Group Chat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMenuPress}>
          <Icon name="dots-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ✅ Messages */}
      <FlatList
        style={{ flex: 1, padding: 10 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = item.senderId === auth.currentUser?.uid;
          return (
            <View
              style={[
                styles.message,
                isMe ? styles.myMessage : styles.otherMessage,
              ]}
            >
              {!isMe && (
                <Text style={styles.senderName}>{item.senderName}</Text>
              )}
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          );
        }}
      />

      {/* ✅ Input box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default GroupChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    backgroundColor: "#F6C90E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  message: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFD600",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    color: "#000",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#F6C90E",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
