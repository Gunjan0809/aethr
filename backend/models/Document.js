import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        s3Key: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number }, // in bytes
        subject: { type: String, default: '' },
        resourceType: { type: String, enum: ['notes', 'pyq', 'resource', 'other'], default: 'resource' },
        tags: [{ type: String }],
        extractedText: { type: String, default: '' }
    },
    { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
