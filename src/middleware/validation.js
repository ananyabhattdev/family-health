'use strict';

const ALLOWED_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ALLOWED_GENDERS = ['male', 'female', 'non-binary', 'other', 'prefer not to say'];

/**
 * Validates a profile update payload.
 * Returns an array of error messages (empty if valid).
 * @param {object} body
 * @returns {string[]}
 */
function validateProfileUpdate(body) {
  const errors = [];

  if (Object.keys(body).length === 0) {
    errors.push('Request body must not be empty.');
    return errors;
  }

  if ('name' in body) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('name must be a non-empty string.');
    } else if (body.name.trim().length > 100) {
      errors.push('name must not exceed 100 characters.');
    }
  }

  if ('dateOfBirth' in body) {
    const dob = new Date(body.dateOfBirth);
    if (!body.dateOfBirth || isNaN(dob.getTime())) {
      errors.push('dateOfBirth must be a valid ISO 8601 date string.');
    } else if (dob > new Date()) {
      errors.push('dateOfBirth must not be in the future.');
    }
  }

  if ('gender' in body) {
    if (!ALLOWED_GENDERS.includes(body.gender)) {
      errors.push(`gender must be one of: ${ALLOWED_GENDERS.join(', ')}.`);
    }
  }

  if ('bloodType' in body) {
    if (!ALLOWED_BLOOD_TYPES.includes(body.bloodType)) {
      errors.push(`bloodType must be one of: ${ALLOWED_BLOOD_TYPES.join(', ')}.`);
    }
  }

  if ('allergies' in body) {
    if (!Array.isArray(body.allergies)) {
      errors.push('allergies must be an array of strings.');
    } else if (body.allergies.some((a) => typeof a !== 'string' || a.trim().length === 0)) {
      errors.push('Each allergy must be a non-empty string.');
    }
  }

  if ('medicalConditions' in body) {
    if (!Array.isArray(body.medicalConditions)) {
      errors.push('medicalConditions must be an array of strings.');
    } else if (body.medicalConditions.some((c) => typeof c !== 'string' || c.trim().length === 0)) {
      errors.push('Each medical condition must be a non-empty string.');
    }
  }

  if ('emergencyContact' in body) {
    const ec = body.emergencyContact;
    if (typeof ec !== 'object' || ec === null || Array.isArray(ec)) {
      errors.push('emergencyContact must be an object.');
    } else {
      if (!ec.name || typeof ec.name !== 'string' || ec.name.trim().length === 0) {
        errors.push('emergencyContact.name must be a non-empty string.');
      }
      if (!ec.phone || typeof ec.phone !== 'string' || ec.phone.trim().length === 0) {
        errors.push('emergencyContact.phone must be a non-empty string.');
      }
      if (ec.relationship !== undefined && typeof ec.relationship !== 'string') {
        errors.push('emergencyContact.relationship must be a string.');
      }
    }
  }

  return errors;
}

/**
 * Express middleware that validates the profile update body.
 */
function validateProfileUpdateMiddleware(req, res, next) {
  const errors = validateProfileUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }
  next();
}

/**
 * Validates the body for adding a family member.
 * Returns an array of error messages (empty if valid).
 * @param {object} body
 * @returns {string[]}
 */
function validateAddFamilyMember(body) {
  const errors = [];

  if (!body.memberId || typeof body.memberId !== 'string' || body.memberId.trim().length === 0) {
    errors.push('memberId must be a non-empty string.');
  }

  return errors;
}

/**
 * Express middleware that validates the add-family-member body.
 */
function validateAddFamilyMemberMiddleware(req, res, next) {
  const errors = validateAddFamilyMember(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }
  next();
}

module.exports = {
  validateProfileUpdate,
  validateProfileUpdateMiddleware,
  validateAddFamilyMember,
  validateAddFamilyMemberMiddleware,
};
