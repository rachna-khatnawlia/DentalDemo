import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "dentacare_access_token";
const REFRESH_TOKEN_KEY = "dentacare_refresh_token";
const USER_SESSION_KEY = "dentacare_user_session";

/**
 * Mobile Secure Storage wrapper.
 * Dynamically utilizes OS-backed Keychain (iOS) and Keystore (Android)
 * via expo-secure-store when compiled in the native binary.
 * Gracefully falls back to AsyncStorage and memory storage if the current
 * native APK/binary was prebuilt without the module mounted.
 */

let NativeSecureStore: any = null;
let isNativeSecureStoreAvailable = false;

try {
  // Safe dynamic require to prevent [runtime not ready] if native module isn't linked in current APK
  NativeSecureStore = require("expo-secure-store");
  isNativeSecureStoreAvailable = Boolean(NativeSecureStore && NativeSecureStore.setItemAsync);
} catch (e) {
  NativeSecureStore = null;
  isNativeSecureStoreAvailable = false;
}

const memoryStorage: Record<string, string> = {};

export const SecureStorage = {
  async setToken(token: string): Promise<void> {
    memoryStorage[ACCESS_TOKEN_KEY] = token;

    if (isNativeSecureStoreAvailable && Platform.OS !== "web") {
      try {
        await NativeSecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
          keychainAccessible: NativeSecureStore.AFTER_FIRST_UNLOCK,
        });
        return;
      } catch (e) {
        // Fallback to AsyncStorage if native module binding failed
      }
    }

    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      // Memory storage is already set
    }
  },

  async getToken(): Promise<string | null> {
    if (memoryStorage[ACCESS_TOKEN_KEY]) {
      return memoryStorage[ACCESS_TOKEN_KEY];
    }

    if (isNativeSecureStoreAvailable && Platform.OS !== "web") {
      try {
        const token = await NativeSecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (token) {
          memoryStorage[ACCESS_TOKEN_KEY] = token;
          return token;
        }
      } catch (e) {
        // Fallback to AsyncStorage
      }
    }

    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        memoryStorage[ACCESS_TOKEN_KEY] = token;
        return token;
      }
    } catch (e) {}

    return null;
  },

  async removeToken(): Promise<void> {
    delete memoryStorage[ACCESS_TOKEN_KEY];

    if (isNativeSecureStoreAvailable && Platform.OS !== "web") {
      try {
        await NativeSecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      } catch (e) {}
    }

    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (e) {}
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    memoryStorage[REFRESH_TOKEN_KEY] = refreshToken;

    if (isNativeSecureStoreAvailable && Platform.OS !== "web") {
      try {
        await NativeSecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, {
          keychainAccessible: NativeSecureStore.AFTER_FIRST_UNLOCK,
        });
        return;
      } catch (e) {}
    }

    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {}
  },

  async getRefreshToken(): Promise<string | null> {
    if (memoryStorage[REFRESH_TOKEN_KEY]) {
      return memoryStorage[REFRESH_TOKEN_KEY];
    }

    if (isNativeSecureStoreAvailable && Platform.OS !== "web") {
      try {
        const token = await NativeSecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (token) {
          memoryStorage[REFRESH_TOKEN_KEY] = token;
          return token;
        }
      } catch (e) {}
    }

    try {
      const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (token) {
        memoryStorage[REFRESH_TOKEN_KEY] = token;
        return token;
      }
    } catch (e) {}

    return null;
  },

  async clearAllTokens(): Promise<void> {
    await this.removeToken();
    delete memoryStorage[REFRESH_TOKEN_KEY];
    delete memoryStorage[USER_SESSION_KEY];

    if (isNativeSecureStoreAvailable && Platform.OS !== "web") {
      try {
        await NativeSecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await NativeSecureStore.deleteItemAsync(USER_SESSION_KEY);
      } catch (e) {}
    }

    try {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_SESSION_KEY);
    } catch (e) {}
  },
};

export default SecureStorage;
