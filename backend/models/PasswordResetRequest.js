import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passwordResetRequestSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    newPassword: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Hash the new password before saving so we don't store it in plain text
passwordResetRequestSchema.pre('save', async function () {
  if (!this.isModified('newPassword')) return;
  this.newPassword = await bcrypt.hash(this.newPassword, 12);
});

export default mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
