import React from 'react';
import { Layout } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';

export const TaskList = ({ tasks, onToggle, onDelete, onUpdate, onOpenCommand }) => {
  return (
    <main className="flex-1 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            AbdTodo
          </h1>
          <p className="text-white/40 font-medium">Коллаборативный таск-менеджер</p>
        </div>
        <button
          onClick={onOpenCommand}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium hover:bg-white/10 transition-all active:scale-95"
        >
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
          <span>Быстрое действие</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-white/20">
            <Layout size={48} strokeWidth={1} className="mb-4" />
            <p>Список задач пуст</p>
          </div>
        )}
      </div>
    </main>
  );
};