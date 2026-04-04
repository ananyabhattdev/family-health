'use strict';

// In-memory store: maps ownerId -> Set of memberIds
const familyStore = new Map();

/**
 * Returns the Set of member IDs for an owner, creating it if necessary.
 * @param {string} ownerId
 * @returns {Set<string>}
 */
function getFamilySet(ownerId) {
  if (!familyStore.has(ownerId)) {
    familyStore.set(ownerId, new Set());
  }
  return familyStore.get(ownerId);
}

/**
 * Returns an array of member IDs for the given owner.
 * @param {string} ownerId
 * @returns {string[]}
 */
function getFamilyMembers(ownerId) {
  return [...getFamilySet(ownerId)];
}

/**
 * Adds a member ID to the owner's family. Returns false if already present.
 * @param {string} ownerId
 * @param {string} memberId
 * @returns {boolean} true if added, false if already a member
 */
function addFamilyMember(ownerId, memberId) {
  const members = getFamilySet(ownerId);
  if (members.has(memberId)) {
    return false;
  }
  members.add(memberId);
  return true;
}

/**
 * Removes a member ID from the owner's family. Returns false if not present.
 * @param {string} ownerId
 * @param {string} memberId
 * @returns {boolean} true if removed, false if not found
 */
function removeFamilyMember(ownerId, memberId) {
  const members = getFamilySet(ownerId);
  if (!members.has(memberId)) {
    return false;
  }
  members.delete(memberId);
  return true;
}

/**
 * Resets the store (used in tests).
 */
function resetFamilyStore() {
  familyStore.clear();
}

module.exports = { getFamilyMembers, addFamilyMember, removeFamilyMember, resetFamilyStore };
