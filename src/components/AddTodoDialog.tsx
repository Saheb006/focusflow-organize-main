import { useState } from 'react';
import { Todo, Priority, SubTodo } from '@/types/todo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CalendarIcon, Clock, Plus, X, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
}

interface SubTodoInput {
  id: string;
  title: string;
  dueDate?: Date;
  dueTime: string;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low Priority', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-500' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

const colors = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6'
];

export const AddTodoDialog = ({ open, onOpenChange, onAddTodo }: AddTodoDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date>();
  const [dueTime, setDueTime] = useState('');
  const [color, setColor] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [subTodos, setSubTodos] = useState<SubTodoInput[]>([
    { id: 'temp-0', title: '', dueDate: undefined, dueTime: '' }
  ]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const todo: Omit<Todo, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      color: color || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      subTodos: subTodos
        .filter(sub => sub.title.trim())
        .map((sub, index) => ({
          id: `temp-${index}`,
          title: sub.title.trim(),
          completed: false,
          dueDate: sub.dueDate,
          dueTime: sub.dueTime || undefined,
          createdAt: new Date()
        })),
      tags,
      completedAt: undefined
    };

    onAddTodo(todo);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setDueTime('');
    setColor('');
    setTags([]);
    setNewTag('');
    setSubTodos([{ id: 'temp-0', title: '', dueDate: undefined, dueTime: '' }]);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const updateSubTodo = (index: number, field: keyof SubTodoInput, value: any) => {
    const updated = [...subTodos];
    updated[index] = { ...updated[index], [field]: value };
    setSubTodos(updated);
  };

  const addSubTodo = () => {
    const newId = `temp-${subTodos.length}`;
    setSubTodos([...subTodos, { id: newId, title: '', dueDate: undefined, dueTime: '' }]);
  };

  const removeSubTodo = (index: number) => {
    if (subTodos.length > 1) {
      setSubTodos(subTodos.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add some details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${p.color}`} />
                      <span>{p.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Due Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded-full border-2 ${
                      color === c ? 'border-foreground' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(color === c ? '' : c)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sub-todos */}
          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="space-y-3">
              {subTodos.map((subTodo, index) => (
                <div key={subTodo.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={`Subtask ${index + 1}...`}
                      value={subTodo.title}
                      onChange={(e) => updateSubTodo(index, 'title', e.target.value)}
                      className="flex-1"
                    />
                    {subTodos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubTodo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Sub-todo due date and time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal text-xs",
                              !subTodo.dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {subTodo.dueDate ? format(subTodo.dueDate, "MMM dd") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={subTodo.dueDate}
                            onSelect={(date) => updateSubTodo(index, 'dueDate', date)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs">Due Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          type="time"
                          value={subTodo.dueTime}
                          onChange={(e) => updateSubTodo(index, 'dueTime', e.target.value)}
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSubTodo}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subtask
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              Create Todo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};