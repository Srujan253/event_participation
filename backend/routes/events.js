import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import protect from '../middleware/auth.js';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// @route  POST /api/events
// @desc   Create a new event (auto-generates unique QR tokens)
// @access Protected
router.post('/', protect, async (req, res) => {
  try {
    const { eventName, eventDate } = req.body;

    if (!eventName || !eventDate) {
      return res.status(400).json({ message: 'Event name and date are required.' });
    }

    const event = new Event({
      eventName,
      eventDate,
      startQrToken: uuidv4(),
      endQrToken: uuidv4(),
      adminId: req.admin.id,
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully.', event });
  } catch (err) {
    console.error('[CREATE EVENT ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/events
// @desc   Get all events for the logged-in admin
// @access Protected
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({ adminId: req.admin.id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error('[GET EVENTS ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/events/:id
// @desc   Get a single event by ID
// @access Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, adminId: req.admin.id });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) {
    console.error('[GET EVENT ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/events/:id/stats
// @desc   Get attendance statistics for an event
// @access Protected
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, adminId: req.admin.id });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const attendanceRecords = await Attendance.find({ eventId: req.params.id });

    const stats = {
      event,
      totalParticipants: attendanceRecords.length,
      checkedIn: attendanceRecords.filter((r) => r.checkInStart).length,
      checkedOut: attendanceRecords.filter((r) => r.checkInEnd).length,
      complete: attendanceRecords.filter((r) => r.isComplete).length,
      records: attendanceRecords,
    };

    res.json(stats);
  } catch (err) {
    console.error('[GET STATS ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  DELETE /api/events/:id
// @desc   Delete an event
// @access Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, adminId: req.admin.id });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Also delete related attendance records
    await Attendance.deleteMany({ eventId: req.params.id });

    res.json({ message: 'Event and its attendance records deleted.' });
  } catch (err) {
    console.error('[DELETE EVENT ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

export default router;
