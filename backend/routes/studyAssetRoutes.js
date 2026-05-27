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

        const assets = await StudyAsset.find(filter);
        res.json(assets);
    } catch (error) {
        next(error);
    }
});

// Create/Save an asset
router.post('/', protect, async (req, res, next) => {
    try {
        const { documentId, type, title, content, tags } = req.body;
        const asset = await StudyAsset.create({
            user: req.user._id,
            document: documentId,
            type,
            title,
            content,
            tags
        });
        res.status(201).json(asset);
    } catch (error) {
        next(error);
    }
});

export default router;