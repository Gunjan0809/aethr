import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import studyAssetRoutes from './routes/studyAssetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import examRoutes from './routes/examRoutes.js';
import shareRoutes from './routes/shareRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Secure app by setting various HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Aether API is active' });
});




app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assets', studyAssetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/share', shareRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
