import React, { useMemo } from 'react';
import { CheckCircle2, ListTodo, CalendarDays } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatsWidget } from '../ui/StatsWidget';
import { MiniCalendar } from '../calendar/MiniCalendar';


export const RightSidebar = ({ tasks = [] }) => {
  // Фильтруем задачи на сегодня
  const todayTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toDateString() === today;
    });
  }, [tasks]);

  // Считаем прогресс только для сегодня
  const completedToday = todayTasks.filter(t => t.completed).length;

  return (
    <aside className="w-72 flex flex-col gap-6">
      <StatsWidget tasks={tasks} /> 
      <MiniCalendar tasks={tasks}/>
      
      <GlassCard className="p-5 flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/90">
            <ListTodo size={18} className="text-purple-400" />
            <h4 className="font-semibold text-sm">План на сегодня</h4>
          </div>
          <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-white/40 font-medium">
            {completedToday}/{todayTasks.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {todayTasks.length > 0 ? (
            todayTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-3 rounded-xl border transition-all ${
                  task.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/10 opacity-50' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <p className={`text-xs truncate font-medium ${task.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
                    {task.title}
                  </p>
                </div>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {task.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] text-white/20 uppercase tracking-wider">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <CalendarDays size={32} className="text-white/10 mb-2" />
              <p className="text-[11px] text-white/20">На сегодня задач нет.<br/>Отличный повод отдохнуть!</p>
            </div>
          )}
        </div>
      </GlassCard>
    </aside>
  );
};