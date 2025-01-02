-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entities_email ON monite_entities(email);
CREATE INDEX IF NOT EXISTS idx_entities_status ON monite_entities(status);

-- Add audit columns
ALTER TABLE monite_entities 
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add trigger for audit
CREATE OR REPLACE FUNCTION update_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = NOW();
    NEW.last_modified_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entities_audit
    BEFORE UPDATE ON monite_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_fields();

-- Add constraints
ALTER TABLE monite_entities
ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');