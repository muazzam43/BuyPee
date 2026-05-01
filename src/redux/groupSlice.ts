import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Group, Member } from "../types/navigation"; // ✅ use shared types

interface GroupsState {
  groups: Group[];
}

const initialState: GroupsState = {
  groups: [],
};

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    // Add a new group
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },

    // Remove a member from a group
    removeMember: (
      state,
      action: PayloadAction<{ groupId: string; memberId: string }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.members = group.members.filter(
          (m) => m.id !== action.payload.memberId
        );
      }
    },

    // Add a member to a group
    addMember: (
      state,
      action: PayloadAction<{ groupId: string; member: Member }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.members.push(action.payload.member);
      }
    },

    // Delete a group
    deleteGroup: (state, action: PayloadAction<{ groupId: string }>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload.groupId);
    },

    // ✅ Update a group's image
    updateGroupImage: (
      state,
      action: PayloadAction<{ groupId: string; image: string }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.image = action.payload.image;
      }
    },
  },
});

export const { addGroup, removeMember, addMember, deleteGroup, updateGroupImage } =
  groupSlice.actions;

export default groupSlice.reducer;
