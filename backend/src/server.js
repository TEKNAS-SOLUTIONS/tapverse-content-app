import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { checkDatabaseHealth, closePool } from './core/database.js';
import { closeRedis } from './core/cache.js';
import { closeAllQueues } from './queues/index.js';
import { logger } from './core/logger.js';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { requestTimeout } from './middleware/timeout.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import clientsRouter from './routes/clients.js';
import projectsRouter from './routes/projects.js';
import contentRouter from './routes/content.js';
import settingsRouter from './routes/settings.js';
import articleIdeasRouter from './routes/articleIdeas.js';
import videoRouter from './routes/video.js';
import imagesRouter from './routes/images.js';
import seoStrategyRouter from './routes/seoStrategy.js';
import googleAdsStrategyRouter from './routes/googleAdsStrategy.js';
import facebookAdsStrategyRouter from './routes/facebookAdsStrategy.js';
import schedulingRouter from './routes/scheduling.js';
import emailNewslettersRouter from './routes/emailNewsletters.js';
import analyticsRouter from './routes/analytics.js';
import contentRoadmapRouter from './routes/contentRoadmap.js';
import dashboardRouter from './routes/dashboard.js';
import keywordAnalysisRouter from './routes/keywordAnalysis.js';
import contentEvidenceRouter from './routes/contentEvidence.js';
import shopifyRouter from './routes/shopify.js';
import localSeoRouter from './routes/localSeo.js';
import connectionsRouter from './routes/connections.js';
import cmsRouter from './routes/cms.js';
import programmaticSeoRouter from './routes/programmaticSeo.js';
import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import contentStatusRouter from './routes/contentStatus.js';
import exportRouter from './routes/export.js';
import rankTrackingRouter from './routes/rankTracking.js';
import reportsRouter from './routes/reports.js';
import contentIdeasRouter from './routes/contentIdeas.js';
import chatRouter from './routes/chat.js';
import adminChatRouter from './routes/adminChat.js';
import avatarsRouter from './routes/avatars.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();

// Middleware Stack (in order)
// 1. CORS
app.use(cors({ 
  origin: config.frontend.url || 'http://localhost:5173',
  credentials: true
}));

// 2. Request timeout (30 seconds default)
app.use(requestTimeout(30000));

// 3. Request logging (adds request ID)
app.use(requestLogger);

// 4. Body parsing
app.use(express.json());

// 5. Rate limiting (general API limiter)
app.use('/api', apiLimiter);

// Health check
app.get('/health', asyncHandler(async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  
  const status = dbHealth.healthy ? 200 : 503;
  res.status(status).json({ 
    status: dbHealth.healthy ? 'ok' : 'error',
    database: dbHealth.healthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    ...(dbHealth.error && { error: dbHealth.error })
  });
}));

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
app.use('/api/google-ads-strategy', googleAdsStrategyRouter);
app.use('/api/facebook-ads-strategy', facebookAdsStrategyRouter);
app.use('/api/scheduling', schedulingRouter);
app.use('/api/email-newsletters', emailNewslettersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/roadmap', contentRoadmapRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/keyword-analysis', keywordAnalysisRouter);
app.use('/api/content-evidence', contentEvidenceRouter);
app.use('/api/shopify', shopifyRouter);
app.use('/api/local-seo', localSeoRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/cms', cmsRouter);
app.use('/api/programmatic-seo', programmaticSeoRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/content-status', contentStatusRouter);
app.use('/api/export', exportRouter);
app.use('/api/rank-tracking', rankTrackingRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/content-ideas', contentIdeasRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin-chat', adminChatRouter);
app.use('/api/avatars', avatarsRouter);
app.use('/api/webhooks', webhooksRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (after all routes)
app.use(notFoundHandler);

// Export app for testing
export { app };

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');
  
  // Close server
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Close database connections
      try {
        await closePool();
      } catch (error) {
        logger.error({ err: error }, 'Error closing database pool');
      }
      
      // Close Redis connections
      try {
        await closeRedis();
      } catch (error) {
        logger.error({ err: error }, 'Error closing Redis connection');
      }
      
      // Close job queues
      try {
        await closeAllQueues();
      } catch (error) {
        logger.error({ err: error }, 'Error closing job queues');
      }
      
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
};

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  
  server = app.listen(PORT, () => {
    logger.info({
      port: PORT,
      environment: config.nodeEnv,
    }, 'Server started');
  });
  
  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught exception');
    gracefulShutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled promise rejection');
    gracefulShutdown('unhandledRejection');
  });
}

