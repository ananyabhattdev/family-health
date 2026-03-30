'use strict';

const request = require('supertest');
const app = require('../src/app');
const { resetStore, setProfile } = require('../src/models/userProfile');

beforeEach(() => {
  resetStore();
});

describe('GET /api/users/:id/profile', () => {
  it('returns 404 when profile does not exist', async () => {
    const res = await request(app).get('/api/users/user-1/profile');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with the stored profile', async () => {
    const profile = {
      name: 'Alice Smith',
      dateOfBirth: '1985-06-15',
      gender: 'female',
      bloodType: 'A+',
      allergies: ['peanuts'],
      medicalConditions: ['hypertension'],
      emergencyContact: { name: 'Bob Smith', phone: '+1-555-0100', relationship: 'spouse' },
    };
    setProfile('user-1', profile);

    const res = await request(app).get('/api/users/user-1/profile');
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-1');
    expect(res.body.profile).toMatchObject(profile);
  });
});

describe('PUT /api/users/:id/profile', () => {
  it('creates a new profile (201) when none exists', async () => {
    const payload = {
      name: 'Carol Jones',
      dateOfBirth: '1990-03-22',
      gender: 'female',
      bloodType: 'O-',
      allergies: [],
      medicalConditions: [],
    };

    const res = await request(app).put('/api/users/user-2/profile').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('user-2');
    expect(res.body.profile.name).toBe('Carol Jones');
    expect(res.body.profile.bloodType).toBe('O-');
  });

  it('updates an existing profile (200) with partial data', async () => {
    setProfile('user-3', {
      name: 'Dave Brown',
      gender: 'male',
      bloodType: 'B+',
      allergies: [],
      medicalConditions: [],
    });

    const res = await request(app)
      .put('/api/users/user-3/profile')
      .send({ allergies: ['shellfish', 'gluten'] });

    expect(res.status).toBe(200);
    expect(res.body.profile.allergies).toEqual(['shellfish', 'gluten']);
    // Other fields must remain unchanged
    expect(res.body.profile.name).toBe('Dave Brown');
    expect(res.body.profile.bloodType).toBe('B+');
  });

  it('trims whitespace from string fields', async () => {
    const res = await request(app)
      .put('/api/users/user-4/profile')
      .send({ name: '  Eve White  ', gender: 'female' });

    expect(res.status).toBe(201);
    expect(res.body.profile.name).toBe('Eve White');
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).put('/api/users/user-5/profile').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for an invalid bloodType', async () => {
    const res = await request(app)
      .put('/api/users/user-6/profile')
      .send({ bloodType: 'Z+' });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('bloodType')])
    );
  });

  it('returns 400 for an invalid gender', async () => {
    const res = await request(app)
      .put('/api/users/user-7/profile')
      .send({ gender: 'unknown-value' });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('gender')])
    );
  });

  it('returns 400 when dateOfBirth is in the future', async () => {
    const res = await request(app)
      .put('/api/users/user-8/profile')
      .send({ dateOfBirth: '2099-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('dateOfBirth')])
    );
  });

  it('returns 400 when allergies is not an array', async () => {
    const res = await request(app)
      .put('/api/users/user-9/profile')
      .send({ allergies: 'peanuts' });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('allergies')])
    );
  });

  it('validates emergencyContact fields', async () => {
    const res = await request(app)
      .put('/api/users/user-10/profile')
      .send({ emergencyContact: { name: '', phone: '' } });

    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThanOrEqual(2);
  });

  it('accepts a valid emergencyContact', async () => {
    const res = await request(app).put('/api/users/user-11/profile').send({
      name: 'Frank Green',
      emergencyContact: { name: 'Grace Green', phone: '+44-20-7946-0958', relationship: 'parent' },
    });

    expect(res.status).toBe(201);
    expect(res.body.profile.emergencyContact.name).toBe('Grace Green');
    expect(res.body.profile.emergencyContact.relationship).toBe('parent');
  });

  it('returns 400 when name is an empty string', async () => {
    const res = await request(app).put('/api/users/user-12/profile').send({ name: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('name')])
    );
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});
