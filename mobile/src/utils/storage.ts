/**
 * Storage Utility
 * Uses AsyncStorage for persistent storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

// Storage wrapper functions
export const storageUtils = {
  // String operations
  getString: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },
  
  setString: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },
  
  // Object operations (JSON)
  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  
  setObject: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  
  // Boolean operations
  getBoolean: async (key: string): Promise<boolean> => {
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  },
  
  setBoolean: async (key: string, value: boolean): Promise<void> => {
    await AsyncStorage.setItem(key, String(value));
  },
  
  // Number operations
  getNumber: async (key: string): Promise<number | undefined> => {
    const value = await AsyncStorage.getItem(key);
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  },
  
  setNumber: async (key: string, value: number): Promise<void> => {
    await AsyncStorage.setItem(key, String(value));
  },
  
  // Delete and clear
  delete: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
  
  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
  
  // Check if key exists
  contains: async (key: string): Promise<boolean> => {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  },
  
  // Get all keys
  getAllKeys: async (): Promise<readonly string[]> => {
    return await AsyncStorage.getAllKeys();
  },
};

// Zustand storage adapter (async version)
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

export default AsyncStorage;
