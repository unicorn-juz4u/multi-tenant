import request from 'supertest';
import { setupTestDB } from './setup.js';
import { RefreshToken } from '../src/models/RefreshToken.js';

describe('Auth Endpoints', () => {
  const { getApp } = setupTestDB();

  const validOwnerPayload = {
    tenantName: 'Stark Industries',
    name: 'Tony Stark',
    email: 'tony@stark.test',
    password: 'Password@123',
  };

  it('POST /api/auth/register should create tenant, owner user, return access token and set refresh cookie', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send(validOwnerPayload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('tony@stark.test');
    expect(res.body.data.user.role).toBe('owner');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.tenant.name).toBe('Stark Industries');
    expect(res.body.data.accessToken).toBeDefined();

    // Check cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/refreshToken=/);
    expect(cookies[0]).toMatch(/HttpOnly/);
  });

  it('POST /api/auth/register should reject weak passwords', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({
        ...validOwnerPayload,
        password: 'weak',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/login should authenticate valid credentials', async () => {
    await request(getApp()).post('/api/auth/register').send(validOwnerPayload);

    const res = await request(getApp())
      .post('/api/auth/login')
      .send({
        email: 'tony@stark.test',
        password: 'Password@123',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.name).toBe('Tony Stark');
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
  });

  it('POST /api/auth/login should return generic Invalid credentials on failure without user enumeration', async () => {
    await request(getApp()).post('/api/auth/register').send(validOwnerPayload);

    const res = await request(getApp())
      .post('/api/auth/login')
      .send({
        email: 'tony@stark.test',
        password: 'WrongPassword@999',
      })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('POST /api/auth/refresh should rotate refresh token and issue new access token', async () => {
    const regRes = await request(getApp()).post('/api/auth/register').send(validOwnerPayload);
    const initialCookie = regRes.headers['set-cookie'];

    const res = await request(getApp())
      .post('/api/auth/refresh')
      .set('Cookie', initialCookie)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();

    // Refresh token rotation: verify cookie changed
    const newCookie = res.headers['set-cookie'];
    expect(newCookie).toBeDefined();

    // The old refresh token should no longer be valid
    await request(getApp())
      .post('/api/auth/refresh')
      .set('Cookie', initialCookie)
      .expect(401);
  });

  it('POST /api/auth/logout should revoke token and clear cookie', async () => {
    const regRes = await request(getApp()).post('/api/auth/register').send(validOwnerPayload);
    const cookie = regRes.headers['set-cookie'];

    const res = await request(getApp())
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.success).toBe(true);
    // Cookie cleared
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=;/);

    // Tokens in DB removed
    const count = await RefreshToken.countDocuments();
    expect(count).toBe(0);
  });

  it('GET /api/auth/me should return user and tenant for valid token', async () => {
    const regRes = await request(getApp()).post('/api/auth/register').send(validOwnerPayload);
    const token = regRes.body.data.accessToken;

    const res = await request(getApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('tony@stark.test');
    expect(res.body.data.tenant.name).toBe('Stark Industries');
  });

  it('GET /api/auth/me should reject request without token', async () => {
    const res = await request(getApp()).get('/api/auth/me').expect(401);
    expect(res.body.success).toBe(false);
  });
});
