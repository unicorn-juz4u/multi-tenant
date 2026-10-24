import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/db.js';
import env from '../config/env.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { RefreshToken } from '../models/RefreshToken.js';

export const seedData = async (wipe = true) => {
  try {
    if (wipe) {
    console.log('[Seed] Wiping existing data...');
    await Promise.all([
      Tenant.deleteMany({}),
      User.deleteMany({}),
      Project.deleteMany({}),
      RefreshToken.deleteMany({}),
    ]);
  }

  console.log('[Seed] Creating tenants...');
    const acmeTenant = await Tenant.create({
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'pro',
    });

    const globexTenant = await Tenant.create({
      name: 'Globex Inc',
      slug: 'globex-inc',
      plan: 'enterprise',
    });

    console.log('[Seed] Hashing passwords with cost 12...');
    const passwordHash = await bcrypt.hash('Test@1234', 12);

    console.log('[Seed] Creating Acme Corp users...');
    const acmeOwner = await User.create({
      name: 'Alice Acme (Owner)',
      email: 'owner@acme.test',
      passwordHash,
      role: 'owner',
      tenantId: acmeTenant._id,
      isActive: true,
    });

    const acmeAdmin = await User.create({
      name: 'Adam Acme (Admin)',
      email: 'admin@acme.test',
      passwordHash,
      role: 'admin',
      tenantId: acmeTenant._id,
      isActive: true,
    });

    const acmeMember = await User.create({
      name: 'Mary Acme (Member)',
      email: 'member@acme.test',
      passwordHash,
      role: 'member',
      tenantId: acmeTenant._id,
      isActive: true,
    });

    console.log('[Seed] Creating Globex Inc users...');
    const globexOwner = await User.create({
      name: 'George Globex (Owner)',
      email: 'owner@globex.test',
      passwordHash,
      role: 'owner',
      tenantId: globexTenant._id,
      isActive: true,
    });

    const globexMember = await User.create({
      name: 'Gary Globex (Member)',
      email: 'member@globex.test',
      passwordHash,
      role: 'member',
      tenantId: globexTenant._id,
      isActive: true,
    });

    console.log('[Seed] Seeding Acme Corp projects (8 sample projects)...');
    const acmeProjects = [
      {
        name: 'Acme Falcon Rocket Thruster',
        description: 'Next generation propulsion system for low-orbit cargo transport.',
        status: 'active',
        tenantId: acmeTenant._id,
        createdBy: acmeOwner._id,
      },
      {
        name: 'Acme Quantum Tunneling Drill',
        description: 'Geological exploration apparatus utilizing harmonic resonance.',
        status: 'planning',
        tenantId: acmeTenant._id,
        createdBy: acmeAdmin._id,
      },
      {
        name: 'Acme Anvil Drop Safety Protocols',
        description: 'Comprehensive risk assessments and helmet distribution matrix.',
        status: 'completed',
        tenantId: acmeTenant._id,
        createdBy: acmeMember._id,
      },
      {
        name: 'Acme Desert Mirage Sensor Grid',
        description: 'Distributed optical arrays for thermal atmospheric distortion mapping.',
        status: 'active',
        tenantId: acmeTenant._id,
        createdBy: acmeOwner._id,
      },
      {
        name: 'Acme Giant Rubber Band Recoil Mechanism',
        description: 'Kinetic energy storage for rapid mechanical catapult deployment.',
        status: 'on_hold',
        tenantId: acmeTenant._id,
        createdBy: acmeAdmin._id,
      },
      {
        name: 'Acme Tornado in a Can v2.0',
        description: 'Atmospheric pressure containment canister for controlled vortices.',
        status: 'planning',
        tenantId: acmeTenant._id,
        createdBy: acmeMember._id,
      },
      {
        name: 'Acme Dehydrated Boulders Supply Chain',
        description: 'Just add water: compressed sedimentary rock distribution pipeline.',
        status: 'active',
        tenantId: acmeTenant._id,
        createdBy: acmeOwner._id,
      },
      {
        name: 'Acme Rocket Skates Firmware Update',
        description: 'Over-the-air Bluetooth telemetry and automatic braking patch.',
        status: 'archived',
        tenantId: acmeTenant._id,
        createdBy: acmeAdmin._id,
      },
    ];
    await Project.insertMany(acmeProjects);

    console.log('[Seed] Seeding Globex Inc projects (8 sample projects)...');
    const globexProjects = [
      {
        name: 'Globex Scorpio Orbital Defense',
        description: 'Planetary satellite shield array for telecommunications security.',
        status: 'active',
        tenantId: globexTenant._id,
        createdBy: globexOwner._id,
      },
      {
        name: 'Globex Cypress Creek Nuclear Plant Refit',
        description: 'Cooling tower efficiency upgrades and turbine vibration monitors.',
        status: 'planning',
        tenantId: globexTenant._id,
        createdBy: globexOwner._id,
      },
      {
        name: 'Globex Moccasin Loafers Logistics',
        description: 'Automated executive footwear inventory and wardrobe management.',
        status: 'completed',
        tenantId: globexTenant._id,
        createdBy: globexMember._id,
      },
      {
        name: 'Globex Doomsday Thermal Core',
        description: 'Deep subterranean geothermal power harvesting station.',
        status: 'active',
        tenantId: globexTenant._id,
        createdBy: globexOwner._id,
      },
      {
        name: 'Globex Sugar Packet Distribution Network',
        description: 'Centralized loose granulated sweetener fulfillment for pantries.',
        status: 'on_hold',
        tenantId: globexTenant._id,
        createdBy: globexMember._id,
      },
      {
        name: 'Globex Hammock District Retail Hub',
        description: 'Consolidated commercial vendor portal in the historic hammock quarter.',
        status: 'planning',
        tenantId: globexTenant._id,
        createdBy: globexOwner._id,
      },
      {
        name: 'Globex Matter Transporter Prototype',
        description: 'Experimental subatomic tele-relocation chamber calibration.',
        status: 'active',
        tenantId: globexTenant._id,
        createdBy: globexMember._id,
      },
      {
        name: 'Globex Project Arcturus Legacy Decommission',
        description: 'Archived records and safe containment of decommissioned hardware.',
        status: 'archived',
        tenantId: globexTenant._id,
        createdBy: globexOwner._id,
      },
    ];
    await Project.insertMany(globexProjects);

    console.log('----------------------------------------------------');
    console.log(' Seed completed successfully!');
    console.log(' Tenants created: Acme Corp, Globex Inc');
    console.log(' Users created: 5 (Acme: owner, admin, member; Globex: owner, member)');
    console.log(' Projects created: 16 (8 per tenant, distinctly isolated)');
    console.log(' Password for all demo accounts: Test@1234');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  let mongodInstance = null;
  try {
    try {
      await connectDB();
    } catch {
      console.warn(`[Seed] Standard connection failed. Starting temporary in-memory MongoDB...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      await connectDB(mongodInstance.getUri());
    }

    await seedData(true);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    process.exit(process.exitCode || 0);
  });
}

export default seedDatabase;
