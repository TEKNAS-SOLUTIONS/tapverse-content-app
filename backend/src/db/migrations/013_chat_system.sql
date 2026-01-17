-- Migration: Chat System - General, Client, and Admin Chat
-- Supports conversation threads, context management, and knowledge extraction

-- Ensure users table exists (for foreign key references)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- General conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  chat_type VARCHAR(50) DEFAULT 'general' CHECK (chat_type IN ('general', 'client', 'admin')),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  model VARCHAR(50) DEFAULT 'claude-3-haiku-20240307',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  summary TEXT, -- For older messages (context optimization)
  token_count INTEGER,
  is_summarized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message summaries (for context optimization)
CREATE TABLE IF NOT EXISTS chat_message_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  start_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  end_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  message_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client knowledge base (extracted facts from conversations)
CREATE TABLE IF NOT EXISTS client_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fact_type VARCHAR(50), -- 'preference', 'decision', 'insight', 'requirement'
  fact_data JSONB NOT NULL,
  extracted_from_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  extracted_by VARCHAR(50) DEFAULT 'auto', -- 'auto' or 'manual'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin insights (automated recommendations)
CREATE TABLE IF NOT EXISTS admin_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_type VARCHAR(50), -- 'portfolio', 'client', 'upsell', 'risk'
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE, -- NULL for portfolio insights
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  insight_data JSONB,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client_id ON chat_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_type ON chat_conversations(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_message_summaries_conversation_id ON chat_message_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_client_knowledge_client_id ON client_knowledge_base(client_id);
CREATE INDEX IF NOT EXISTS idx_admin_insights_client_id ON admin_insights(client_id);
CREATE INDEX IF NOT EXISTS idx_admin_insights_type ON admin_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_admin_insights_acknowledged ON admin_insights(acknowledged_at);
