/**
 * Universal Storage - Abstraction qui utilise localStorage sur web et AsyncStorage sur mobile
 */
import { Platform } from 'react-native';

// Import conditionnel : AsyncStorage uniquement sur mobile
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

class UniversalStorageClass {
  private isWeb = Platform.OS === 'web';

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('[UniversalStorage] Error setItem:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        return localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('[UniversalStorage] Error getItem:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('[UniversalStorage] Error removeItem:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.isWeb) {
        return Object.keys(localStorage);
      } else {
        return await AsyncStorage.getAllKeys();
      }
    } catch (error) {
      console.error('[UniversalStorage] Error getAllKeys:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('[UniversalStorage] Error clear:', error);
      throw error;
    }
  }
}

export const UniversalStorage = new UniversalStorageClass();
