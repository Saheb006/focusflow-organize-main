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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const selectedDateTodos = getTodosForDate(selectedDate);
  const selectedDateSubTodos = useMemo(() => {
    return todos.flatMap(todo => (
      todo.subTodos
        .filter(sub => sub.dueDate && isSameDay(sub.dueDate, selectedDate))
        .map(sub => ({ ...sub, parentPriority: todo.priority }))
    ));
  }, [todos, selectedDate]);
  // On first load, default to closest upcoming date with tasks (including today)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    const today = startOfDay(new Date());
    const futureDates: Date[] = [];
    const todayDates: Date[] = [];
    for (const todo of todos) {
      if (todo.dueDate) {
        const d = startOfDay(todo.dueDate);
        if (isAfter(d, today)) futureDates.push(d);
        else if (isSameDay(d, today)) todayDates.push(d);
      }
      for (const sub of todo.subTodos) {
        if (sub.dueDate) {
          const d = startOfDay(sub.dueDate);
          if (isAfter(d, today)) futureDates.push(d);
          else if (isSameDay(d, today)) todayDates.push(d);
        }
      }
    }
    if (futureDates.length > 0 || todayDates.length > 0) {
      const pool = futureDates.length > 0 ? futureDates : todayDates;
      pool.sort((a, b) => compareAsc(a, b));
      setSelectedDate(pool[0]);
      hasInitialized.current = true;
    }
  }, [todos]);

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
              const isSelected = isSameDay(date, selectedDate);
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

      {/* Reminder Section - shows selected day items */}
      <div className="flex-1 p-6 custom-scrollbar overflow-y-auto">
        <div className="border-t border-border pt-2">
          <h3 className="font-medium mb-3 text-sm">Reminders · {format(selectedDate, 'MMM d')}</h3>
          {selectedDateTodos.length === 0 && selectedDateSubTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks for this day</p>
          ) : (
            <div className="space-y-2">
              {selectedDateTodos.map(todo => (
                <div key={todo.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      todo.priority === 'urgent' ? 'bg-red-500' :
                      todo.priority === 'high' ? 'bg-orange-500' :
                      todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span>{todo.title}</span>
                  </div>
                  {todo.dueTime && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {todo.dueTime}
                    </div>
                  )}
                </div>
              ))}
              {selectedDateSubTodos.map(sub => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};