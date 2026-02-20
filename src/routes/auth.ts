import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database';
import { randomBytes } from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// User Registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const apiKey = randomBytes(20).toString('hex');
        
        const stmt = db.prepare('INSERT INTO users (email, password, apiKey) VALUES (?, ?, ?)');
        const info = stmt.run(email, hashedPassword, apiKey);

        res.status(201).json({ message: 'User created successfully', userId: info.lastInsertRowid });

    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Email already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email) as any;

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
        res.json({ message: 'Logged in successfully' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
