import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase/firebaseConfig";

/* Screens */
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import BottomTabs from "./src/navigation/BottomTabs";
import { RootStackParamList } from "./src/types/navigation";
import ProductScreen from "./src/screens/ProductScreen";
import ChatList from "./src/screens/ChatList";
import ChatScreen from "./src/screens/ChatScreen";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import GroupsScreen from "./src/screens/Groups/GroupsScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import DeleteAcountScreen from "./src/screens/DeleteAcountScreen";
import GroupsChatScreen from "./src/screens/Groups/GroupsChatScreen";
import GroupInfoScreen from "./src/screens/Groups/GroupInfoScreen";
import NewGroupScreen from "./src/screens/Groups/NewGroupScreen";
import CreateAdScreen from "./src/screens/CreateAdScreen";
import MyAdsScreen from "./src/screens/MyAdsScreen";
import GroupsNavigator from "./src/navigation/GroupsNavigator";
import ContactsScreen from "./src/screens/ContactsScreen";
import SupportScreen from "./src/screens/SupportScreen";
import LogoutScreen from "./src/screens/LogoutScreen";

/* Root Stack */
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoading ? (
              <Stack.Screen name="Splash" component={SplashScreen} />
            ) : isLoggedIn ? (
              <Stack.Screen name="Main">
                {(props) => (
                  <MainNavigator {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="LoginScreen">
                  {(props) => (
                    <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Signup">
                  {(props) => (
                    <SignupScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                  )}
                </Stack.Screen>
              </>
            )}

            <Stack.Screen name="GroupsNavigator" component={GroupsNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </Provider>
  );
}

/* ✅ Main Navigator */
const MainStack = createNativeStackNavigator<RootStackParamList>();

type MainNavigatorProps = {
  setIsLoggedIn: (value: boolean) => void;
};

function MainNavigator({ setIsLoggedIn }: MainNavigatorProps) {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="BottomTabs" component={BottomTabs} />
      <MainStack.Screen name="Product" component={ProductScreen} />
      <MainStack.Screen name="ChatList" component={ChatList} />
      <MainStack.Screen name="ChatScreen" component={ChatScreen} />
      <MainStack.Screen name="CreateAd" component={CreateAdScreen} />
      <MainStack.Screen name="MyAds" component={MyAdsScreen} />
      <MainStack.Screen name="Favorites" component={FavoritesScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="Groups" component={GroupsScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <MainStack.Screen name="DeleteAcount" component={DeleteAcountScreen} />
      <MainStack.Screen name="NewGroup" component={NewGroupScreen} />

      {/* Groups */}
      <MainStack.Screen name="GroupsChat" component={GroupsChatScreen} />
      <MainStack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <MainStack.Screen name="GroupsNavigator" component={GroupsNavigator} />
      <MainStack.Screen name="Contacts" component={ContactsScreen} />
      <MainStack.Screen name="Support" component={SupportScreen} />

      {/* Logout */}
      <MainStack.Screen name="Logout">
        {(props) => <LogoutScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
}
