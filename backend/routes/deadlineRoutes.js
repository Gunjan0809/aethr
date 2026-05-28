import express from 'express';
import Deadline from '../models/Deadline.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const now = new Date();
    const { status, range } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (range === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      filter.dueAt = { $gte: start, $lte: end };
    }
    if (range === 'overdue') filter.dueAt = { $lt: now };
    if (range === 'upcoming') filter.dueAt = { $gte: now };
    const deadlines = await Deadline.find(filter).sort({ dueAt: 1 }).limit(Number(req.query.limit) || 100);
    res.json(deadlines);
  } catch (error) { next(error); }
});

router.get('/summary', protect, async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const [upcoming, today, overdue] = await Promise.all([
      Deadline.find({ user: req.user._id, status: 'pending', dueAt: { $gte: now } }).sort({ dueAt: 1 }).limit(5),
      Deadline.find({ user: req.user._id, status: 'pending', dueAt: { $gte: start, $lte: end } }).sort({ dueAt: 1 }).limit(5),
      Deadline.find({ user: req.user._id, status: { $ne: 'completed' }, dueAt: { $lt: now } }).sort({ dueAt: 1 }).limit(5),
    ]);
    res.json({ upcoming, today, overdue });
  } catch (error) { next(error); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const deadline = await Deadline.create({ ...req.body, user: req.user._id });
    res.status(201).json(deadline);
  } catch (error) { next(error); }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const deadline = await Deadline.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    res.json(deadline);
  } catch (error) { next(error); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Deadline.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

export default router;
