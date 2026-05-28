import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    sourceDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    subjects: [{ type: String }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
    durationMinutes: { type: Number, default: 60 },
    totalMarks: { type: Number, default: 100 },
    negativeMarking: { type: Number, default: 0 },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
