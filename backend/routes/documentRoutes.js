import express from 'express';
import { createRequire } from 'module';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '../config/s3.js';
import Document from '../models/Document.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Ensure this path is exactly '/upload-url'
router.post('/upload-url', protect, async (req, res, next) => {
    try {
        const { fileName, fileType } = req.body;
        const s3Key = `uploads/${req.user._id}/${Date.now()}_${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        res.json({ uploadUrl, s3Key });
    } catch (error) {
        next(error);
    }
});

// Ensure this path is exactly '/'
router.post('/', protect, async (req, res, next) => {
    try {
        const { title, s3Key, fileType, fileSize, tags, subject, resourceType } = req.body;

        let extractedText = '';

        // If document is a PDF, pull buffer from S3 and extract text
        if (fileType === 'application/pdf') {
            try {
                const s3Response = await s3.send(
                    new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: s3Key,
                    })
                );
                const streamToBuffer = async (stream) => {
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    return Buffer.concat(chunks);
                };
                const buffer = await streamToBuffer(s3Response.Body);
                const parsedPdf = await pdf(buffer);
                extractedText = parsedPdf.text;
            } catch (err) {
                console.error('PDF parsing failed, saving metadata without text.', err);
            }
        }

        const document = await Document.create({
            user: req.user._id,
            title,
            s3Key,
            fileType,
            fileSize,
            subject,
            resourceType,
            tags,
            extractedText,
        });

        res.status(201).json(document);
    } catch (error) {
        next(error);
    }
});
// Ensure this path is exactly '/'
router.get('/', protect, async (req, res, next) => {
    try {
        const documents = await Document.find({ user: req.user._id }).lean();

        const documentsWithUrls = await Promise.all(
            documents.map(async (doc) => {
                const command = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: doc.s3Key,
                    ResponseContentType: doc.fileType || 'application/pdf',
                    ResponseContentDisposition: `inline; filename="${encodeURIComponent(doc.title)}"`,
                });
                const viewUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
                return { ...doc, viewUrl };
            })
        );

        res.json(documentsWithUrls);
    } catch (error) {
        next(error);
    }
});

router.get('/:id/url', protect, async (req, res, next) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
        if (!doc) return res.status(404).json({ message: 'PDF missing or access denied' });
        const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: doc.s3Key,
            ResponseContentType: doc.fileType || 'application/pdf',
            ResponseContentDisposition: `${disposition}; filename="${encodeURIComponent(doc.title)}"`,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 900 });
        res.json({ url, title: doc.title, fileType: doc.fileType, fileSize: doc.fileSize, subject: doc.subject, resourceType: doc.resourceType, uploadedAt: doc.createdAt });
    } catch (error) {
        next(error);
    }
});

export default router;
