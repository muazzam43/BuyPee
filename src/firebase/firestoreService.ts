// src/firebase/firestoreService.ts
import { db, auth } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// 📤 Create a new ad
export const createAd = async (title: string, price: string, tags: string[], images: string[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const ad = {
    title,
    price,
    tags,
    images,
    userId: user.uid,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, "ads"), ad);
  return { id: docRef.id, ...ad };
};

// 📥 Get all ads (except current user's ads)
export const getAllAds = async () => {
  const user = auth.currentUser;
  const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((ad: any) => ad.userId !== user?.uid);
};

// 📥 Get ads of logged-in user
export const getUserAds = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const q = query(
    collection(db, "ads"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
