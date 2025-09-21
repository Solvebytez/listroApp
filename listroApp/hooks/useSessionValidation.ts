import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";

export const useBackgroundSessionValidation = (interval = 30000) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Don't check session if user is on auth screens
        if (
          pathname?.includes("(auth)") ||
          pathname === "/" ||
          pathname === "/index"
        ) {
          return;
        }

        // Check if user has a token before making API call
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          return; // No token, no need to check
        }

        // Make a simple API call to validate session
        await api.get("/users/profile");
      } catch (error: any) {
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || "";
          if (
            errorMessage.includes("logged in elsewhere") ||
            errorMessage.includes("Session expired")
          ) {
            console.log(
              "🔐 Background session check - logged in elsewhere detected"
            );

            // Clear all authentication data
            await AsyncStorage.multiRemove([
              "accessToken",
              "userRole",
              "userEmail",
              "userId",
              "tokenTimestamp",
              "hasCompletedOnboarding",
            ]);

            // Store session expiry message for display
            await AsyncStorage.setItem(
              "sessionExpiredMessage",
              "You have been logged out because you logged in on another device."
            );

            // Clear React Query cache
            queryClient.clear();

            // Navigate to login screen
            router.replace("/(auth)/role-selection");
          }
        }
      }
    };

    // Start checking every specified interval (default 30 seconds)
    intervalRef.current = setInterval(checkSession, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient, interval, pathname]);
};
