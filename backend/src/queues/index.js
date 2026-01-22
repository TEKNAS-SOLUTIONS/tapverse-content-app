import Bull from 'bull';
import { config } from '../config/config.js';
import { logger } from '../core/logger.js';

/**
 * Bull job queue configuration
 * Handles background job processing for long-running operations
 */

const redisConfig = {
  host: config.redis.host || process.env.REDIS_HOST || 'localhost',
  port: config.redis.port || process.env.REDIS_PORT || 6379,
};

/**
 * Create a queue with default configuration
 */
export const createQueue = (queueName, options = {}) => {
  const queue = new Bull(queueName, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep max 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
      ...options.defaultJobOptions,
    },
    ...options,
  });

  // Queue event handlers
  queue.on('error', (error) => {
    logger.error({ err: error, queueName }, 'Queue error');
  });

  queue.on('waiting', (jobId) => {
    logger.debug({ jobId, queueName }, 'Job waiting');
  });

  queue.on('active', (job) => {
    logger.info({ jobId: job.id, queueName }, 'Job started');
  });

  queue.on('completed', (job, result) => {
    logger.info({ jobId: job.id, queueName }, 'Job completed');
  });

  queue.on('failed', (job, error) => {
    logger.error({ err: error, jobId: job.id, queueName }, 'Job failed');
  });

  queue.on('stalled', (jobId) => {
    logger.warn({ jobId, queueName }, 'Job stalled');
  });

  return queue;
};

/**
 * Content generation queue
 * For SEO blog content and programmatic SEO content generation
 */
export const contentGenerationQueue = createQueue('content-generation', {
  defaultJobOptions: {
    timeout: 300000, // 5 minutes timeout
    attempts: 2,
  },
});

/**
 * Video generation queue
 * For AI video creation
 */
export const videoGenerationQueue = createQueue('video-generation', {
  defaultJobOptions: {
    timeout: 600000, // 10 minutes timeout
    attempts: 2,
  },
});

/**
 * Image generation queue
 * For image generation operations
 */
export const imageGenerationQueue = createQueue('image-generation', {
  defaultJobOptions: {
    timeout: 120000, // 2 minutes timeout
    attempts: 3,
  },
});

/**
 * Batch processing queue
 * For batch content generation (e.g., 10 pieces at once)
 */
export const batchProcessingQueue = createQueue('batch-processing', {
  defaultJobOptions: {
    timeout: 600000, // 10 minutes timeout
    attempts: 1, // Don't retry batch jobs
  },
});

/**
 * Close all queues gracefully
 */
export const closeAllQueues = async () => {
  const queues = [
    contentGenerationQueue,
    videoGenerationQueue,
    imageGenerationQueue,
    batchProcessingQueue,
  ];

  await Promise.all(
    queues.map(async (queue) => {
      try {
        await queue.close();
        logger.info({ queueName: queue.name }, 'Queue closed');
      } catch (error) {
        logger.error({ err: error, queueName: queue.name }, 'Error closing queue');
      }
    })
  );
};
