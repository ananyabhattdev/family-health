'use strict';

const { Router } = require('express');
const { listFamilyMembers, addMember, removeMember } = require('../controllers/familyController');
const { validateAddFamilyMemberMiddleware } = require('../middleware/validation');

const router = Router();

/**
 * GET /api/users/:id/family
 */
router.get('/:id/family', listFamilyMembers);

/**
 * POST /api/users/:id/family
 */
router.post('/:id/family', validateAddFamilyMemberMiddleware, addMember);

/**
 * DELETE /api/users/:id/family/:memberId
 */
router.delete('/:id/family/:memberId', removeMember);

module.exports = router;
