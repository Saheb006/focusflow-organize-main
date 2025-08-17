import { Todo, SubTodo } from '@/types/todo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useState } from 'react';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (updates: Partial<Todo>) => void;
  onDelete: () => void;
  onToggle: () => void;
  onSubTodoToggle: (subTodoId: string) => void;
  onSubTodoAdd: (todoId: string, title: string, dueDate?: Date, dueTime?: string) => void;
  onSubTodoDelete: (todoId: string, subTodoId: string) => void;
  onSubTodoUpdate: (todoId: string, subTodoId: string, updates: Partial<SubTodo>) => void;
}

const priorityConfig = {
  urgent: { color: 'priority-urgent', label: 'Urgent' },
  high: { color: 'priority-high', label: 'High' },
  medium: { color: 'priority-medium', label: 'Medium' },
  low: { color: 'priority-low', label: 'Low' }
};

export const TodoCard = ({ 
  todo, 
  onUpdate, 
  onDelete, 
  onToggle, 
  onSubTodoToggle,
  onSubTodoAdd,
  onSubTodoDelete,
  onSubTodoUpdate
}: TodoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [isAddingSubTodo, setIsAddingSubTodo] = useState(false);
  const [newSubTodoTitle, setNewSubTodoTitle] = useState('');
  const [newSubTodoDueDate, setNewSubTodoDueDate] = useState('');
  const [newSubTodoDueTime, setNewSubTodoDueTime] = useState('');

  const getProgress = () => {
    if (todo.subTodos.length === 0) return 0;
    const completed = todo.subTodos.filter(sub => sub.completed).length;
    return (completed / todo.subTodos.length) * 100;
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date() > todo.dueDate;

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleAddSubTodo = () => {
    if (newSubTodoTitle.trim()) {
      const dueDate = newSubTodoDueDate ? new Date(newSubTodoDueDate) : undefined;
      onSubTodoAdd(todo.id, newSubTodoTitle.trim(), dueDate, newSubTodoDueTime || undefined);
      setNewSubTodoTitle('');
      setNewSubTodoDueDate('');
      setNewSubTodoDueTime('');
      setIsAddingSubTodo(false);
    }
  };

  const handleCancelAddSubTodo = () => {
    setIsAddingSubTodo(false);
    setNewSubTodoTitle('');
    setNewSubTodoDueDate('');
    setNewSubTodoDueTime('');
  };

  const isSubTodoOverdue = (subTodo: SubTodo) => {
    return subTodo.dueDate && !subTodo.completed && new Date() > subTodo.dueDate;
  };

  return (
    <Card className={`
      transition-all duration-300 hover:shadow-lg border-l-4 
      ${todo.completed ? 'opacity-75 bg-muted/50' : 'bg-card'}
      ${isOverdue ? 'border-l-red-500' : `border-l-${priorityConfig[todo.priority].color}`}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={onToggle}
              className="mt-1"
            />
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-semibold"
                    placeholder="Todo title"
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-sm"
                    placeholder="Description (optional)"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`priority-dot ${priorityConfig[todo.priority].color}`} />
                    <h3 className={`font-semibold text-lg leading-tight ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {todo.title}
                    </h3>
                    {todo.completed && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </div>
                  
                  {todo.description && (
                    <p className="text-muted-foreground text-sm mb-3">
                      {todo.description}
                    </p>
                  )}

                  {/* Tags */}
                  {todo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {todo.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Due date and time */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {todo.dueDate && (
                      <div className={`flex items-center space-x-1 ${
                        isOverdue ? 'text-red-500 font-medium' : ''
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(todo.dueDate)}</span>
                      </div>
                    )}
                    {todo.dueTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{todo.dueTime}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Sub-todos */}
      <CardContent className="pt-0">
        {/* Progress bar */}
        {todo.subTodos.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Sub-todo list */}
        <div className="space-y-2">
          {todo.subTodos.map(subTodo => (
            <div key={subTodo.id} className="flex items-start space-x-2 py-1">
              <Checkbox
                checked={subTodo.completed}
                onCheckedChange={() => onSubTodoToggle(subTodo.id)}
                className="h-4 w-4 mt-1"
              />
              <div className="flex-1">
                <span className={`text-sm ${
                  subTodo.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {subTodo.title}
                </span>
                {/* Sub-todo due date and time */}
                {(subTodo.dueDate || subTodo.dueTime) && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    {subTodo.dueDate && (
                      <div className={`flex items-center space-x-1 ${
                        isSubTodoOverdue(subTodo) ? 'text-red-500 font-medium' : ''
                      }`}>
                        <Calendar className="h-2 w-2" />
                        <span>{formatDate(subTodo.dueDate)}</span>
                      </div>
                    )}
                    {subTodo.dueTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-2 w-2" />
                        <span>{subTodo.dueTime}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                onClick={() => onSubTodoDelete(todo.id, subTodo.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add sub-todo input or button */}
        {isAddingSubTodo ? (
          <div className="mt-3 space-y-2">
            <Input
              value={newSubTodoTitle}
              onChange={(e) => setNewSubTodoTitle(e.target.value)}
              placeholder="Enter subtask title"
              className="h-8"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubTodo()}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={newSubTodoDueDate}
                onChange={(e) => setNewSubTodoDueDate(e.target.value)}
                className="h-8 text-xs"
              />
              <Input
                type="time"
                value={newSubTodoDueTime}
                onChange={(e) => setNewSubTodoDueTime(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleAddSubTodo}>
                <Check className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelAddSubTodo}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAddingSubTodo(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add subtask
          </Button>
        )}
      </CardContent>

      {/* Color indicator */}
      {todo.color && (
        <div 
          className="h-1 w-full rounded-b-lg" 
          style={{ backgroundColor: todo.color }}
        />
      )}
    </Card>
  );
};