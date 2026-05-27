import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to recalculate user level based on XP (e.g., 100 XP per level)
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

// Get all tasks (Exams, Dailies, etc.)
router.get('/', protect, async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user._id });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

// Create a task
router.post('/', protect, async (req, res, next) => {
    try {
        const { title, type, dueDate, xpReward, notes } = req.body;
        const task = await Task.create({
            user: req.user._id,
            title,
            type,
            dueDate,
            xpReward,
            notes
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

// Complete Task and Reward XP
router.patch('/:id/complete', protect, async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.completed) return res.status(400).json({ message: 'Task already completed' });

        task.completed = true;
        await task.save();

        // Update User XP & Level
        const user = await User.findById(req.user._id);
        user.xp += task.xpReward;
        user.level = calculateLevel(user.xp);
        await user.save();

        res.json({ task, xp: user.xp, level: user.level });
    } catch (error) {
        next(error);
    }
});

export default router;