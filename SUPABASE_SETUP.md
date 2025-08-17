# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for your FocusFlow todo application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in the root of your project with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Database Schema

**Option A: Use the Complete Setup Script (Recommended)**

1. Copy the entire contents of `setup-database.sql` file
2. Paste it into your Supabase SQL Editor
3. Click **"Run"**
4. Wait for the success message with checkmarks

**Option B: Manual Setup**

If you prefer to run SQL manually, use this simplified version:

```sql
-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  color TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  due_time TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create sub_todos table
CREATE TABLE IF NOT EXISTS sub_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_todos ENABLE ROW LEVEL SECURITY;

-- Create policies for todos
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for sub_todos
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_todos_todo_id ON sub_todos(todo_id);
```

## 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Add any additional redirect URLs if needed
4. Optionally configure email templates

## 5. Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to your app
3. Try to sign up with a new account
4. Check your email for the confirmation link
5. Sign in and test creating todos

## 6. Production Deployment

When deploying to production:

1. Update your environment variables with production Supabase credentials
2. Update your Supabase project settings with your production domain
3. Configure any additional security settings as needed

## Troubleshooting

- **Authentication errors**: Make sure your environment variables are correct
- **Database errors**: Verify the SQL schema was executed successfully
- **CORS errors**: Check your Supabase project settings for allowed origins
- **Email confirmation**: Check your spam folder or verify email settings in Supabase

## Features Included

- ✅ User authentication (sign up, sign in, sign out)
- ✅ Row Level Security (users can only access their own data)
- ✅ Real-time data synchronization
- ✅ Optimistic updates with React Query
- ✅ Error handling and loading states
- ✅ Type-safe database operations
