import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    score: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    weakTopics: [{ type: String }],
    strongTopics: [{ type: String }],
    feedback: { type: String, default: '' },
    revisionAreas: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('ExamAttempt', examAttemptSchema);
