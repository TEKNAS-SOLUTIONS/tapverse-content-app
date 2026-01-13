import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config.js';
import pool from './db/index.js';
import clientsRouter from './routes/clients.js';
import projectsRouter from './routes/projects.js';
import contentRouter from './routes/content.js';
import settingsRouter from './routes/settings.js';
import articleIdeasRouter from './routes/articleIdeas.js';
import videoRouter from './routes/video.js';
import imagesRouter from './routes/images.js';
import seoStrategyRouter from './routes/seoStrategy.js';

const app = express();

// Middleware
app.use(cors({ 
  origin: config.frontend.url || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Tapverse Content Automation API' });
});

// Use route handlers
app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/content', contentRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/article-ideas', articleIdeasRouter);
app.use('/api/video', videoRouter);
app.use('/api/images', imagesRouter);
app.use('/api/seo-strategy', seoStrategyRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export app for testing
export { app };

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

