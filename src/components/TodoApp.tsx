import { useState, useEffect } from 'react';
import { Todo, Priority, TodoFilter, SubTodo } from '@/types/todo';
import { PriorityPanel } from './PriorityPanel';
import { MainPanel } from './MainPanel';
import { CalendarPanel } from './CalendarPanel';
import { AddTodoDialog } from './AddTodoDialog';
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTodos } from '@/hooks/useTodos';
import { Header } from './Header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const TodoApp = () => {
  const [filter, setFilter] = useState<TodoFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const {
    todos,
    isLoading,
    error,
    refetch,
    createTodo,
    updateTodo,
    deleteTodo,
    createSubTodo,
    updateSubTodo,
    deleteSubTodo,
    healthCheck,
    isCreating,
    isUpdating,
    isDeleting,
    isHealthy
  } = useTodos();

  // Health check on component mount
  useEffect(() => {
    healthCheck();
  }, [healthCheck]);

  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    try {
      createTodo(todo);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add todo. Please try again.');
    }
  };

  const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
    try {
      updateTodo({ id, updates });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = (id: string) => {
    try {
      deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo. Please try again.');
    }
  };

  const toggleTodoComplete = (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        updateTodo({
          id,
          updates: {
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date() : undefined
          }
        });
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Failed to update todo. Please try again.');
    }
  };

  const toggleSubTodoComplete = (todoId: string, subTodoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        const subTodo = todo.subTodos.find(sub => sub.id === subTodoId);
        if (subTodo) {
          updateSubTodo({
            id: subTodoId,
            updates: { completed: !subTodo.completed }
          });

          // Auto-complete main todo if all sub-todos are completed
          const updatedSubTodos = todo.subTodos.map(sub =>
            sub.id === subTodoId ? { ...sub, completed: !sub.completed } : sub
          );
          
          const allSubTodosCompleted = updatedSubTodos.length > 0 && 
            updatedSubTodos.every(sub => sub.completed);
          
          if (allSubTodosCompleted !== todo.completed) {
            updateTodo({
              id: todoId,
              updates: {
                completed: allSubTodosCompleted,
                completedAt: allSubTodosCompleted ? new Date() : undefined
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling sub-todo:', error);
      toast.error('Failed to update sub-todo. Please try again.');
    }
  };

  const handleAddSubTodo = (todoId: string, title: string, dueDate?: Date, dueTime?: string) => {
    try {
      createSubTodo({
        todoId,
        subTodo: {
          title,
          dueDate,
          dueTime
        }
      });
    } catch (error) {
      console.error('Error adding sub-todo:', error);
      toast.error('Failed to add sub-todo. Please try again.');
    }
  };

  const handleDeleteSubTodo = (todoId: string, subTodoId: string) => {
    try {
      deleteSubTodo(subTodoId);
      
      // Check if we need to uncomplete the main todo
      const todo = todos.find(t => t.id === todoId);
      if (todo && todo.completed) {
        const remainingSubTodos = todo.subTodos.filter(sub => sub.id !== subTodoId);
        const allRemainingCompleted = remainingSubTodos.length > 0 && 
          remainingSubTodos.every(sub => sub.completed);
        
        if (!allRemainingCompleted) {
          updateTodo({
            id: todoId,
            updates: {
              completed: false,
              completedAt: undefined
            }
          });
        }
      }
    } catch (error) {
      console.error('Error deleting sub-todo:', error);
      toast.error('Failed to delete sub-todo. Please try again.');
    }
  };

  const handleUpdateSubTodo = (todoId: string, subTodoId: string, updates: Partial<SubTodo>) => {
    try {
      updateSubTodo({
        id: subTodoId,
        updates
      });
    } catch (error) {
      console.error('Error updating sub-todo:', error);
      toast.error('Failed to update sub-todo. Please try again.');
    }
  };

  // Filter todos based on current filter and search
  const filteredTodos = todos.filter(todo => {
    // If filter.completed is explicitly set, respect it
    if (filter.completed !== undefined && todo.completed !== filter.completed) return false;
    
    // If no completed filter is set, default to showing only active todos
    if (filter.completed === undefined && todo.completed) return false;
    
    if (filter.priority && todo.priority !== filter.priority) return false;
    if (filter.tag && !todo.tags.includes(filter.tag)) return false;
    if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleRetry = async () => {
    try {
      await refetch();
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error retrying:', error);
      toast.error('Failed to refresh data. Please try again.');
    }
  };

  // Show setup error if database is not configured
  if (!isHealthy && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Database connection issue. Please check your Supabase setup:
              <br />
              1. Ensure your environment variables are set correctly
              <br />
              2. Run the database schema in Supabase SQL Editor
              <br />
              3. Check your Row Level Security policies
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your todos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Panel - Priority Tabs */}
        <PriorityPanel 
          todos={todos}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Main Panel */}
        <MainPanel
          todos={filteredTodos}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTodoUpdate={handleUpdateTodo}
          onTodoDelete={handleDeleteTodo}
          onTodoToggle={toggleTodoComplete}
          onSubTodoToggle={toggleSubTodoComplete}
          onSubTodoAdd={handleAddSubTodo}
          onSubTodoDelete={handleDeleteSubTodo}
          onSubTodoUpdate={handleUpdateSubTodo}
        />

        {/* Right Panel - Calendar */}
        <CalendarPanel todos={todos} />
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        style={{ background: 'var(--gradient-primary)' }}
        disabled={isCreating}
      >
        {isCreating ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Add Todo Dialog */}
      <AddTodoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddTodo={addTodo}
      />
    </div>
  );
};

export default TodoApp;