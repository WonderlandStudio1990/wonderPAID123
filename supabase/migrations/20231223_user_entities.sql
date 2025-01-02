-- Create the user_entities table for managing relationships between users and entities
CREATE TABLE monite_user_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entity_id)
);

-- Enable RLS
ALTER TABLE monite_user_entities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own entity mappings"
  ON monite_user_entities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entity mappings"
  ON monite_user_entities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_entities_user_id ON monite_user_entities(user_id);
CREATE INDEX idx_user_entities_entity_id ON monite_user_entities(entity_id); 