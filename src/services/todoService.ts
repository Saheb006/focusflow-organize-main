import { supabase, isSupabaseConfigured, handleSupabaseError } from '@/lib/supabase'
import { Todo, SubTodo } from '@/types/todo'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// Utility function for retrying operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0 && (error as any)?.code === 'PGRST116') {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return retryOperation(operation, retries - 1)
    }
    throw error
  }
}

// Check if database tables exist
const ensureTablesExist = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not properly configured. Please check your environment variables.')
  }

  try {
    // Try to query the todos table to see if it exists
    const { error } = await supabase
      .from('todos')
      .select('id')
      .limit(1)
    
    if (error?.code === 'PGRST116') {
      throw new Error('Database tables not found. Please run the setup SQL in your Supabase dashboard.')
    }
  } catch (error) {
    throw handleSupabaseError(error, 'table check')
  }
}

export const todoService = {
  // Get all todos for a user with comprehensive error handling
  async getTodos(userId: string): Promise<Todo[]> {
    try {
      await ensureTablesExist()

      const { data: todosData, error: todosError } = await retryOperation(() =>
        supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      )

      if (todosError) {
        throw handleSupabaseError(todosError, 'fetch todos')
      }

      if (!todosData || todosData.length === 0) {
        return []
      }

      const { data: subTodosData, error: subTodosError } = await retryOperation(() =>
        supabase
          .from('sub_todos')
          .select('*')
          .in('todo_id', todosData.map(todo => todo.id))
      )

      if (subTodosError) {
        throw handleSupabaseError(subTodosError, 'fetch sub-todos')
      }

      // Map database data to Todo interface with proper error handling
      return todosData.map(todo => ({
        id: todo.id,
        title: todo.title || 'Untitled Todo',
        description: todo.description,
        completed: todo.completed || false,
        priority: todo.priority || 'medium',
        color: todo.color,
        dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
        dueTime: todo.due_time,
        tags: todo.tags || [],
        createdAt: new Date(todo.created_at),
        completedAt: todo.completed_at ? new Date(todo.completed_at) : undefined,
        subTodos: (subTodosData || [])
          .filter(sub => sub.todo_id === todo.id)
          .map(sub => ({
            id: sub.id,
            title: sub.title || 'Untitled Sub-todo',
            completed: sub.completed || false,
            dueDate: sub.due_date ? new Date(sub.due_date) : undefined,
            dueTime: sub.due_time,
            createdAt: new Date(sub.created_at)
          }))
      }))
    } catch (error) {
      console.error('Error fetching todos:', error)
      throw error
    }
  },

  // Create a new todo with validation
  async createTodo(userId: string, todo: Omit<Todo, 'id' | 'createdAt' | 'subTodos'>): Promise<Todo> {
    try {
      await ensureTablesExist()

      // Validate required fields
      if (!todo.title || todo.title.trim() === '') {
        throw new Error('Todo title is required')
      }

      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await retryOperation(() =>
        supabase
          .from('todos')
          .insert({
            user_id: userId,
            title: todo.title.trim(),
            description: todo.description?.trim() || null,
            completed: todo.completed || false,
            priority: todo.priority || 'medium',
            color: todo.color || null,
            due_date: todo.dueDate?.toISOString() || null,
            due_time: todo.dueTime || null,
            tags: todo.tags || [],
            created_at: new Date().toISOString()
          })
          .select()
          .single()
      )

      if (error) {
        throw handleSupabaseError(error, 'create todo')
      }

      if (!data) {
        throw new Error('Failed to create todo')
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        completed: data.completed,
        priority: data.priority,
        color: data.color,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        dueTime: data.due_time,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        subTodos: []
      }
    } catch (error) {
      console.error('Error creating todo:', error)
      throw error
    }
  },

  // Update a todo with validation
  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
    try {
      await ensureTablesExist()

      if (!todoId) {
        throw new Error('Todo ID is required')
      }

      const updateData: any = {}
      
      if (updates.title !== undefined) {
        updateData.title = updates.title.trim() || 'Untitled Todo'
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim() || null
      }
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed
      }
      if (updates.priority !== undefined) {
        updateData.priority = updates.priority
      }
      if (updates.color !== undefined) {
        updateData.color = updates.color
      }
      if (updates.dueDate !== undefined) {
        updateData.due_date = updates.dueDate?.toISOString() || null
      }
      if (updates.dueTime !== undefined) {
        updateData.due_time = updates.dueTime
      }
      if (updates.tags !== undefined) {
        updateData.tags = updates.tags || []
      }
      if (updates.completedAt !== undefined) {
        updateData.completed_at = updates.completedAt?.toISOString() || null
      }

      const { error } = await retryOperation(() =>
        supabase
          .from('todos')
          .update(updateData)
          .eq('id', todoId)
      )

      if (error) {
        throw handleSupabaseError(error, 'update todo')
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  },

  // Delete a todo with cascade handling
  async deleteTodo(todoId: string): Promise<void> {
    try {
      await ensureTablesExist()

      if (!todoId) {
        throw new Error('Todo ID is required')
      }

      // Delete sub-todos first (cascade should handle this, but we'll be explicit)
      const { error: subTodosError } = await retryOperation(() =>
        supabase
          .from('sub_todos')
          .delete()
          .eq('todo_id', todoId)
      )

      if (subTodosError) {
        console.warn('Error deleting sub-todos:', subTodosError)
        // Continue with todo deletion even if sub-todos fail
      }

      // Delete the todo
      const { error } = await retryOperation(() =>
        supabase
          .from('todos')
          .delete()
          .eq('id', todoId)
      )

      if (error) {
        throw handleSupabaseError(error, 'delete todo')
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  },

  // Create a sub-todo with validation
  async createSubTodo(todoId: string, subTodo: Omit<SubTodo, 'id' | 'createdAt'>): Promise<SubTodo> {
    try {
      await ensureTablesExist()

      if (!todoId) {
        throw new Error('Todo ID is required')
      }

      if (!subTodo.title || subTodo.title.trim() === '') {
        throw new Error('Sub-todo title is required')
      }

      const { data, error } = await retryOperation(() =>
        supabase
          .from('sub_todos')
          .insert({
            todo_id: todoId,
            title: subTodo.title.trim(),
            completed: subTodo.completed || false,
            due_date: subTodo.dueDate?.toISOString() || null,
            due_time: subTodo.dueTime || null,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
      )

      if (error) {
        throw handleSupabaseError(error, 'create sub-todo')
      }

      if (!data) {
        throw new Error('Failed to create sub-todo')
      }

      return {
        id: data.id,
        title: data.title,
        completed: data.completed,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        dueTime: data.due_time,
        createdAt: new Date(data.created_at)
      }
    } catch (error) {
      console.error('Error creating sub-todo:', error)
      throw error
    }
  },

  // Update a sub-todo with validation
  async updateSubTodo(subTodoId: string, updates: Partial<SubTodo>): Promise<void> {
    try {
      await ensureTablesExist()

      if (!subTodoId) {
        throw new Error('Sub-todo ID is required')
      }

      const updateData: any = {}
      
      if (updates.title !== undefined) {
        updateData.title = updates.title.trim() || 'Untitled Sub-todo'
      }
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed
      }
      if (updates.dueDate !== undefined) {
        updateData.due_date = updates.dueDate?.toISOString() || null
      }
      if (updates.dueTime !== undefined) {
        updateData.due_time = updates.dueTime
      }

      const { error } = await retryOperation(() =>
        supabase
          .from('sub_todos')
          .update(updateData)
          .eq('id', subTodoId)
      )

      if (error) {
        throw handleSupabaseError(error, 'update sub-todo')
      }
    } catch (error) {
      console.error('Error updating sub-todo:', error)
      throw error
    }
  },

  // Delete a sub-todo
  async deleteSubTodo(subTodoId: string): Promise<void> {
    try {
      await ensureTablesExist()

      if (!subTodoId) {
        throw new Error('Sub-todo ID is required')
      }

      const { error } = await retryOperation(() =>
        supabase
          .from('sub_todos')
          .delete()
          .eq('id', subTodoId)
      )

      if (error) {
        throw handleSupabaseError(error, 'delete sub-todo')
      }
    } catch (error) {
      console.error('Error deleting sub-todo:', error)
      throw error
    }
  },

  // Health check function
  async healthCheck(): Promise<boolean> {
    try {
      await ensureTablesExist()
      return true
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}
