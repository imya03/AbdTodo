import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const MiniCalendar = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedStart = startDay === 0 ? 6 : startDay - 1;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - adjustedStart + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const monthName = currentDate.toLocaleString('ru-RU', { month: 'long' });

  // Функция для проверки наличия задач на конкретный день
  const hasTasksOnDay = (day) => {
    if (!day) return false;
    return tasks.some(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium capitalize text-sm">{monthName}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
            className="text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
            className="text-white/40 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map(d => (
          <div key={d} className="text-[10px] text-white/30 font-bold uppercase mb-1">
            {d}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();
          
          const hasTask = hasTasksOnDay(day);

          return (
            <div 
              key={i} 
              className={`relative text-[10px] py-1.5 rounded-lg flex flex-col items-center justify-center transition-all
                ${day ? 'text-white/80' : 'text-transparent'} 
                ${isToday ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'hover:bg-white/5'}
              `}
            >
              {day}
              {/* Точка-индикатор */}
              {day && hasTask && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-purple-300' : 'bg-purple-500'}`} />
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};