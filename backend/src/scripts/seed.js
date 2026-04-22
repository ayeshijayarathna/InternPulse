require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const connectDB = require('../../src/config/db'); 
const User      = require('../../src/models/User');

const SUPER_ADMIN = {
  name:     process.env.SUPER_ADMIN_NAME     || 'Super Admin',
  email:    process.env.SUPER_ADMIN_EMAIL    || 'superadmin@internpulse.com',
  password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234!',
};

async function seed() {
  try {
    await connectDB();
    console.log('✅ DB connected');

    // Already exists ද check
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
      console.log('⚠️  Super admin already exists:', existing.email);
      process.exit(0);
    }

    // Create — passwordHash field, pre-save hook handles bcrypt
    const superAdmin = await User.create({
      name:         SUPER_ADMIN.name,
      email:        SUPER_ADMIN.email,
      passwordHash: SUPER_ADMIN.password,
      role:         'super_admin',
      isActive:     true,
    });

    console.log('🎉 Super admin created successfully!');
    console.log('   Email   :', superAdmin.email);
    console.log('   Password:', SUPER_ADMIN.password);
    console.log('   Role    :', superAdmin.role);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();