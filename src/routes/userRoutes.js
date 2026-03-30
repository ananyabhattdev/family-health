'use strict';

const { Router } = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { validateProfileUpdateMiddleware } = require('../middleware/validation');

const router = Router();

/**
 * GET /api/users/:id/profile
 */
router.get('/:id/profile', getUserProfile);

/**
 * PUT /api/users/:id/profile
 */
router.put('/:id/profile', validateProfileUpdateMiddleware, updateUserProfile);

module.exports = router;
