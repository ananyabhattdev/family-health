import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserProfile} from '../types';

const PROFILE_KEY_PREFIX = 'family_health_profile_';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY_PREFIX + userId);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(
  userId: string,
  profile: UserProfile,
): Promise<void> {
  await AsyncStorage.setItem(
    PROFILE_KEY_PREFIX + userId,
    JSON.stringify(profile),
  );
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const existing = (await getProfile(userId)) ?? {};
  const updated = {...existing, ...updates};
  await saveProfile(userId, updated);
  return updated;
}
