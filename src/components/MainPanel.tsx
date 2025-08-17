import { Todo } from '@/types/todo';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TodoCard } from './TodoCard';

interface MainPanelProps {
  todos: Todo[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTodoUpdate: (id: string, updates: Partial<Todo>) => void;
  onTodoDelete: (id: string) => void;
  onTodoToggle: (id: string) => void;
  onSubTodoToggle: (todoId: string, subTodoId: string) => void;
  onSubTodoAdd: (todoId: string, title: string, dueDate?: Date, dueTime?: string) => void;
  onSubTodoDelete: (todoId: string, subTodoId: string) => void;
  onSubTodoUpdate: (todoId: string, subTodoId: string, updates: any) => void;
}

export const MainPanel = ({
  todos,
  searchQuery,
  onSearchChange,
  onTodoUpdate,
  onTodoDelete,
  onTodoToggle,
  onSubTodoToggle,
  onSubTodoAdd,
  onSubTodoDelete,
  onSubTodoUpdate
}: MainPanelProps) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Search Header */}
      <div className="border-b border-border p-6 bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-12 text-base bg-background border-border focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 p-6 custom-scrollbar overflow-y-auto">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No todos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search or filters" 
                : "Create your first todo to get started"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.map((todo, index) => (
              <div 
                key={todo.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TodoCard
                  todo={todo}
                  onUpdate={(updates) => onTodoUpdate(todo.id, updates)}
                  onDelete={() => onTodoDelete(todo.id)}
                  onToggle={() => onTodoToggle(todo.id)}
                  onSubTodoToggle={(subTodoId) => onSubTodoToggle(todo.id, subTodoId)}
                  onSubTodoAdd={(todoId, title, dueDate, dueTime) => onSubTodoAdd(todoId, title, dueDate, dueTime)}
                  onSubTodoDelete={(todoId, subTodoId) => onSubTodoDelete(todoId, subTodoId)}
                  onSubTodoUpdate={(todoId, subTodoId, updates) => onSubTodoUpdate(todoId, subTodoId, updates)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};