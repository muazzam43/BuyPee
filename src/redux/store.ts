import { configureStore } from "@reduxjs/toolkit";
import contactReducer from "./contactSlice";
import groupReducer from "./groupSlice";
import chatReducer from "./chatSlice"; // ✅ import your chat slice

export const store = configureStore({
  reducer: {
    contacts: contactReducer,
    groups: groupReducer,
    chats: chatReducer, // ✅ add chats reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
