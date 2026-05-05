import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const FullCalendar = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Логика формирования сетки (аналогично мини-календарю, но с расширением)
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Сдвиг для понедельника (в JS 0 - это воскресенье)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const calendarDays = [];
    // Добавляем пустые ячейки или дни прошлого месяца для полноты сетки
    for (let i = 0; i < 42; i++) {
      const dayNumber = i - offset + 1;
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        calendarDays.push(new Date(year, month, dayNumber));
      } else {
        calendarDays.push(null);
      }
    }
    return calendarDays;
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Шапка календаря */}
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold capitalize">
            {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
        >
          Сегодня
        </button>
      </header>

      {/* Сетка календаря */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col border-white/5">
        {/* Дни недели */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
              {day}
            </div>
          ))}
        </div>

        {/* Ячейки дней */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr">
          {monthData.map((date, index) => (
            <CalendarCell 
              key={index} 
              date={date} 
              isToday={date?.toDateString() === new Date().toDateString()}
              tasks={tasks.filter(t => {
                if (!t.dueDate || !date) return false;
                const d = new Date(t.dueDate);
                return d.toDateString() === date.toDateString();
              })}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

const CalendarCell = ({ date, tasks, isToday }) => {
  if (!date) return <div className="border-b border-r border-white/5 bg-black/20" />;

  return (
    <div className={`border-b border-r border-white/5 p-2 flex flex-col gap-1 min-h-[100px] transition-colors hover:bg-white/[0.02]`}>
      <span className={`text-xs font-medium self-end px-2 py-1 rounded-md ${
        isToday ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-white/40'
      }`}>
        {date.getDate()}
      </span>
      
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
        {tasks.slice(0, 3).map(task => (
          <div 
            key={task.id}
            className={`text-[10px] px-2 py-1 rounded-md truncate border ${
              task.completed 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/70 line-through' 
                : 'bg-purple-500/10 border-purple-500/20 text-purple-200'
            }`}
          >
            {task.title}
          </div>
        ))}
        {tasks.length > 3 && (
          <div className="text-[9px] text-white/20 pl-1 flex items-center gap-1">
            <MoreHorizontal size={10} /> еще {tasks.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};