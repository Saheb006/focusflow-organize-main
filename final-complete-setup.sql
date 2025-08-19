-- FocusFlow Todo App - FINAL COMPLETE Database Setup
-- This script includes ALL features and will prevent any errors

-- Drop existing tables for clean setup
DROP TABLE IF EXISTS sub_todos CASCADE;
DROP TABLE IF EXISTS todos CASCADE;

-- Create todos table with ALL fields
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  color TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  due_time TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create sub_todos table with ALL fields including due_date and due_time
CREATE TABLE IF NOT EXISTS sub_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  due_time TEXT,
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

-- Create comprehensive indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_sub_todos_todo_id ON sub_todos(todo_id);
CREATE INDEX IF NOT EXISTS idx_sub_todos_due_date ON sub_todos(due_date);
CREATE INDEX IF NOT EXISTS idx_sub_todos_completed ON sub_todos(completed);

-- Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON todos TO anon, authenticated;
GRANT ALL ON sub_todos TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT '✅ FINAL COMPLETE Database setup completed successfully! All features included!' as status;






