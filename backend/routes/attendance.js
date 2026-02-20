import express from 'express';
import protect from '../middleware/auth.js';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// @route  POST /api/attendance/checkin
// @desc   Participant scans QR and submits their name for check-in or check-out
// @access Public (no auth needed — participants use QR link)
router.post('/checkin', async (req, res) => {
  try {
    const { token, participantName } = req.body;

    if (!token || !participantName) {
      return res.status(400).json({ message: 'Token and participant name are required.' });
    }

    const trimmedName = participantName.trim();

    // Determine if this is a START token or END token
    const eventByStart = await Event.findOne({ startQrToken: token });
    const eventByEnd = await Event.findOne({ endQrToken: token });

    if (!eventByStart && !eventByEnd) {
      return res.status(404).json({ message: 'Invalid QR token. Event not found.' });
    }

    const event = eventByStart || eventByEnd;
    const isStartToken = !!eventByStart;

    // Find existing attendance record for this participant in this event
    let record = await Attendance.findOne({
      eventId: event._id,
      participantName: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (isStartToken) {
      // CHECK-IN logic
      if (record && record.checkInStart) {
        return res.status(409).json({ message: 'You have already checked in for this event.' });
      }

      if (!record) {
        record = new Attendance({
          eventId: event._id,
          participantName: trimmedName,
        });
      }

      record.checkInStart = true;
      record.checkInStartTime = new Date();
      await record.save();

      return res.status(200).json({
        message: `✅ Check-in successful! Welcome, ${trimmedName}!`,
        action: 'CHECKED_IN',
        eventName: event.eventName,
        record,
      });
    } else {
      // CHECK-OUT logic
      if (!record || !record.checkInStart) {
        return res.status(400).json({
          message: 'You must check in before checking out.',
        });
      }

      if (record.checkInEnd) {
        return res.status(409).json({ message: 'You have already checked out.' });
      }

      record.checkInEnd = true;
      record.checkInEndTime = new Date();
      record.isComplete = true;
      await record.save();

      return res.status(200).json({
        message: `👋 Check-out successful! Goodbye, ${trimmedName}!`,
        action: 'CHECKED_OUT',
        eventName: event.eventName,
        record,
      });
    }
  } catch (err) {
    console.error('[CHECKIN ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/attendance/verify/:token
// @desc   Verify a QR token and return event info (used by scan page before form submit)
// @access Public
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const eventByStart = await Event.findOne({ startQrToken: token });
    const eventByEnd = await Event.findOne({ endQrToken: token });

    if (!eventByStart && !eventByEnd) {
      return res.status(404).json({ message: 'Invalid QR token.' });
    }

    const event = eventByStart || eventByEnd;
    const tokenType = eventByStart ? 'CHECK_IN' : 'CHECK_OUT';

    res.json({
      valid: true,
      tokenType,
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventId: event._id,
    });
  } catch (err) {
    console.error('[VERIFY TOKEN ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @route  GET /api/attendance/event/:eventId
// @desc   Get all attendance records for an event (protected - admin only)
// @access Protected
router.get('/event/:eventId', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[GET ATTENDANCE ERROR]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

export default router;
