import AsyncStorage from '@react-native-async-storage/async-storage';

import { validSave } from './page-script';

/* One key holds the whole save, exactly as the game serialised it. The shell never looks inside it. */
const SAVE_KEY = 'omt.save.v1';

/** Reads the stored save. Never throws: on any failure the game falls back to its own localStorage copy. */
export async function loadSave(): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(SAVE_KEY);
    return validSave(v) ? v : null;
  } catch {
    return null;
  }
}

let latest: string | null = null;
let writing: Promise<void> = Promise.resolve();

/** Queues a write. Writes are serialised and only the newest waiting value is written, so a burst of saves
    cannot land out of order. Invalid values are ignored and never replace a good save. */
export function storeSave(v: unknown): boolean {
  if (!validSave(v)) return false;
  latest = v;
  writing = writing.then(async () => {
    const next = latest;
    if (next === null) return;
    latest = null;
    try {
      await AsyncStorage.setItem(SAVE_KEY, next);
    } catch {
      // Disk full or storage unavailable: the page still holds the value in localStorage, and the next
      // change will try again.
    }
  });
  return true;
}
