// src/types/navigation.ts
export interface Contact {
  id: string;
  name: string;  // ✅ fixed
  phone: string;
  avatar: string;
  invite?: boolean;
  type?: "inviteHeader";
}

export type Product = {
  id: string;
  title: string;
  image: any;
  price?: string;
  userImage?: any;
  userName?: string;
  tags?: string[];
  images?: any[];
};

// src/types/types.ts
export interface Member {
  id: string;
  name: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  image?: string; // ✅ optional group image
}

export type RootStackParamList = {
  Splash: undefined;
  LoginScreen: undefined;
  Signup: undefined;
  MainTabs: undefined;
  HomeScreen: undefined;
  BottomTabs: undefined;
  Main: undefined;
  Favorites: undefined;

  Product: { productTitle: string };
  ChatList: { productTitle: string };

  ChatScreen: { 
    chatId:string;
    otherUserId: string;
    otherUserName: string;
    avatar?: string;
    contact: Contact;
  };

  CreateAd: undefined;
  MyAds: undefined;
  Profile: undefined;
  Settings: undefined;
  Groups: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  DeleteAcount: undefined;

  NewGroup: undefined;
  GroupsChat: {
    groupId: string;
    groupName: string;
    avatar: string;
  };
  GroupInfo: {
    groupId: string;
    groupName: string;
    avatar?: string;
  };
  GroupsNavigator: undefined;

  Contacts: Contact;   // ✅ use the same Contact interface

  Support: undefined;
  Logout: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Chat: undefined;
  Profile: undefined;
};
