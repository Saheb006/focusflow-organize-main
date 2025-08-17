-- FocusFlow Todo App Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS sub_todos CASCADE;
DROP TABLE IF EXISTS todos CASCADE;

-- Create todos table with proper constraints
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  color TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  due_time TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Add constraints
  CONSTRAINT valid_due_date CHECK (due_date IS NULL OR due_date > created_at),
  CONSTRAINT valid_completed_at CHECK (completed_at IS NULL OR completed_at >= created_at)
);

-- Create sub_todos table with proper constraints
CREATE TABLE sub_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on both tables
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_todos ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for todos
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive policies for sub_todos
CREATE POLICY "Users can view sub_todos of their todos" ON sub_todos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM todos 
      WHERE todos.id = sub_todos.todo_id 
      AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sub_todos to their todos" ON sub_todos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM todos 
      WHERE todos.id = sub_todos.todo_id 
      AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sub_todos of their todos" ON sub_todos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM todos 
      WHERE todos.id = sub_todos.todo_id 
      AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sub_todos of their todos" ON sub_todos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM todos 
      WHERE todos.id = sub_todos.todo_id 
      AND todos.user_id = auth.uid()
    )
  );

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_sub_todos_todo_id ON sub_todos(todo_id);
CREATE INDEX IF NOT EXISTS idx_sub_todos_completed ON sub_todos(completed);

-- Create a function to automatically update completed_at when todo is completed
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = FALSE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update completed_at
CREATE TRIGGER trigger_update_completed_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at();

-- Create a function to validate todo data
CREATE OR REPLACE FUNCTION validate_todo()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure title is not empty
  IF NEW.title IS NULL OR length(trim(NEW.title)) = 0 THEN
    RAISE EXCEPTION 'Todo title cannot be empty';
  END IF;
  
  -- Ensure priority is valid
  IF NEW.priority NOT IN ('low', 'medium', 'high', 'urgent') THEN
    RAISE EXCEPTION 'Invalid priority level';
  END IF;
  
  -- Ensure due_date is in the future if set
  IF NEW.due_date IS NOT NULL AND NEW.due_date <= NOW() THEN
    RAISE EXCEPTION 'Due date must be in the future';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate todo data
CREATE TRIGGER trigger_validate_todo
  BEFORE INSERT OR UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION validate_todo();

-- Create a function to validate sub_todo data
CREATE OR REPLACE FUNCTION validate_sub_todo()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure title is not empty
  IF NEW.title IS NULL OR length(trim(NEW.title)) = 0 THEN
    RAISE EXCEPTION 'Sub-todo title cannot be empty';
  END IF;
  
  -- Ensure parent todo exists
  IF NOT EXISTS (SELECT 1 FROM todos WHERE id = NEW.todo_id) THEN
    RAISE EXCEPTION 'Parent todo does not exist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate sub_todo data
CREATE TRIGGER trigger_validate_sub_todo
  BEFORE INSERT OR UPDATE ON sub_todos
  FOR EACH ROW
  EXECUTE FUNCTION validate_sub_todo();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON todos TO anon, authenticated;
GRANT ALL ON sub_todos TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert some sample data for testing (optional)
-- Uncomment the lines below if you want sample data

/*
INSERT INTO todos (user_id, title, description, priority, color, tags) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Welcome to FocusFlow!', 'This is your first todo. Click the + button to add more!', 'medium', '#3B82F6', ARRAY['welcome', 'getting-started']),
  ('00000000-0000-0000-0000-000000000000', 'Complete project setup', 'Set up your development environment and install dependencies', 'high', '#EF4444', ARRAY['work', 'development']),
  ('00000000-0000-0000-0000-000000000000', 'Plan weekend activities', 'Research and plan fun activities for the weekend', 'low', '#10B981', ARRAY['personal', 'planning']);

INSERT INTO sub_todos (todo_id, title) VALUES
  ((SELECT id FROM todos WHERE title = 'Complete project setup' LIMIT 1), 'Install Node.js'),
  ((SELECT id FROM todos WHERE title = 'Complete project setup' LIMIT 1), 'Clone repository'),
  ((SELECT id FROM todos WHERE title = 'Complete project setup' LIMIT 1), 'Run npm install'),
  ((SELECT id FROM todos WHERE title = 'Plan weekend activities' LIMIT 1), 'Check weather forecast'),
  ((SELECT id FROM todos WHERE title = 'Plan weekend activities' LIMIT 1), 'Book restaurant reservations');
*/

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📊 Tables created: todos, sub_todos';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '📋 Policies configured for user isolation';
  RAISE NOTICE '⚡ Performance indexes created';
  RAISE NOTICE '🔧 Triggers and functions added for data validation';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your FocusFlow todo app database is ready!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set up your environment variables';
  RAISE NOTICE '2. Run your React application';
  RAISE NOTICE '3. Create your first user account';
END $$;
