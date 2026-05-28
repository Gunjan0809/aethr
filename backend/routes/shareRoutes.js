import crypto from 'crypto';
import express from 'express';
import ShareLink from '../models/ShareLink.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const token = crypto.randomBytes(18).toString('hex');
    const share = await ShareLink.create({ ...req.body, user: req.user._id, token });
    res.status(201).json({ ...share.toObject(), publicUrl: `${process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`}/api/share/public/${token}` });
  } catch (error) { next(error); }
});

router.get('/', protect, async (req, res, next) => {
  try {
    res.json(await ShareLink.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get('/public/:token', async (req, res, next) => {
  try {
    const share = await ShareLink.findOne({ token: req.params.token });
    if (!share || (share.expiresAt && share.expiresAt < new Date())) return res.status(404).json({ message: 'Share link expired or missing' });
    res.json({ kind: share.kind, title: share.title, payload: share.payload, permissions: share.permissions });
  } catch (error) { next(error); }
});

export default router;
