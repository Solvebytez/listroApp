import "react-native-gesture-handler";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { QueryProvider } from "../providers/QueryProvider";
import { useBackgroundSessionValidation } from "../hooks/useSessionValidation";

// Component that runs inside QueryProvider
function AppWithSessionValidation() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Component that uses React Query hooks
function AppWithSessionValidationWrapper() {
  // Run background session validation every 60 seconds for the entire app
  useBackgroundSessionValidation(60000);

  return <AppWithSessionValidation />;
}

export default function RootLayout() {
  useEffect(() => {
    console.log("RootLayout: Component mounted");
  }, []);

  return (
    <QueryProvider>
      <AppWithSessionValidationWrapper />
    </QueryProvider>
  );
}
