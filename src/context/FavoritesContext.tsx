// src/context/FavoritesContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Product = {
  id: string | number;
  title: string;
  price: string;
  image?: any;
  seller?: string;
  sellerImage?: any;
  tags?: string[];
};

type FavoritesContextType = {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (id: string | number) => void;
  toggleFavorite: (product: Product) => boolean;
  isFavorite: (id: string | number) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => { },
  removeFavorite: () => { },
  toggleFavorite: () => false,
  isFavorite: () => false,
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  // ✅ Load favorites whenever auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFavorites([]);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.favorites) {
            setFavorites(data.favorites);
          } else {
            setFavorites([]);
          }
        }
      } catch (err) {
        console.log("Error loading favorites:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Save favorites to Firestore whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = doc(db, "users", user.uid);
        await setDoc(ref, { favorites }, { merge: true });
      } catch (err) {
        console.log("Error saving favorites:", err);
      }
    };

    if (favorites) {
      saveFavorites();
    }
  }, [favorites]);

  const addFavorite = (product: Product) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev; // no duplicates

      // ✅ normalize product to always include "image"
      const normalizedProduct: Product = {
        ...product,
        image:
          product.image ||
          (product as any).images?.[0] || // if coming from ads with "images"
          "https://via.placeholder.com/150", // fallback
      };

      return [...prev, normalizedProduct];
    });
  };


  const removeFavorite = (id: string | number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleFavorite = (product: Product): boolean => {
    if (favorites.some((item) => item.id === product.id)) {
      removeFavorite(product.id);
      return false; // removed
    } else {
      addFavorite(product);
      return true; // added
    }
  };

  const isFavorite = (id: string | number): boolean => {
    return favorites.some((item) => item.id === id);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
