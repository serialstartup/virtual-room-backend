import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tryOnRoutes from './routes/try-on.js';
import wardrobeRoutes from './routes/wardrobe.js';
import modelsRoutes from './routes/models.js';
import customModelsRoutes from './routes/customModels.js';
import avatarsRoutes from './routes/avatars.js';
import { tokenRoutes } from './routes/tokens.js';
import feedbackRoutes from './routes/feedback.js';
import downloadRoutes from './routes/download.js';
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files from public directory
app.use('/public', express.static(join(__dirname, '../public')));
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Virtual Room Backend is running',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/try-on', tryOnRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/custom-models', customModelsRoutes);
app.use('/api/avatars', avatarsRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/download', downloadRoutes);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Virtual Room Backend running on port ${PORT}`);
    console.log(`📖 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🎯 Try-on API: http://localhost:${PORT}/api/try-on`);
    console.log(`👕 Wardrobe API: http://localhost:${PORT}/api/wardrobe`);
    console.log(`👤 Models API: http://localhost:${PORT}/api/models`);
    console.log(`🎨 Custom Models API: http://localhost:${PORT}/api/custom-models`);
    console.log(`👤 Avatars API: http://localhost:${PORT}/api/avatars`);
    console.log(`💰 Tokens API: http://localhost:${PORT}/api/tokens`);
    console.log(`👍 Feedback API: http://localhost:${PORT}/api/feedback`);
    console.log(`📥 Download API: http://localhost:${PORT}/api/download`);
    console.log(`📁 Static files: http://localhost:${PORT}/public`);
});
export default app;
//# sourceMappingURL=app.js.map