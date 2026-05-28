import mongoose from 'mongoose';

const studyAssetSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }, // Optional link to uploaded PDF
        type: { type: String, enum: ['flashcard', 'quiz', 'bookmark'], required: true },
        title: { type: String, required: true },

        // Flexible content block
        // - For bookmarks: stores url
        // - For flashcards/quizzes: stores question/answer array structured in JSON
        content: { type: mongoose.Schema.Types.Mixed, required: true },
        tags: [{ type: String }],
        subject: { type: String, default: '' },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' },
        favorite: { type: Boolean, default: false },
        progress: {
            attempts: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            lastReviewedAt: { type: Date },
            nextReviewAt: { type: Date },
        }
    },
    { timestamps: true }
);

export default mongoose.model('StudyAsset', studyAssetSchema);
