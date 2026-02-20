import { Router } from 'express';
import multer from 'multer';
import db from '../database';
import { removeBackground } from '../services/geminiService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to authenticate with API key
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers.authorization?.split(' ')[1]; // Expects 'Bearer YOUR_API_KEY'
    if (!apiKey) {
        return res.status(401).json({ message: 'API key is required' });
    }

    try {
        const stmt = db.prepare('SELECT id FROM users WHERE apiKey = ?');
        const user = stmt.get(apiKey);
        if (!user) {
            return res.status(403).json({ message: 'Invalid API key' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

router.post('/remove-background', authenticateApiKey, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
    }

    try {
        // The geminiService expects a File-like object, so we adapt the multer buffer
        const file = {
            type: req.file.mimetype,
            name: req.file.originalname,
            ...req.file
        } as any;

        const processedImageBase64 = await removeBackground(file);
        const base64Data = processedImageBase64.split(',')[1];
        const imgBuffer = Buffer.from(base64Data, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length
        });
        res.end(imgBuffer);

    } catch (error) {
        console.error('API background removal error:', error);
        res.status(500).json({ message: 'Failed to process image' });
    }
});

export default router;
