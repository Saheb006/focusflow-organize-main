import { Todo, Priority, TodoFilter } from '@/types/todo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Circle, Zap, Filter } from 'lucide-react';

interface PriorityPanelProps {
  todos: Todo[];
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const priorityConfig = {
  urgent: { 
    label: 'Urgent', 
    icon: Zap, 
    color: 'priority-urgent',
    description: 'Needs immediate attention'
  },
  high: { 
    label: 'High', 
    icon: AlertCircle, 
    color: 'priority-high',
    description: 'Important tasks'
  },
  medium: { 
    label: 'Medium', 
    icon: Circle, 
    color: 'priority-medium',
    description: 'Regular priority'
  },
  low: { 
    label: 'Low', 
    icon: Circle, 
    color: 'priority-low',
    description: 'When you have time'
  }
};

export const PriorityPanel = ({ todos, filter, onFilterChange }: PriorityPanelProps) => {
  const getPriorityCount = (priority: Priority) => {
    return todos.filter(todo => todo.priority === priority && !todo.completed).length;
  };

  const getCompletedCount = () => {
    return todos.filter(todo => todo.completed).length;
  };

  const handlePriorityClick = (priority: Priority) => {
    if (filter.priority === priority) {
      onFilterChange({ ...filter, priority: undefined });
    } else {
      onFilterChange({ ...filter, priority, completed: false });
    }
  };

  const handleCompletedClick = () => {
    if (filter.completed === true) {
      onFilterChange({ ...filter, completed: undefined });
    } else {
      onFilterChange({ ...filter, completed: true, priority: undefined });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="w-80 bg-card border-r border-border p-6 custom-scrollbar overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Priorities</h2>
          {(filter.priority || filter.completed !== undefined) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Priority Buttons */}
        <div className="space-y-3">
          {Object.entries(priorityConfig).map(([priority, config]) => {
            const count = getPriorityCount(priority as Priority);
            const isActive = filter.priority === priority;
            const Icon = config.icon;

            return (
              <Button
                key={priority}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-4 ${isActive ? 'bg-primary' : 'hover:bg-muted'}`}
                onClick={() => handlePriorityClick(priority as Priority)}
              >
                <div className="flex items-center w-full">
                  <div className={`priority-dot ${config.color} mr-3`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{config.label}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                  <Icon className="h-4 w-4 ml-2" />
                </div>
              </Button>
            );
          })}
        </div>

        {/* Completed Section */}
        <div className="pt-4 border-t border-border">
          <Button
            variant={filter.completed === true ? "default" : "ghost"}
            className={`w-full justify-start h-auto p-4 ${filter.completed === true ? 'bg-success' : 'hover:bg-muted'}`}
            onClick={handleCompletedClick}
          >
            <div className="flex items-center w-full">
              <div className="w-3 h-3 rounded-full bg-success mr-3" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Completed</span>
                  <Badge variant="secondary" className="ml-2">
                    {getCompletedCount()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks you've finished
                </p>
              </div>
            </div>
          </Button>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tasks</span>
              <span className="font-medium">{todos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium">{todos.filter(t => !t.completed).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-success">{getCompletedCount()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};