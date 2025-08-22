import { useEffect, useMemo, useRef, useState } from 'react';
import { Todo } from '@/types/todo';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, isAfter, isBefore, startOfDay, compareAsc } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';

interface CalendarPanelProps {
  todos: Todo[];
}

export const CalendarPanel = ({ todos }: CalendarPanelProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => 
      todo.dueDate && isSameDay(todo.dueDate, date)
    );
  };

  // Collect both todos and sub-todos occurring on a given date
  const getItemsForDate = (date: Date) => {
    const items: { id: string; title: string; priority: Todo['priority']; dueTime?: string; type: 'todo' | 'sub' }[] = [];
    for (const todo of todos) {
      if (todo.dueDate && isSameDay(todo.dueDate, date)) {
        items.push({ id: `todo-${todo.id}`, title: todo.title, priority: todo.priority, dueTime: todo.dueTime, type: 'todo' });
      }
      for (const sub of todo.subTodos) {
        if (sub.dueDate && isSameDay(sub.dueDate, date)) {
          items.push({ id: `sub-${sub.id}`, title: sub.title, priority: todo.priority, dueTime: sub.dueTime, type: 'sub' });
        }
      }
    }
    return items;
  };

  // Get hierarchical tasks for reminder section (all upcoming tasks, not just selected date)
  const getHierarchicalTasks = () => {
    const today = startOfDay(new Date());
    const mainTaskGroups: Array<{
      mainTask: Todo;
      subTasks: Array<Todo['subTodos'][0] & { dueDate: Date }>;
    }> = [];

    // Process each main todo
    for (const todo of todos) {
      const upcomingSubTasks = todo.subTodos.filter(sub => 
        sub.dueDate && !isBefore(startOfDay(sub.dueDate), today)
      ) as Array<Todo['subTodos'][0] & { dueDate: Date }>;

      // Include main task if it has a due date or if it has upcoming subtasks
      if ((todo.dueDate && !isBefore(startOfDay(todo.dueDate), today)) || upcomingSubTasks.length > 0) {
        mainTaskGroups.push({
          mainTask: todo,
          subTasks: upcomingSubTasks
        });
      }
    }

    // Sort groups by earliest due date (main task or first subtask)
    mainTaskGroups.sort((a, b) => {
      const getEarliestDate = (group: typeof a) => {
        const dates = [];
        if (group.mainTask.dueDate && !isBefore(startOfDay(group.mainTask.dueDate), today)) {
          dates.push(group.mainTask.dueDate);
        }
        dates.push(...group.subTasks.map(sub => sub.dueDate));
        return dates.length > 0 ? dates.sort((x, y) => compareAsc(x, y))[0] : new Date(9999, 0, 1);
      };

      return compareAsc(getEarliestDate(a), getEarliestDate(b));
    });

    return mainTaskGroups;
  };

  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate) : [];
  const selectedDateSubTodos = useMemo(() => {
    if (!selectedDate) return [];
    return todos.flatMap(todo => (
      todo.subTodos
        .filter(sub => sub.dueDate && isSameDay(sub.dueDate, selectedDate))
        .map(sub => ({ ...sub, parentPriority: todo.priority, parentTitle: todo.title }))
    ));
  }, [todos, selectedDate]);
  // Remove auto-selection of dates - let user click to select

  const getDayContent = (day: Date) => {
    const itemsForDay = getItemsForDate(day);
    if (itemsForDay.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          {itemsForDay.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ 
                backgroundColor: item.priority === 'urgent' ? '#ef4444' :
                                item.priority === 'high' ? '#f59e0b' :
                                item.priority === 'medium' ? '#eab308' : '#10b981'
              }}
            />
          ))}
          {itemsForDay.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Calendar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Calendar</h2>
        </div>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border-0 p-0"
          components={{
            Day: ({ date, ...props }) => {
              const today = startOfDay(new Date());
              const dayStart = startOfDay(date);
              const isPast = isBefore(dayStart, today);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const base = 'w-full h-full p-2 text-sm rounded-md';
              const tone = isSelected
                ? 'font-semibold'
                : isToday
                  ? 'text-foreground'
                  : isPast
                    ? 'text-muted-foreground'
                    : 'text-foreground/80';
              return (
                <div className="relative">
                  <button {...props} className={`${base} ${tone}`}>
                    {format(date, 'd')}
                    {getDayContent(date)}
                  </button>
                </div>
              );
            }
          }}
        />
      </div>

      {/* Reminder Section */}
      <div className="flex-1 p-6 custom-scrollbar overflow-y-auto">
        <div className="border-t border-border pt-2">
          <h3 className="font-medium mb-3 text-sm">
            {selectedDate ? `Reminders · ${format(selectedDate, 'MMM d')}` : 'Upcoming Reminders'}
          </h3>
          
          {selectedDate ? (
            // Show tasks for selected date only
            selectedDateTodos.length === 0 && selectedDateSubTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks for this day</p>
            ) : (
              <div className="space-y-3">
                {/* Group tasks hierarchically for selected date */}
                {selectedDateTodos.map(todo => {
                  const relatedSubTodos = selectedDateSubTodos.filter(sub => 
                    todos.find(t => t.id === todo.id)?.subTodos.some(s => s.id === sub.id)
                  );
                  
                  return (
                    <div key={todo.id} className="space-y-1">
                      {/* Main Task */}
                      <div className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            todo.priority === 'urgent' ? 'bg-red-500' :
                            todo.priority === 'high' ? 'bg-orange-500' :
                            todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="font-medium">{todo.title}</span>
                        </div>
                        {todo.dueTime && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {todo.dueTime}
                          </div>
                        )}
                      </div>
                      
                      {/* Related SubTodos */}
                      {relatedSubTodos.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md ml-4">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span className="text-muted-foreground">{sub.title}</span>
                          </div>
                          {sub.dueTime && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {sub.dueTime}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
                
                {/* Orphaned SubTodos (subtodos without main task on this date) */}
                {selectedDateSubTodos
                  .filter(sub => !selectedDateTodos.some(todo => 
                    todos.find(t => t.id === todo.id)?.subTodos.some(s => s.id === sub.id)
                  ))
                  .map(sub => (
                    <div key={sub.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          sub.parentPriority === 'urgent' ? 'bg-red-500' :
                          sub.parentPriority === 'high' ? 'bg-orange-500' :
                          sub.parentPriority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span>{sub.title}</span>
                      </div>
                      {sub.dueTime && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {sub.dueTime}
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            )
          ) : (
            // Show all upcoming tasks hierarchically sorted by date
            (() => {
              const hierarchicalTasks = getHierarchicalTasks();
              return hierarchicalTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming tasks</p>
              ) : (
                <div className="space-y-3">
                  {hierarchicalTasks.map((group, index) => (
                    <div key={index} className="space-y-1">
                      {/* Main Task */}
                      {group.mainTask.dueDate && !isBefore(startOfDay(group.mainTask.dueDate), startOfDay(new Date())) && (
                        <div className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              group.mainTask.priority === 'urgent' ? 'bg-red-500' :
                              group.mainTask.priority === 'high' ? 'bg-orange-500' :
                              group.mainTask.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <span className="font-medium">{group.mainTask.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(group.mainTask.dueDate, 'MMM d')}
                            </span>
                          </div>
                          {group.mainTask.dueTime && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {group.mainTask.dueTime}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* SubTodos */}
                      {group.subTasks.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md ml-4">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span className="text-muted-foreground">{sub.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(sub.dueDate, 'MMM d')}
                            </span>
                          </div>
                          {sub.dueTime && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {sub.dueTime}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};