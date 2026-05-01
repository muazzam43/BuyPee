import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Save a notification in Firestore
 * @param title - Notification text
 * @param type - "ad" | "message"
 * @param data - Extra data (adId, chatId, etc.)
 * @param receiverId - Who should get the notification
 */
export const createNotification = async (
  title: string,
  type: "ad" | "message",
  data: any,
  receiverId: string
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      type,
      data,
      receiverId,         
      createdAt: serverTimestamp(),
    });
    console.log("Notification created:", title);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
