import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// -----------------
// Types
// -----------------
export type Chat = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage?: string;
  updatedAt?: number;
};

type ChatState = {
  chats: Chat[];
  loading: boolean;
  error: string | null;
};

const initialState: ChatState = {
  chats: [],
  loading: false,
  error: null,
};

// -----------------
// Fetch chats from Firestore (users/{userId}/chats)
// -----------------
export const fetchChats = createAsyncThunk<
  Chat[],
  string,
  { rejectValue: string }
>("chats/fetchChats", async (userId, { rejectWithValue }) => {
  try {
    const q = query(
      collection(db, "users", userId, "chats"),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<Chat, "id">; // exclude id
      return { id: docSnap.id, ...data };
    });
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// -----------------
// Add or update a chat in Firestore
// -----------------
export const addChat = createAsyncThunk<
  Chat,
  { userId: string; contact: Chat },
  { rejectValue: string }
>("chats/addChat", async ({ userId, contact }, { rejectWithValue }) => {
  try {
    const chatRef = doc(db, "users", userId, "chats", contact.id);

    const { id, ...rest } = contact; // remove id before spreading
    const chatData = {
      ...rest,
      updatedAt: Timestamp.now().toMillis(),
    };

    await setDoc(chatRef, chatData, { merge: true });

    return { id, ...chatData };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// -----------------
// Slice
// -----------------
const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchChats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch chats";
      })

      // addChat
      .addCase(addChat.fulfilled, (state, action) => {
        const existing = state.chats.find((c) => c.id === action.payload.id);
        if (existing) {
          Object.assign(existing, action.payload); // update
        } else {
          state.chats.unshift(action.payload); // insert at top
        }
      })
      .addCase(addChat.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to add chat";
      });
  },
});

export default chatSlice.reducer;
