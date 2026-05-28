import express from 'express';
import StudyAsset from '../models/StudyAsset.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch assets by type (flashcard, quiz, bookmark)
router.get('/', protect, async (req, res, next) => {
    try {
        const { type } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;

        const assets = await StudyAsset.find(filter).sort({ updatedAt: -1 }).limit(Number(req.query.limit) || 100);
        res.json(assets);
    } catch (error) {
        next(error);
    }
});

// Create/Save an asset
router.post('/', protect, async (req, res, next) => {
    try {
        const { documentId, type, title, content, tags, subject, difficulty } = req.body;
        const asset = await StudyAsset.create({
            user: req.user._id,
            document: documentId,
            type,
            title,
            content,
            tags,
            subject,
            difficulty
        });
        res.status(201).json(asset);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', protect, async (req, res, next) => {
    try {
        const asset = await StudyAsset.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', protect, async (req, res, next) => {
    try {
        const deleted = await StudyAsset.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deleted) return res.status(404).json({ message: 'Asset not found' });
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
});

export default router;
