import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: String,
      required: true,
    },
    startQrToken: {
      type: String,
      required: true,
      unique: true,
    },
    endQrToken: {
      type: String,
      required: true,
      unique: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
