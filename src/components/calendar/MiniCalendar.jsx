import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
export const MiniCalendar = () => {
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

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium capitalize text-sm">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="text-white/40 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map(d => <div key={d} className="text-[10px] text-white/30 font-bold uppercase">{d}</div>)}
        {calendarDays.map((day, i) => {
          const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
          return (
            <div key={i} className={`text-[10px] py-1 rounded-lg ${day ? 'text-white/80' : 'text-transparent'} ${isToday ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : ''}`}>
              {day}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};