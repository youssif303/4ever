import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedState } from '@/types';

const STORAGE_KEY = '@4ever/state-v1';

const emptyState: PersistedState = {
  conversations: [],
  moods: [],
  profile: { firstName: '', email: '' },
  therapistRequest: null,
  groupRequests: [],
};

export async function loadState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...emptyState,
      ...parsed,
      profile: { ...emptyState.profile, ...parsed.profile },
    };
  } catch {
    return emptyState;
  }
}

export async function persistState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}