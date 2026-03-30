'use strict';

const { getProfile, updateProfile, setProfile } = require('../models/userProfile');

/**
 * GET /api/users/:id/profile
 * Returns the profile for the given user.
 */
function getUserProfile(req, res) {
  const { id } = req.params;
  const profile = getProfile(id);

  if (!profile) {
    return res.status(404).json({ error: `Profile not found for user '${id}'.` });
  }

  return res.status(200).json({ userId: id, profile });
}

/**
 * PUT /api/users/:id/profile
 * Updates (partially or fully) the profile for the given user.
 * If the user does not yet have a profile, one is created.
 */
function updateUserProfile(req, res) {
  const { id } = req.params;
  const updates = req.body;

  // Sanitize string fields
  const sanitized = sanitizeUpdates(updates);

  const existing = getProfile(id);
  if (!existing) {
    // First-time profile creation via PUT
    setProfile(id, sanitized);
    return res.status(201).json({ userId: id, profile: getProfile(id) });
  }

  const updated = updateProfile(id, sanitized);
  return res.status(200).json({ userId: id, profile: updated });
}

/**
 * Trims string fields and normalises array items.
 * @param {object} updates
 * @returns {object}
 */
function sanitizeUpdates(updates) {
  const result = { ...updates };

  if (typeof result.name === 'string') {
    result.name = result.name.trim();
  }

  if (Array.isArray(result.allergies)) {
    result.allergies = result.allergies.map((a) => a.trim());
  }

  if (Array.isArray(result.medicalConditions)) {
    result.medicalConditions = result.medicalConditions.map((c) => c.trim());
  }

  if (result.emergencyContact && typeof result.emergencyContact === 'object') {
    const ec = result.emergencyContact;
    result.emergencyContact = {
      ...ec,
      name: typeof ec.name === 'string' ? ec.name.trim() : ec.name,
      phone: typeof ec.phone === 'string' ? ec.phone.trim() : ec.phone,
      relationship:
        typeof ec.relationship === 'string' ? ec.relationship.trim() : ec.relationship,
    };
  }

  return result;
}

module.exports = { getUserProfile, updateUserProfile };
