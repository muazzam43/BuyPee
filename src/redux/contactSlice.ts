
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Contact {
  id: string;
  name: string;
  avatar: string;
}

interface ContactState {
  allContacts: Contact[];
  selectedContacts: string[];
}

const initialState: ContactState = {
  allContacts: [],
  selectedContacts: [],
};

const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.allContacts = action.payload;
    },
    toggleSelectContact: (state, action: PayloadAction<string>) => {
      if (state.selectedContacts.includes(action.payload)) {
        state.selectedContacts = state.selectedContacts.filter(
          (id) => id !== action.payload
        );
      } else {
        state.selectedContacts.push(action.payload);
      }
    },
    clearSelection: (state) => {
      state.selectedContacts = [];
    },
  },
});

export const { setContacts, toggleSelectContact, clearSelection } =
  contactSlice.actions;
export default contactSlice.reducer;