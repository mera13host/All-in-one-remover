import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());

  // API Routes
  const authRoutes = require('./src/routes/auth').default;
  const userRoutes = require('./src/routes/user').default;
  const apiRoutes = require('./src/routes/api').default;
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/v1', apiRoutes);

  app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.sendStatus(200);
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

createServer();
