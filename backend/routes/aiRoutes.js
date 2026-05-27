import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Document from '../models/Document.js';

const router = express.Router();

class AIRequestError extends Error {
    constructor(message, statusCode = 502) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Helper function to query Gemini API with descriptive error logging
async function queryGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
        throw new AIRequestError('GEMINI_API_KEY is missing in your backend .env file', 500);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('--- GEMINI API REJECTION ---');
        console.error(`Status Code: ${response.status}`);
        console.error(`Error Payload: ${errorBody}`);
        console.error('----------------------------');

        if (response.status === 400 || response.status === 401 || response.status === 403) {
            throw new AIRequestError(
                'Gemini authentication failed. Check that GEMINI_API_KEY in backend/.env is valid and restart the backend.',
                502
            );
        }

        throw new AIRequestError(`Gemini API request failed with status ${response.status}.`, 502);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((part) => part.text || '').join('').trim();

    if (!text) {
        throw new AIRequestError('Gemini returned an empty response.', 502);
    }

    return text;
}

function sendAIError(res, error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        message: error.message || 'AI service failed.',
    });
}

// 1. General study chat / question answering
router.post('/chat', protect, async (req, res) => {
    try {
        const { question, context } = req.body;
        if (!question?.trim()) {
            return res.status(400).json({ message: 'Question is required.' });
        }

        const prompt = context
            ? `Context material:\n${context}\n\nQuestion: ${question}\nProvide a simplified, student-friendly explanation.`
            : question;

        const responseText = await queryGemini(prompt);
        res.json({ response: responseText });
    } catch (error) {
        sendAIError(res, error);
    }
});
router.post('/doc-chat', protect, async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        const doc = await Document.findOne({ _id: documentId, user: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Retrieve relevant text context (using simple substring retrieval or a segment of text)
        const documentContext = doc.extractedText ? doc.extractedText.slice(0, 4000) : ''; // Limit to 4k characters to respect API token boundaries

        const prompt = `
You are an expert AI Study Assistant. Answer the question below strictly using the context extracted from the user's study document.

Document Title: ${doc.title}
Document Context:
---
${documentContext}
---

Question: ${question}
Answer in a detailed, clear, and step-by-step format.
`;

        const answer = await queryGemini(prompt);
        res.json({ response: answer });
    } catch (error) {
        next(error);
    }
});

// 2. Generate structured study materials (Quizzes or Flashcards)
router.post('/generate', protect, async (req, res) => {
    try {
        const { text, type } = req.body;
        if (!text?.trim()) {
            return res.status(400).json({ message: 'Text is required.' });
        }

        let prompt = '';
        if (type === 'flashcard') {
            prompt = `Based on this text, generate 5 flashcards as raw valid JSON array of objects. Do not include markdown formatting. Format: [{"question": "...", "answer": "..."}]. Text:\n${text}`;
        } else {
            prompt = `Based on this text, generate a 5-question multiple choice quiz as raw valid JSON array of objects. Do not include markdown formatting. Format: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "..."}]. Text:\n${text}`;
        }

        const rawResponse = await queryGemini(prompt);
        const cleanedJson = rawResponse.replace(/```json|```/g, '').trim();
        const structuredData = JSON.parse(cleanedJson);

        res.json({ data: structuredData });
    } catch (error) {
        sendAIError(res, error);
    }
});

export default router;
