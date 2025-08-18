import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoService } from '@/services/todoService'
import { Todo, SubTodo } from '@/types/todo'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const useTodos = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: todos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['todos', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      return todoService.getTodos(user.id)
    },
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      if ((error as any)?.message?.includes('not authenticated')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  const createTodoMutation = useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      const { subTodos: initialSubTodos = [], ...todoWithoutSubs } = (todo as any)
      const created = await todoService.createTodo(user.id, todoWithoutSubs)
      if (Array.isArray(initialSubTodos) && initialSubTodos.length > 0) {
        await Promise.all(
          initialSubTodos
            .filter((s: any) => s?.title && String(s.title).trim().length > 0)
            .map((s: any) =>
              todoService.createSubTodo(created.id, {
                title: String(s.title).trim(),
                dueDate: s.dueDate,
                dueTime: s.dueTime || undefined,
                completed: false,
              } as Omit<SubTodo, 'id' | 'createdAt'>)
            )
        )
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      toast.success('Todo created successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating todo:', error)
      toast.error(error?.message || 'Failed to create todo')
    },
  })

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      return todoService.updateTodo(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      toast.success('Todo updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating todo:', error)
      toast.error(error?.message || 'Failed to update todo')
    },
  })

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      return todoService.deleteTodo(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      toast.success('Todo deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting todo:', error)
      toast.error(error?.message || 'Failed to delete todo')
    },
  })

  const createSubTodoMutation = useMutation({
    mutationFn: async ({ todoId, subTodo }: { todoId: string; subTodo: Omit<SubTodo, 'id' | 'createdAt'> }) => {
      return todoService.createSubTodo(todoId, subTodo)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      toast.success('Sub-todo created successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating sub-todo:', error)
      toast.error(error?.message || 'Failed to create sub-todo')
    },
  })

  const updateSubTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SubTodo> }) => {
      return todoService.updateSubTodo(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
    },
    onError: (error: any) => {
      console.error('Error updating sub-todo:', error)
      toast.error(error?.message || 'Failed to update sub-todo')
    },
  })

  const deleteSubTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      return todoService.deleteSubTodo(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      toast.success('Sub-todo deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting sub-todo:', error)
      toast.error(error?.message || 'Failed to delete sub-todo')
    },
  })

  const healthCheckMutation = useMutation({
    mutationFn: async () => {
      return todoService.healthCheck()
    },
    onError: (error: any) => {
      console.error('Health check failed:', error)
      toast.error('Database connection issue. Please check your setup.')
    },
  })

  return {
    todos,
    isLoading,
    error,
    refetch,
    createTodo: createTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
    createSubTodo: createSubTodoMutation.mutate,
    updateSubTodo: updateSubTodoMutation.mutate,
    deleteSubTodo: deleteSubTodoMutation.mutate,
    healthCheck: healthCheckMutation.mutate,
    isCreating: createTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
    isHealthy: healthCheckMutation.data,
  }
}


