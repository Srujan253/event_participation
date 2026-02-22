import express from 'express';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Event from '../models/Event.js';
import { superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route  POST /api/superadmin/seed
// @desc   One-time setup: creates the Super Admin account (only works if NO super_admin exists)
// @access Public (intentionally — first-time setup only)
router.post('/seed', async (req, res) => {
  try {
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      return res.status(409).json({ message: 'Super Admin already exists. Seed blocked.' });
    }
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required.' });
    }
    const admin = new Admin({
      username,
      email,
      password,
      role: 'super_admin',
      status: 'approved',
      purpose: 'Platform super admin',
    });
    await admin.save();
    res.status(201).json({ message: '✅ Super Admin created successfully!', email: admin.email });
  } catch (err) {
    console.error('[SEED ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// All routes below protected by superAdminOnly

// @route  GET /api/superadmin/requests
// @desc   Get all pending admin registration requests
router.get('/requests', superAdminOnly, async (req, res) => {
  try {
    const pending = await Admin.find({ status: 'pending', role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    console.error('[SUPERADMIN REQUESTS ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  PUT /api/superadmin/requests/:id
// @desc   Approve or reject a pending admin
router.put('/requests/:id', superAdminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    res.json({ message: `Admin has been ${status}.`, admin });
  } catch (err) {
    console.error('[SUPERADMIN UPDATE REQUEST ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/superadmin/admins
// @desc   Get all approved admins with total events created (via $lookup aggregation)
router.get('/admins', superAdminOnly, async (req, res) => {
  try {
    const admins = await Admin.aggregate([
      { $match: { status: 'approved', role: 'admin' } },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: 'adminId',
          as: 'events',
        },
      },
      {
        $addFields: {
          totalEventsCreated: { $size: '$events' },
        },
      },
      {
        $project: {
          password: 0,
          events: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(admins);
  } catch (err) {
    console.error('[SUPERADMIN ADMINS ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/superadmin/stats
// @desc   Platform-level stats
router.get('/stats', superAdminOnly, async (req, res) => {
  try {
    const [totalAdmins, totalEvents, pendingRequests] = await Promise.all([
      Admin.countDocuments({ status: 'approved', role: 'admin' }),
      Event.countDocuments(),
      Admin.countDocuments({ status: 'pending' }),
    ]);

    res.json({ totalAdmins, totalEvents, pendingRequests });
  } catch (err) {
    console.error('[SUPERADMIN STATS ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  DELETE /api/superadmin/admins/:id
// @desc   Delete an admin and cascade-delete their events
router.delete('/admins/:id', superAdminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Cascade: delete all events created by this admin
    const deletedEvents = await Event.deleteMany({ adminId: req.params.id });

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Admin and their events have been permanently deleted.',
      eventsDeleted: deletedEvents.deletedCount,
    });
  } catch (err) {
    console.error('[SUPERADMIN DELETE ADMIN ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  POST /api/superadmin/create-superadmin
// @desc   Create a new super admin account (only super admins can do this)
router.post('/create-superadmin', superAdminOnly, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const admin = new Admin({
      username,
      email,
      password,
      role: 'super_admin',
      status: 'approved',
      purpose: 'Platform super admin',
      createdBy: req.admin.id, // track who created them
    });
    await admin.save();

    res.status(201).json({
      message: `Super Admin "${username}" created successfully.`,
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error('[CREATE SUPERADMIN ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/superadmin/superadmins
// @desc   List all super admin accounts
router.get('/superadmins', superAdminOnly, async (req, res) => {
  try {
    const superAdmins = await Admin.find({ role: 'super_admin' })
      .select('-password')
      .sort({ createdAt: 1 });
    res.json(superAdmins);
  } catch (err) {
    console.error('[LIST SUPERADMINS ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

export default router;
