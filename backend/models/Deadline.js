import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueAt: { type: Date, required: true, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    tags: [{ type: String, trim: true }],
    reminderType: { type: String, enum: ['assignment', 'exam', 'study-goal', 'revision', 'custom'], default: 'custom' },
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    },
    alerts: {
      browser: { type: Boolean, default: true },
      sound: { type: Boolean, default: false },
      minutesBefore: { type: Number, default: 30 },
    },
    status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending', index: true },
  },
  { timestamps: true }
);

deadlineSchema.index({ user: 1, dueAt: 1, status: 1 });

export default mongoose.model('Deadline', deadlineSchema);
