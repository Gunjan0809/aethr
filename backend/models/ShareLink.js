import mongoose from 'mongoose';

const shareLinkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['pdf', 'link', 'note', 'text', 'resource', 'quiz', 'flashcard'], required: true },
    title: { type: String, default: 'Shared resource' },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    permissions: { type: String, enum: ['view', 'download'], default: 'view' },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    expiresAt: { type: Date },
    token: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('ShareLink', shareLinkSchema);
