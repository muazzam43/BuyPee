import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import AudioRecorderPlayer from "react-native-audio-recorder-player";

interface Message {
  id: string;
  text?: string;
  sender: string;
  time: number;
  type: "text" | "image" | "audio";
  mediaUri?: string;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { otherUserId, otherUserName, avatar } = route.params || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const user = getAuth().currentUser;

  // ✅ Firestore listener
  useEffect(() => {
    if (!user || !otherUserId) return;

    const q = query(
      collection(db, "users", user.uid, "chats", otherUserId, "messages"),
      orderBy("time", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Message),
        id: docSnap.id,
      }));
      setMessages(data);
    });

    return () => unsubscribe();
  }, [user, otherUserId]);

  // 🔥 Helper: save to both users
  const saveMessage = async (msg: Omit<Message, "id">) => {
    if (!user) return;

    const senderRef = collection(
      db,
      "users",
      user.uid,
      "chats",
      otherUserId,
      "messages"
    );
    const receiverRef = collection(
      db,
      "users",
      otherUserId,
      "chats",
      user.uid,
      "messages"
    );

    await Promise.all([addDoc(senderRef, msg), addDoc(receiverRef, msg)]);
  };

  // 📩 Send text
  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    await saveMessage({
      text: input,
      sender: user.uid,
      time: Date.now(),
      type: "text",
    });
    setInput("");
  };

  // 📸 Camera
  const openCamera = async () => {
    const result = await launchCamera({ mediaType: "photo", quality: 0.8 });
    if (result.assets?.[0]?.uri && user) {
      await saveMessage({
        sender: user.uid,
        time: Date.now(),
        type: "image",
        mediaUri: result.assets[0].uri,
      });
    }
  };

  // 🖼️ Gallery
  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType: "photo" });
    if (result.assets?.[0]?.uri && user) {
      await saveMessage({
        sender: user.uid,
        time: Date.now(),
        type: "image",
        mediaUri: result.assets[0].uri,
      });
    }
  };

  // 🎙️ Voice message
  const startRecording = async () => {
    setRecording(true);
    await audioRecorderPlayer.startRecorder();
  };

  const stopRecording = async () => {
    const uri = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    audioRecorderPlayer.removeRecordBackListener();

    if (uri && user) {
      await saveMessage({
        sender: user.uid,
        time: Date.now(),
        type: "audio",
        mediaUri: uri,
      });
    }
  };

  // ▶️ Play audio
  const playAudio = async (uri: string, id: string) => {
    if (playingId === id) {
      await audioRecorderPlayer.stopPlayer();
      setPlayingId(null);
    } else {
      setPlayingId(id);
      await audioRecorderPlayer.startPlayer(uri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition >= e.duration) {
          setPlayingId(null);
          audioRecorderPlayer.stopPlayer();
        }
        return;
      });
    }
  };

  // ❌ Clear chat
  const clearChat = async () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          if (!user) return;
          const q = collection(
            db,
            "users",
            user.uid,
            "chats",
            otherUserId,
            "messages"
          );
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            await deleteDoc(doc(q, d.id));
          }
        },
      },
    ]);
  };

  // 🎨 Render message
  const renderItem = ({ item }: { item: Message }) => {
    if (item.type === "image") {
      return (
        <View
          style={[
            styles.messageContainer,
            item.sender === user?.uid ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Image source={{ uri: item.mediaUri }} style={styles.imageMsg} />
          <Text style={styles.timeText}>
            {new Date(item.time).toLocaleTimeString()}
          </Text>
        </View>
      );
    }

    if (item.type === "audio") {
      return (
        <TouchableOpacity
          onPress={() => playAudio(item.mediaUri!, item.id)}
          style={[
            styles.messageContainer,
            item.sender === user?.uid ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={styles.messageText}>
            {playingId === item.id ? "⏸️ Playing..." : "🎤 Voice Message"}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.time).toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === user?.uid ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {new Date(item.time).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/40" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{otherUserName || "Unknown"}</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatArea}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
          <Icon name="camera" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={openGallery}>
          <Icon name="image" size={28} color="#000" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type here"
          value={input}
          onChangeText={setInput}
        />

        {/* 🎙️ Voice Record */}
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={styles.iconButton}
        >
          <Icon
            name={recording ? "microphone" : "microphone-outline"}
            size={28}
            color={recording ? "red" : "#000"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={sendMessage}>
          <Icon name="send-circle" size={36} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F6C90E",
    justifyContent: "space-between",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  userName: { fontWeight: "bold", fontSize: 16, color: "#000" },
  userStatus: { fontSize: 12, color: "green" },

  chatArea: { padding: 10 },

  messageContainer: {
    maxWidth: "70%",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#F6C90E",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
  },
  messageText: { fontSize: 15, color: "#000" },
  timeText: { fontSize: 10, color: "gray", marginTop: 5, textAlign: "right" },

  imageMsg: { width: 150, height: 150, borderRadius: 10, marginBottom: 5 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 10,
    color: "#000",
  },
  iconButton: {
    paddingHorizontal: 5,
  },
});

export default ChatScreen;
