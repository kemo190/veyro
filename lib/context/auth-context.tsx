"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, Restaurant } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { dbService } from "@/lib/supabase/service";

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRestaurant: Restaurant | null;
  isLoading: boolean;
  isMounted: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const loadCurrentAuth = async () => {
    try {
      setIsLoading(true);
      const profile = await dbService.getCurrentProfile();
      setCurrentUser(profile);

      if (profile?.restaurantId) {
        const rest = await dbService.getRestaurantById(profile.restaurantId);
        setCurrentRestaurant(rest);
      } else {
        setCurrentRestaurant(null);
      }
    } catch (e) {
      console.error("Error loading Supabase auth profile:", e);
      setCurrentUser(null);
      setCurrentRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadCurrentAuth();

    // Listen to Supabase auth state changes in real time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        await loadCurrentAuth();
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setCurrentRestaurant(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await dbService.logout();
    setCurrentUser(null);
    setCurrentRestaurant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRestaurant,
        isLoading,
        isMounted,
        logout,
        refreshAuth: loadCurrentAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
