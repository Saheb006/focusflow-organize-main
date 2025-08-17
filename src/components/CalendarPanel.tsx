import { useState } from 'react';
import { Todo } from '@/types/todo';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
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

  const getDateWithTodos = () => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.filter(day => getTodosForDate(day).length > 0);
  };

  const selectedDateTodos = getTodosForDate(selectedDate);
  const datesWithTodos = getDateWithTodos();

  const getDayContent = (day: Date) => {
    const todosForDay = getTodosForDate(day);
    if (todosForDay.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          {todosForDay.slice(0, 3).map((todo, index) => (
            <div
              key={todo.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ 
                backgroundColor: todo.priority === 'urgent' ? '#ef4444' :
                                todo.priority === 'high' ? '#f59e0b' :
                                todo.priority === 'medium' ? '#eab308' : '#10b981'
              }}
            />
          ))}
          {todosForDay.length > 3 && (
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
            Day: ({ date, ...props }) => (
              <div className="relative">
                <button {...props} className={`
                  w-full h-full p-2 text-sm rounded-md hover:bg-muted
                  ${isSameDay(date, selectedDate) ? 'bg-primary text-primary-foreground' : ''}
                  ${isSameDay(date, new Date()) ? 'font-bold' : ''}
                `}>
                  {format(date, 'd')}
                  {getDayContent(date)}
                </button>
              </div>
            )
          }}
        />
      </div>

      {/* Selected Date Todos */}
      <div className="flex-1 p-6 custom-scrollbar overflow-y-auto">
        <div className="mb-4">
          <h3 className="font-medium mb-2">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          {selectedDateTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tasks scheduled for this day
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateTodos.map(todo => (
                <Card key={todo.id} className="border-l-4" style={{
                  borderLeftColor: todo.priority === 'urgent' ? '#ef4444' :
                                  todo.priority === 'high' ? '#f59e0b' :
                                  todo.priority === 'medium' ? '#eab308' : '#10b981'
                }}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm leading-tight ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {todo.title}
                        </h4>
                        {todo.dueTime && (
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {todo.dueTime}
                          </div>
                        )}
                        {todo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {todo.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs h-4">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`
                        w-2 h-2 rounded-full ml-2 mt-1
                        ${todo.priority === 'urgent' ? 'bg-red-500' :
                          todo.priority === 'high' ? 'bg-orange-500' :
                          todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                      `} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        {datesWithTodos.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-3 text-sm">Upcoming Tasks</h3>
            <div className="space-y-2">
              {datesWithTodos.slice(0, 5).map(date => {
                const todosForDate = getTodosForDate(date);
                return (
                  <div 
                    key={date.toISOString()}
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded-md"
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="text-muted-foreground">
                      {format(date, 'MMM d')}
                    </span>
                    <Badge variant="secondary" className="h-5 text-xs">
                      {todosForDate.length}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};