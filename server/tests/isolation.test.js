import request from 'supertest';
import { setupTestDB } from './setup.js';

describe('Tenant Isolation & RBAC Integration Tests', () => {
  const { getApp } = setupTestDB();

  let tenantAOwnerToken;
  let tenantAAdminToken;
  let tenantAMemberToken;
  let tenantAId;
  let tenantAProject;

  let tenantBOwnerToken;
  let tenantBMemberToken;
  let tenantBId;
  let tenantBProject;

  beforeEach(async () => {
    // 1. Register Tenant A (Alpha Corp)
    const resA = await request(getApp()).post('/api/auth/register').send({
      tenantName: 'Alpha Corp',
      name: 'Alice Alpha',
      email: 'alice@alpha.test',
      password: 'Password@123',
    });
    tenantAOwnerToken = resA.body.data.accessToken;
    tenantAId = resA.body.data.tenant.id;

    // Create Admin and Member in Tenant A
    const adminResA = await request(getApp())
      .post('/api/users')
      .set('Authorization', `Bearer ${tenantAOwnerToken}`)
      .send({
        name: 'Aaron Admin',
        email: 'admin@alpha.test',
        password: 'Password@123',
        role: 'admin',
      });
    const adminLoginResA = await request(getApp()).post('/api/auth/login').send({
      email: 'admin@alpha.test',
      password: 'Password@123',
    });
    tenantAAdminToken = adminLoginResA.body.data.accessToken;

    const memberResA = await request(getApp())
      .post('/api/users')
      .set('Authorization', `Bearer ${tenantAOwnerToken}`)
      .send({
        name: 'Mike Member',
        email: 'member@alpha.test',
        password: 'Password@123',
        role: 'member',
      });
    const memberLoginResA = await request(getApp()).post('/api/auth/login').send({
      email: 'member@alpha.test',
      password: 'Password@123',
    });
    tenantAMemberToken = memberLoginResA.body.data.accessToken;

    // Create project for Tenant A
    const projectResA = await request(getApp())
      .post('/api/projects')
      .set('Authorization', `Bearer ${tenantAOwnerToken}`)
      .send({
        name: 'Alpha Secret Project',
        description: 'Classified Alpha Corp initiative',
        status: 'active',
      });
    tenantAProject = projectResA.body.data;

    // 2. Register Tenant B (Beta Industries)
    const resB = await request(getApp()).post('/api/auth/register').send({
      tenantName: 'Beta Industries',
      name: 'Bob Beta',
      email: 'bob@beta.test',
      password: 'Password@123',
    });
    tenantBOwnerToken = resB.body.data.accessToken;
    tenantBId = resB.body.data.tenant.id;

    // Create Member in Tenant B
    await request(getApp())
      .post('/api/users')
      .set('Authorization', `Bearer ${tenantBOwnerToken}`)
      .send({
        name: 'Betty Beta',
        email: 'member@beta.test',
        password: 'Password@123',
        role: 'member',
      });
    const memberLoginResB = await request(getApp()).post('/api/auth/login').send({
      email: 'member@beta.test',
      password: 'Password@123',
    });
    tenantBMemberToken = memberLoginResB.body.data.accessToken;

    // Create project for Tenant B
    const projectResB = await request(getApp())
      .post('/api/projects')
      .set('Authorization', `Bearer ${tenantBOwnerToken}`)
      .send({
        name: 'Beta Propulsion Tech',
        description: 'Proprietary Beta Industries tech',
        status: 'planning',
      });
    tenantBProject = projectResB.body.data;
  });

  describe('Row-Level Tenant Isolation Enforcement', () => {
    it('Tenant A cannot read Tenant B project via direct ID lookup (MUST return 404, not 403)', async () => {
      const res = await request(getApp())
        .get(`/api/projects/${tenantBProject.id}`)
        .set('Authorization', `Bearer ${tenantAOwnerToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('Tenant A cannot update Tenant B project (MUST return 404, not 403)', async () => {
      const res = await request(getApp())
        .patch(`/api/projects/${tenantBProject.id}`)
        .set('Authorization', `Bearer ${tenantAOwnerToken}`)
        .send({ name: 'Hacked Project Name' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('Tenant A cannot delete Tenant B project (MUST return 404, not 403)', async () => {
      const res = await request(getApp())
        .delete(`/api/projects/${tenantBProject.id}`)
        .set('Authorization', `Bearer ${tenantAOwnerToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('Tenant project list NEVER leaks another tenant data', async () => {
      const resA = await request(getApp())
        .get('/api/projects')
        .set('Authorization', `Bearer ${tenantAOwnerToken}`)
        .expect(200);

      expect(resA.body.data).toHaveLength(1);
      expect(resA.body.data[0].name).toBe('Alpha Secret Project');
      expect(resA.body.data.some((p) => p.name === 'Beta Propulsion Tech')).toBe(false);

      const resB = await request(getApp())
        .get('/api/projects')
        .set('Authorization', `Bearer ${tenantBOwnerToken}`)
        .expect(200);

      expect(resB.body.data).toHaveLength(1);
      expect(resB.body.data[0].name).toBe('Beta Propulsion Tech');
      expect(resB.body.data.some((p) => p.name === 'Alpha Secret Project')).toBe(false);
    });

    it('Spoofing tenantId in request body is stripped and ignored', async () => {
      const res = await request(getApp())
        .post('/api/projects')
        .set('Authorization', `Bearer ${tenantAOwnerToken}`)
        .send({
          name: 'Spoofed Project',
          description: 'Attempting to inject into Tenant B',
          tenantId: tenantBId, // Spoofed!
        })
        .expect(201);

      // Must be assigned to Tenant A regardless of client input
      expect(res.body.data.tenantId).toBe(tenantAId);
      expect(res.body.data.tenantId).not.toBe(tenantBId);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('Members cannot list or manage users (returns 403)', async () => {
      const res = await request(getApp())
        .get('/api/users')
        .set('Authorization', `Bearer ${tenantAMemberToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it('Members cannot update tenant settings (returns 403)', async () => {
      const res = await request(getApp())
        .patch('/api/tenant')
        .set('Authorization', `Bearer ${tenantAMemberToken}`)
        .send({ name: 'Unauthorized Renaming' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Admins cannot update tenant settings (returns 403, owner only)', async () => {
      const res = await request(getApp())
        .patch('/api/tenant')
        .set('Authorization', `Bearer ${tenantAAdminToken}`)
        .send({ name: 'Admin Renaming' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Owners can update tenant settings (returns 200)', async () => {
      const res = await request(getApp())
        .patch('/api/tenant')
        .set('Authorization', `Bearer ${tenantAOwnerToken}`)
        .send({ name: 'Alpha Corporation Worldwide', plan: 'enterprise' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alpha Corporation Worldwide');
      expect(res.body.data.plan).toBe('enterprise');
    });

    it('Members cannot delete projects (returns 403)', async () => {
      const res = await request(getApp())
        .delete(`/api/projects/${tenantAProject.id}`)
        .set('Authorization', `Bearer ${tenantAMemberToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Members can create their own projects and update their own projects', async () => {
      const createRes = await request(getApp())
        .post('/api/projects')
        .set('Authorization', `Bearer ${tenantAMemberToken}`)
        .send({
          name: 'Member Project',
          description: 'Created by member',
        })
        .expect(201);

      const memberProjectId = createRes.body.data.id;

      const updateRes = await request(getApp())
        .patch(`/api/projects/${memberProjectId}`)
        .set('Authorization', `Bearer ${tenantAMemberToken}`)
        .send({
          name: 'Member Project Updated',
        })
        .expect(200);

      expect(updateRes.body.data.name).toBe('Member Project Updated');
    });

    it('Members cannot update projects created by other users (returns 403)', async () => {
      const res = await request(getApp())
        .patch(`/api/projects/${tenantAProject.id}`)
        .set('Authorization', `Bearer ${tenantAMemberToken}`)
        .send({
          name: 'Attempted Hijack',
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});
