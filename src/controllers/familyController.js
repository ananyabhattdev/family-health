'use strict';

const { getFamilyMembers, addFamilyMember, removeFamilyMember } = require('../models/familyStore');
const { getProfile } = require('../models/userProfile');

/**
 * GET /api/users/:id/family
 * Returns the list of family members (with their profiles) for the given owner.
 */
function listFamilyMembers(req, res) {
  const { id } = req.params;

  if (!getProfile(id)) {
    return res.status(404).json({ error: `Profile not found for user '${id}'.` });
  }

  const memberIds = getFamilyMembers(id);
  const members = memberIds.map((memberId) => ({
    memberId,
    profile: getProfile(memberId),
  }));

  return res.status(200).json({ userId: id, members });
}

/**
 * POST /api/users/:id/family
 * Adds an existing user as a family member of the given owner.
 * Body: { memberId: string }
 */
function addMember(req, res) {
  const { id } = req.params;
  const { memberId } = req.body;

  if (!getProfile(id)) {
    return res.status(404).json({ error: `Profile not found for user '${id}'.` });
  }

  if (id === memberId) {
    return res.status(400).json({ error: 'A user cannot add themselves as a family member.' });
  }

  if (!getProfile(memberId)) {
    return res.status(404).json({ error: `Profile not found for member '${memberId}'.` });
  }

  const added = addFamilyMember(id, memberId);
  if (!added) {
    return res.status(409).json({ error: `User '${memberId}' is already a family member.` });
  }

  return res.status(201).json({
    userId: id,
    memberId,
    profile: getProfile(memberId),
  });
}

/**
 * DELETE /api/users/:id/family/:memberId
 * Removes a family member from the given owner's family list.
 */
function removeMember(req, res) {
  const { id, memberId } = req.params;

  if (!getProfile(id)) {
    return res.status(404).json({ error: `Profile not found for user '${id}'.` });
  }

  const removed = removeFamilyMember(id, memberId);
  if (!removed) {
    return res.status(404).json({ error: `Member '${memberId}' not found in family.` });
  }

  return res.status(200).json({ userId: id, memberId, message: 'Family member removed.' });
}

module.exports = { listFamilyMembers, addMember, removeMember };
