// Simple test to check authentication status
import AsyncStorage from "@react-native-async-storage/async-storage";

async function checkAuth() {
  try {
    const [accessToken, userRole, userEmail, userId] =
      await AsyncStorage.multiGet([
        "accessToken",
        "userRole",
        "userEmail",
        "userId",
      ]);

    console.log("Auth status:", {
      hasToken: !!accessToken[1],
      userRole: userRole[1],
      userEmail: userEmail[1],
      userId: userId[1],
    });
  } catch (error) {
    console.error("Error checking auth:", error);
  }
}

checkAuth();
