import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route  POST /api/auth/register
// @desc   Register a new admin (status: pending, no token issued)
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, purpose } = req.body;

    if (!username || !email || !password || !purpose) {
      return res.status(400).json({ message: 'All fields are required, including purpose.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const admin = new Admin({ username, email, password, purpose, status: 'pending', role: 'admin' });
    await admin.save();

    // No token issued — account must be approved first
    res.status(202).json({
      message: 'Registration submitted. Your account is pending approval by the Super Admin.',
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  POST /api/auth/login
// @desc   Login an admin (blocks pending/rejected)
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Block pending or rejected accounts
    if (admin.status === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending approval. Please wait for the Super Admin to approve your request.',
        status: 'pending',
      });
    }
    if (admin.status === 'rejected') {
      return res.status(403).json({
        message: 'Your account has been rejected. Please contact the Super Admin.',
        status: 'rejected',
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get current admin profile
// @access Protected
router.get('/me', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error('[ME ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

export default router;
