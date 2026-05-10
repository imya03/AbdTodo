import React, { useMemo, useState } from 'react';
import { Layout, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskItem } from './TaskItem';

const TaskGroup = ({ title, tasks, onToggle, onDelete, onUpdate, tagColors, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (tasks.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full py-2 group"
      >
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
        </motion.div>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">
          {title} <span className="ml-2 text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </h3>
        <div className="flex-1 h-[1px] bg-white/5 ml-4" />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-2 pb-4">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  tagColors={tagColors}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TaskList = ({ tasks, onToggle, onDelete, onUpdate, onOpenCommand, tagColors }) => {
  const [hideCompleted, setHideCompleted] = useState(true); // Состояние фильтра

  const groupedTasks = useMemo(() => {
    const groups = { overdue: [], today: [], tomorrow: [], upcoming: [], noDate: [] };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTime = now.getTime();
    
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomorrowTime = tom.getTime();

    // 1. Сначала применяем глобальный фильтр "Скрыть выполненные"
    const visibleTasks = hideCompleted ? tasks.filter(t => !t.completed) : tasks;

    visibleTasks.forEach(task => {
      // 2. Если задача без даты — сразу в "Без даты"
      if (!task.dueDate) {
        groups.noDate.push(task);
        return;
      }

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      const taskTime = taskDate.getTime();

      // 3. ПРОВЕРКА НА ПРОСРОЧКУ: Дата в прошлом И задача НЕ выполнена
      if (taskTime < todayTime) {
        if (!task.completed) {
          groups.overdue.push(task);
        } else {
          // Если задача вчерашняя, но ВЫПОЛНЕННАЯ, 
          // и мы её не скрыли фильтром, отправим её в "Сегодня" (как завершенную)
          // или просто проигнорируем в этом списке, чтобы не путать
          groups.today.push(task); 
        }
      } 
      // 4. Остальные распределения
      else if (taskTime === todayTime) {
        groups.today.push(task);
      } else if (taskTime === tomorrowTime) {
        groups.tomorrow.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    // Сортировка
    const sortFn = (a, b) => (a.position || 0) - (b.position || 0);
    Object.keys(groups).forEach(key => groups[key].sort(sortFn));

    return groups;
  }, [tasks, hideCompleted]);

  return (
    <main className="flex-1 flex flex-col gap-6">
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            Расписание
          </h1>
          <p className="text-white/40 font-medium">Ваши задачи по приоритету времени</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Кнопка фильтра */}
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${
              hideCompleted 
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
            }`}
          >
            {hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
            {hideCompleted ? "Скрыты выполненные" : "Показать все"}
          </button>

          <button
            onClick={onOpenCommand}
            className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium hover:bg-white/10 transition-all active:scale-95 text-white/70"
          >
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
            <span>Действие</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/20">
            <Layout size={48} strokeWidth={1} className="mb-4" />
            <p>Список задач пуст</p>
          </div>
        ) : (
          <>
            <TaskGroup title="Просрочено" tasks={groupedTasks.overdue} {...{onToggle, onDelete, onUpdate, tagColors}} />
            <TaskGroup title="Сегодня" tasks={groupedTasks.today} {...{onToggle, onDelete, onUpdate, tagColors}} />
            <TaskGroup title="Завтра" tasks={groupedTasks.tomorrow} {...{onToggle, onDelete, onUpdate, tagColors}} />
            <TaskGroup title="Предстоящие" tasks={groupedTasks.upcoming} {...{onToggle, onDelete, onUpdate, tagColors}} defaultOpen={false} />
            <TaskGroup title="Без даты" tasks={groupedTasks.noDate} {...{onToggle, onDelete, onUpdate, tagColors}} defaultOpen={false} />
          </>
        )}
      </div>
    </main>
  );
};