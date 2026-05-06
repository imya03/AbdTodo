import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoreHorizontal, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const FullCalendar = ({ tasks = [], onToggle }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Сдвиг для понедельника
        const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Вычисляем сколько всего ячеек нужно (кратное 7)
        const totalCellsNeeded = Math.ceil((offset + daysInMonth) / 7) * 7;

        const calendarDays = [];
        for (let i = 0; i < totalCellsNeeded; i++) {
            const dayNumber = i - offset + 1;
            if (dayNumber > 0 && dayNumber <= daysInMonth) {
                calendarDays.push(new Date(year, month, dayNumber));
            } else {
                calendarDays.push(null);
            }
        }
        return calendarDays;
    }, [currentDate]);

    // Определяем количество строк для CSS
    const rowCount = monthData.length / 7;

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <div className="flex flex-col h-full space-y-4">
            <header className="flex items-center justify-between px-4 md:px-2">
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold capitalize">
                        {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
                >
                    Сегодня
                </button>
            </header>

            <GlassCard className="flex-1 overflow-hidden flex flex-col border-x-0 md:border-x border-white/5 rounded-none md:rounded-3xl">
                <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                        <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Динамическая сетка: rows-{rowCount} */}
                <div
                    className="flex-1 grid grid-cols-7 auto-rows-fr"
                    style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
                >
                    {monthData.map((date, index) => (
                        <CalendarCell
                            key={index}
                            date={date}
                            onToggle={onToggle}
                            isLastColumn={(index + 1) % 7 === 0}
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

const CalendarCell = ({ date, tasks, isToday, isLastColumn, onToggle }) => {
    if (!date) return <div className={`border-b border-white/5 bg-black/10 ${isLastColumn ? '' : 'border-r'}`} />;

    return (
        <div className={`border-b border-white/5 flex flex-col min-h-[100px] transition-colors hover:bg-white/[0.02] ${isLastColumn ? '' : 'border-r'}`}>
            {/* Шапка ячейки: Число дня (уменьшенный размер) */}
            <div className="p-0.5 md:p-1 flex justify-end">
                <span className={`text-[9px] md:text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                    isToday ? 'bg-purple-600 text-white shadow-md' : 'text-white/20'
                }`}>
                    {date.getDate()}
                </span>
            </div>

            {/* Список задач: Фиксированные 5 слотов */}
            <div className="flex flex-col px-0.5 gap-[1px]">
                {tasks.slice(0, 5).map(task => (
                    <div
                        key={task.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle?.(task);
                        }}
                        className={`group flex items-center h-[17px] px-1 rounded-md cursor-pointer transition-all ${
                            task.completed ? 'bg-emerald-500/5' : 'hover:bg-white/5'
                        }`}
                    >
                        {/* Компактный чекбокс */}
                        <div className={`flex-shrink-0 w-3 h-3 rounded-[3px] border border-white/20 flex items-center justify-center transition-colors mr-1.5 ${
                            task.completed 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'group-hover:border-purple-500/50'
                        }`}>
                            {task.completed && <Check size={8} className="text-[#08080a] stroke-[4px]" />}
                        </div>
                        
                        {/* Текст задачи */}
                        <span className={`text-[12px] leading-none truncate flex-1 tracking-tight ${
                            task.completed ? 'line-through text-white/20' : 'text-white/80'
                        }`}>
                            {task.title}
                        </span>
                    </div>
                ))}

                {/* Индикатор "Еще" */}
                {tasks.length > 5 && (
                    <div className="text-[8px] text-white/20 font-medium pl-1.5 pt-0.5 uppercase tracking-tighter">
                        +{tasks.length - 5} задач
                    </div>
                )}
            </div>
        </div>
    );
};