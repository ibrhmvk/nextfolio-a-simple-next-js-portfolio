-- Create the collaborative_documents table
CREATE TABLE IF NOT EXISTS collaborative_documents (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_collaborative_documents_session_id ON collaborative_documents(session_id);

-- Enable row level security
ALTER TABLE collaborative_documents ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to select
CREATE POLICY "Anyone can select collaborative_documents" 
  ON collaborative_documents
  FOR SELECT 
  USING (true);

-- Create a policy that allows anyone to insert
CREATE POLICY "Anyone can insert collaborative_documents" 
  ON collaborative_documents
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy that allows anyone to update
CREATE POLICY "Anyone can update collaborative_documents" 
  ON collaborative_documents
  FOR UPDATE 
  USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_collaborative_documents_updated_at
BEFORE UPDATE ON collaborative_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 