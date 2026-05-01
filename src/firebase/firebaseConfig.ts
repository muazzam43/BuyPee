import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// 🔑 Replace with your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyCWsU6CyC-TZsBe8UFunr8HmeNbHCE9eaE",
  authDomain: "buypee-d3468.firebaseapp.com",
  projectId:"buypee-d3468",
  storageBucket: "buypee-d3468.appspot.com",
  messagingSenderId: "884984493905",
  appId: "1:884984493905:android:c30cf21a93c31e045d8570", // 👈 find this in google-services.json
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Add this