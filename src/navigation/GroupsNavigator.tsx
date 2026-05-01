import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "../screens/Groups/GroupsScreen";
import GroupDetailScreen from "../screens/Groups/GroupInfoScreen";
import NewGroupScreen from "../screens/Groups/NewGroupScreen";

export type GroupsStackParamList = {
  Groups: undefined;
  GroupDetail: { group: any };
  NewGroup: undefined;
};

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export default function GroupsNavigator() {
  return (
    <Stack.Navigator initialRouteName="Groups" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="NewGroup" component={NewGroupScreen} />
    </Stack.Navigator>
  );
}
