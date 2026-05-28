import express from 'express';
import Document from '../models/Document.js';
import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

async function queryGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
  });
  if (!response.ok) throw new Error(`Gemini failed: ${response.status}`);
  const data = await response.json();
  return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
}

const fallbackQuestions = (subjects = []) => [
  { id: 'q1', type: 'mcq', topic: subjects[0] || 'Core Concepts', marks: 2, question: 'Which concept appears most central in the selected material?', options: ['Definition', 'Application', 'Comparison', 'All of these'], correctAnswer: 'All of these' },
  { id: 'q2', type: 'short', topic: subjects[0] || 'Revision', marks: 5, question: 'Summarize one important topic from the selected PDFs.', expectedAnswer: 'Student should identify and explain a key extracted concept.' },
];

router.get('/', protect, async (req, res, next) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('sourceDocuments', 'title subject resourceType');
    res.json(exams);
  } catch (error) { next(error); }
});

router.post('/generate', protect, async (req, res, next) => {
  try {
    const { documentIds = [], subjects = [], difficulty = 'mixed', durationMinutes = 60, totalMarks = 100, negativeMarking = 0, config = {} } = req.body;
    const docs = await Document.find({ _id: { $in: documentIds }, user: req.user._id });
    const context = docs.map((doc) => `# ${doc.title}\n${(doc.extractedText || '').slice(0, 5000)}`).join('\n\n').slice(0, 18000);
    let questions = fallbackQuestions(subjects);
    let analysis = { repeatedConcepts: [], importantTopics: subjects, note: 'Fallback generated from selected metadata.' };
    if (context.trim()) {
      const prompt = `Create a text-PDF based exam as raw valid JSON only. Include keys questions and analysis. Question types: mcq, short, long, assertion_reason, numerical. Config: difficulty=${difficulty}, duration=${durationMinutes}, marks=${totalMarks}, negative=${negativeMarking}, distribution=${JSON.stringify(config)}. Each question needs id,type,topic,marks,question,options?,correctAnswer?,expectedAnswer?. Context:\n${context}`;
      try {
        const raw = await queryGemini(prompt);
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        questions = parsed.questions || questions;
        analysis = parsed.analysis || analysis;
      } catch (error) {
        console.error('Exam AI fallback used:', error.message);
      }
    }
    const exam = await Exam.create({ user: req.user._id, title: `AI Exam · ${new Date().toLocaleDateString()}`, sourceDocuments: docs.map((d) => d._id), subjects, difficulty, durationMinutes, totalMarks, negativeMarking, config, questions, analysis });
    res.status(201).json(exam);
  } catch (error) { next(error); }
});

router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const { answers = {}, timeSpentSeconds = 0 } = req.body;
    let earned = 0; let possible = 0; let correct = 0; let graded = 0;
    exam.questions.forEach((q) => {
      possible += Number(q.marks || 1);
      if (q.correctAnswer) {
        graded += 1;
        if (String(answers[q.id] || '').trim() === String(q.correctAnswer).trim()) {
          correct += 1; earned += Number(q.marks || 1);
        } else earned -= Number(exam.negativeMarking || 0);
      }
    });
    const score = Math.max(0, Math.round(earned));
    const accuracy = graded ? Math.round((correct / graded) * 100) : 0;
    const weakTopics = [...new Set(exam.questions.filter((q) => q.correctAnswer && String(answers[q.id] || '').trim() !== String(q.correctAnswer).trim()).map((q) => q.topic).filter(Boolean))];
    const strongTopics = [...new Set(exam.questions.filter((q) => q.correctAnswer && String(answers[q.id] || '').trim() === String(q.correctAnswer).trim()).map((q) => q.topic).filter(Boolean))];
    const attempt = await ExamAttempt.create({ user: req.user._id, exam: exam._id, answers, score, accuracy, timeSpentSeconds, weakTopics, strongTopics, feedback: 'Review weak topics and retry with focused revision.', revisionAreas: weakTopics });
    res.status(201).json(attempt);
  } catch (error) { next(error); }
});

router.get('/:id/attempts', protect, async (req, res, next) => {
  try {
    res.json(await ExamAttempt.find({ user: req.user._id, exam: req.params.id }).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await ExamAttempt.deleteMany({ user: req.user._id, exam: req.params.id });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

export default router;
