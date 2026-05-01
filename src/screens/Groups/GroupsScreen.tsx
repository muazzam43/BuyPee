import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Group = {
  id: string;
  name: string;
  avatar: string;
};

const { width } = Dimensions.get("window");

const GroupsScreen = () => {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 🔹 Fetch groups from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "groups"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Group[] = [];
      snapshot.forEach((doc: DocumentData) => {
        const data = doc.data() as Partial<Group>;
        list.push({
          id: doc.id,
          name: data.name || "Unnamed Group",
          avatar:
            data.avatar ||
            "https://cdn-icons-png.flaticon.com/512/194/194938.png",
        });
      });
      setGroups(list);
    });
    return unsubscribe;
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddGroup = () => {
    navigation.navigate("NewGroup");
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() =>
        navigation.navigate("GroupsChat", {
          groupId: item.id,
          groupName: item.name,
          avatar: item.avatar,
        })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.groupName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Groups</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleAddGroup}>
            <Icon name="add" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {/* Group List */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default GroupsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6C90E",
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#000",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3B0",
    borderRadius: 20,
    margin: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#000",
    fontSize: width * 0.04,
  },
  searchIcon: {
    marginLeft: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: (width * 0.12) / 2,
    marginRight: 12,
  },
  groupName: {
    fontSize: width * 0.042,
    fontWeight: "500",
    color: "#000",
  },
});
