import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        type: { type: String, enum: ['daily', 'exam', 'milestone'], default: 'daily' },
        dueDate: { type: Date },
        completed: { type: Boolean, default: false },
        xpReward: { type: Number, default: 10 },
        notes: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model('Task', taskSchema);