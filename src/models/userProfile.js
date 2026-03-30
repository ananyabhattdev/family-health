'use strict';

// In-memory store for user profiles (keyed by userId)
const profileStore = new Map();

/**
 * Creates or replaces a user profile entry in the store.
 * @param {string} userId
 * @param {object} profile
 */
function setProfile(userId, profile) {
  profileStore.set(userId, { ...profile });
}

/**
 * Retrieves a user profile from the store.
 * @param {string} userId
 * @returns {object|undefined}
 */
function getProfile(userId) {
  const profile = profileStore.get(userId);
  return profile ? { ...profile } : undefined;
}

/**
 * Updates an existing user profile with the provided fields.
 * @param {string} userId
 * @param {object} updates
 * @returns {object|null} Updated profile, or null if user not found.
 */
function updateProfile(userId, updates) {
  if (!profileStore.has(userId)) {
    return null;
  }
  const current = profileStore.get(userId);
  const updated = { ...current, ...updates };
  profileStore.set(userId, updated);
  return { ...updated };
}

/**
 * Resets the store (used in tests).
 */
function resetStore() {
  profileStore.clear();
}

module.exports = { setProfile, getProfile, updateProfile, resetStore };
