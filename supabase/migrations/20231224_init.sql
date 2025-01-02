-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Entities table
CREATE TABLE monite_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monite_entity_id VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Tokens table with enhanced security
CREATE TABLE monite_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES monite_entities(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR NOT NULL DEFAULT 'bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_valid BOOLEAN DEFAULT true,
  CONSTRAINT valid_token_type CHECK (token_type IN ('bearer'))
);

-- Counterparts table for managing business relationships
CREATE TABLE monite_counterparts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES monite_entities(id) ON DELETE CASCADE,
  monite_counterpart_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_type CHECK (type IN ('individual', 'organization'))
);

-- Webhook events table for tracking
CREATE TABLE monite_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR NOT NULL,
  entity_id UUID REFERENCES monite_entities(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Cache table for advanced features
CREATE TABLE monite_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table for monitoring
CREATE TABLE monite_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR NOT NULL,
  message TEXT NOT NULL,
  meta JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table for monitoring
CREATE TABLE monite_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  labels JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entities_updated_at
    BEFORE UPDATE ON monite_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at
    BEFORE UPDATE ON monite_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counterparts_updated_at
    BEFORE UPDATE ON monite_counterparts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_monite_tokens_entity_id ON monite_tokens(entity_id);
CREATE INDEX idx_monite_tokens_expires_at ON monite_tokens(expires_at);
CREATE INDEX idx_monite_counterparts_entity_id ON monite_counterparts(entity_id);
CREATE INDEX idx_monite_counterparts_email ON monite_counterparts(email);
CREATE INDEX idx_monite_webhook_events_entity_id ON monite_webhook_events(entity_id);
CREATE INDEX idx_monite_webhook_events_processed ON monite_webhook_events(processed);
CREATE INDEX idx_monite_cache_expires_at ON monite_cache(expires_at);

-- Enable RLS
ALTER TABLE monite_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE monite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE monite_counterparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monite_webhook_events ENABLE ROW LEVEL SECURITY;

-- Define RLS policies
CREATE POLICY "Users can only access their own entities"
  ON monite_entities
  FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM monite_user_entities WHERE entity_id = id
  ));

CREATE POLICY "Users can only access their own tokens"
  ON monite_tokens
  FOR ALL
  USING (entity_id IN (
    SELECT entity_id FROM monite_user_entities WHERE user_id = auth.uid()
  ));
