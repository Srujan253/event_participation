import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    checkInStart: {
      type: Boolean,
      default: false,
    },
    checkInEnd: {
      type: Boolean,
      default: false,
    },
    checkInStartTime: {
      type: Date,
      default: null,
    },
    checkInEndTime: {
      type: Date,
      default: null,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Attendance', attendanceSchema);
