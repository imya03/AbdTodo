import { useState, useRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Droppable } from '@hello-pangea/dnd';

export const MiniCalendar = ({ tasks = [], onHoverDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);

  const daysHeader = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startDay = new Date(year, month, 1).getDay();
  const adjustedStart = startDay === 0 ? 6 : startDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Создаем массив дней
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - adjustedStart + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const monthName = currentDate.toLocaleString('ru-RU', { month: 'long' });

  // Математика вычисления дня по координатам
  const handlePointerMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    // 1. Координаты относительно контейнера
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 2. Считаем количество рядов, которые РЕАЛЬНО отрендерены
    // calendarDays.length обычно 42 (6 недель)
    const totalRows = Math.ceil(calendarDays.length / 7);

    // 3. Ширина и высота ОДНОЙ ячейки
    const colWidth = rect.width / 7;
    const rowHeight = rect.height / totalRows; // Теперь делится на 5 или 6 динамически

    // 4. Вычисляем индексы
    const col = Math.floor(x / colWidth);
    const row = Math.floor(y / rowHeight);

    const index = row * 7 + col;

    // 5. Проверки
    if (index >= 0 && index < calendarDays.length && calendarDays[index] !== null) {
      setHoveredIndex(index);
      const day = calendarDays[index];
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (onHoverDate) onHoverDate(dateString);
    } else {
      setHoveredIndex(null);
      if (onHoverDate) onHoverDate(null);
    }
  };


  const handleMouseLeave = () => {
    setHoveredIndex(null);
    if (onHoverDate) onHoverDate(null);
  };

  return (
    <GlassCard className="p-4 flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium capitalize text-sm">{monthName} {year}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="text-white/40 hover:text-white p-1"><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="text-white/40 hover:text-white p-1"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="w-full grid grid-cols-7 gap-1">

        {daysHeader.map(d => (
          <div key={d} className="text-[10px] text-white/30 font-bold text-center uppercase mb-1">{d}</div>
        ))}
      </div>

      <Droppable droppableId="calendar-main-zone">
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              containerRef.current = el; // Реф теперь только на сетке дней
            }}
            onPointerMove={handlePointerMove}
            className="grid grid-cols-7 gap-1"
          >
            {calendarDays.map((day, i) => {
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const isHovered = hoveredIndex === i && snapshot.isDraggingOver;

              return (
                <div
                  key={i}
                  className={`
                    relative text-[10px] py-2 rounded-lg flex flex-col items-center justify-center transition-all duration-200
                    ${!day ? 'opacity-0' : 'opacity-100'}
                    ${isToday ? 'text-purple-400 font-bold' : 'text-white/80'}
                    ${isHovered ? 'bg-purple-600 text-white scale-125 z-20 shadow-xl shadow-purple-500/40' : 'hover:bg-white/5'}
                  `}
                >
                  {day}
                  {/* Точка если есть таски (логику hasTask оставь свою) */}
                </div>
              );
            })}
            {/* Плейсхолдер нужен для работы библиотеки, но мы его не показываем */}
            <div className="hidden">{provided.placeholder}</div>
          </div>
        )}
      </Droppable>
    </GlassCard>
  );
};