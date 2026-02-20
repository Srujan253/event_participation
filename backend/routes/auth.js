import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route  POST /api/auth/register
// @desc   Register a new admin
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists.' });
    }

    const admin = new Admin({ username, email, password });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin registered successfully.',
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  POST /api/auth/login
// @desc   Login an admin
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

    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
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
