import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'tapverse_content',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  
  api: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    claudeModel: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307', // Default to Haiku (Sonnet available with upgraded API key)
  },
  
  dataForSeo: {
    login: process.env.DATAFORSEO_LOGIN || 'sanket@teknas.com.au',
    password: process.env.DATAFORSEO_PASSWORD || '97e322c50317d801',
    enabled: process.env.DATAFORSEO_ENABLED !== 'false', // Enabled by default
    defaultLocation: process.env.DATAFORSEO_LOCATION || '2840', // US
    defaultLanguage: process.env.DATAFORSEO_LANGUAGE || 'en', // English
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connections/google/callback`,
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

