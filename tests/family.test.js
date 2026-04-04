'use strict';

const request = require('supertest');
const app = require('../src/app');
const { resetStore, setProfile } = require('../src/models/userProfile');
const { resetFamilyStore } = require('../src/models/familyStore');

beforeEach(() => {
  resetStore();
  resetFamilyStore();
});

// Helper: seed a profile with minimal valid data
function seedProfile(id, name = `User ${id}`) {
  setProfile(id, { name, dateOfBirth: '1990-01-01', gender: 'other' });
}

describe('GET /api/users/:id/family', () => {
  it('returns 404 when the owner profile does not exist', async () => {
    const res = await request(app).get('/api/users/owner-1/family');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns an empty members list when owner has no family members', async () => {
    seedProfile('owner-1');
    const res = await request(app).get('/api/users/owner-1/family');
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('owner-1');
    expect(res.body.members).toEqual([]);
  });

  it('returns members with their profiles after adding them', async () => {
    seedProfile('owner-1');
    seedProfile('member-1', 'Alice');
    seedProfile('member-2', 'Bob');

    await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-1' });
    await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-2' });

    const res = await request(app).get('/api/users/owner-1/family');
    expect(res.status).toBe(200);
    expect(res.body.members).toHaveLength(2);
    const memberIds = res.body.members.map((m) => m.memberId);
    expect(memberIds).toContain('member-1');
    expect(memberIds).toContain('member-2');

    const alice = res.body.members.find((m) => m.memberId === 'member-1');
    expect(alice.profile.name).toBe('Alice');
  });
});

describe('POST /api/users/:id/family', () => {
  it('returns 400 when memberId is missing', async () => {
    seedProfile('owner-1');
    const res = await request(app).post('/api/users/owner-1/family').send({});
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('memberId')])
    );
  });

  it('returns 400 when memberId is an empty string', async () => {
    seedProfile('owner-1');
    const res = await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when the owner profile does not exist', async () => {
    seedProfile('member-1');
    const res = await request(app)
      .post('/api/users/unknown-owner/family')
      .send({ memberId: 'member-1' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/unknown-owner/);
  });

  it('returns 404 when the member profile does not exist', async () => {
    seedProfile('owner-1');
    const res = await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'nonexistent-member' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/nonexistent-member/);
  });

  it('returns 400 when owner tries to add themselves', async () => {
    seedProfile('owner-1');
    const res = await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'owner-1' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 201 and the member profile on success', async () => {
    seedProfile('owner-1');
    seedProfile('member-1', 'Alice');

    const res = await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-1' });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('owner-1');
    expect(res.body.memberId).toBe('member-1');
    expect(res.body.profile.name).toBe('Alice');
  });

  it('returns 409 when the member is already in the family', async () => {
    seedProfile('owner-1');
    seedProfile('member-1', 'Alice');

    await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-1' });

    const res = await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-1' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /api/users/:id/family/:memberId', () => {
  it('returns 404 when the owner profile does not exist', async () => {
    const res = await request(app).delete('/api/users/unknown-owner/family/member-1');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/unknown-owner/);
  });

  it('returns 404 when the member is not in the family', async () => {
    seedProfile('owner-1');
    const res = await request(app).delete('/api/users/owner-1/family/member-1');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/member-1/);
  });

  it('returns 200 and removes the member from the family', async () => {
    seedProfile('owner-1');
    seedProfile('member-1', 'Alice');

    await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-1' });

    const delRes = await request(app).delete('/api/users/owner-1/family/member-1');
    expect(delRes.status).toBe(200);
    expect(delRes.body.memberId).toBe('member-1');

    // Confirm the member is gone
    const listRes = await request(app).get('/api/users/owner-1/family');
    expect(listRes.body.members).toHaveLength(0);
  });

  it('family membership is unidirectional (removing from owner does not affect member)', async () => {
    seedProfile('owner-1');
    seedProfile('member-1', 'Alice');

    await request(app)
      .post('/api/users/owner-1/family')
      .send({ memberId: 'member-1' });
    await request(app)
      .post('/api/users/member-1/family')
      .send({ memberId: 'owner-1' });

    await request(app).delete('/api/users/owner-1/family/member-1');

    // owner-1's family is empty
    const ownerList = await request(app).get('/api/users/owner-1/family');
    expect(ownerList.body.members).toHaveLength(0);

    // member-1's family still has owner-1
    const memberList = await request(app).get('/api/users/member-1/family');
    expect(memberList.body.members).toHaveLength(1);
    expect(memberList.body.members[0].memberId).toBe('owner-1');
  });
});
