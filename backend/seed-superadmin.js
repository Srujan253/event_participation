import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Edit these before running:
const SUPER_ADMIN_USERNAME = 'superadmin';
const SUPER_ADMIN_EMAIL = 'superadmin@attendqr.com';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin@123'; // Change this!
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Dynamically import the model (ESM)
    const { default: Admin } = await import('./models/Admin.js');

    const existing = await Admin.findOne({ email: SUPER_ADMIN_EMAIL });

    if (existing) {
      // Update role and status if it already exists
      existing.role = 'super_admin';
      existing.status = 'approved';
      existing.purpose = 'Platform super admin';
      await existing.save();
      console.log(`✅ Updated existing account "${SUPER_ADMIN_EMAIL}" to super_admin.`);
    } else {
      // Hash the password manually (pre-save hook will re-hash, so we pass plain text)
      const admin = new Admin({
        username: SUPER_ADMIN_USERNAME,
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        role: 'super_admin',
        status: 'approved',
        purpose: 'Platform super admin',
      });
      await admin.save();
      console.log(`✅ Super Admin created!`);
      console.log(`   Email   : ${SUPER_ADMIN_EMAIL}`);
      console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    }
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
