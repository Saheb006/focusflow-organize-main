export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTodo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  dueTime?: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  color?: string;
  dueDate?: Date;
  dueTime?: string;
  subTodos: SubTodo[];
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface TodoFilter {
  priority?: Priority;
  tag?: string;
  completed?: boolean;
  search?: string;
}