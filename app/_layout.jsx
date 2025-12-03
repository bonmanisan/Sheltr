import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

const tokenCache = { 
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);

      if (item) {
        console.log(`${key} was used\n`);
      } else {
        console.log("No values stored under key: " + key);
      }

      return item;

    } catch (error) {
      console.error("SecureStore get item error: ", error);

      // Correct spelling
      await SecureStore.deleteItemAsync(key);

      return null;
    }
  },

  async saveToken(key, value) {
    try {
      // Correct spelling
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const publishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
    >
      <Stack>
        <Stack.Screen name="index" />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login/index"
          options={{ headerShown: false }}
        />
      </Stack>
    </ClerkProvider>
  );
}
