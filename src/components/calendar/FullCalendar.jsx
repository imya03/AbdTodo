import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GlassCard } from '../ui/GlassCard';
import { createPortal } from 'react-dom';


export const FullCalendar = ({ tasks = [], tagColors, onToggle, onUpdateTaskDate, onDragEnd }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
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

    const rowCount = monthData.length / 7;





    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col h-full space-y-4">
                <header className="flex items-center justify-between px-4 md:px-2">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold capitalize">
                            {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
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

                    <div className="flex-1 grid grid-cols-7 auto-rows-fr" style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}>
                        {monthData.map((date, index) => {
                            const dateId = date ? date.toDateString() : `empty-${index}`;
                            const dayTasks = tasks.filter(t => date && new Date(t.dueDate).toDateString() === date.toDateString());

                            return (
                                <CalendarCell
                                    key={dateId}
                                    id={dateId}
                                    date={date}
                                    tasks={dayTasks}
                                    onToggle={onToggle}
                                    isLastColumn={(index + 1) % 7 === 0}
                                    isToday={date?.toDateString() === new Date().toDateString()}
                                    tagColors={tagColors}
                                />
                            );
                        })}
                    </div>
                </GlassCard>
            </div>
        </DragDropContext>
    );
};

// Внутри компонента FullCalendar или вынести отдельно
const DraggablePortal = ({ children }) => {
    return createPortal(children, document.body);
};



const CalendarCell = ({ id, date, tasks, onToggle, isLastColumn, isToday, tagColors }) => {
    if (!date) return <div className={`border-b border-white/5 bg-black/10 ${isLastColumn ? '' : 'border-r'}`} />;

    // Находим цвет для задачи: берем первый попавшийся тег, у которого настроен цвет
    const getTaskColor = (task) => {
        if (!task.tags || task.tags.length === 0) return '#a855f7'; // Цвет по умолчанию
        const firstTagWithColor = task.tags.find(tag => tagColors[tag]);
        return tagColors[firstTagWithColor] || '#a855f7';
    };


    return (
        <Droppable droppableId={id}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`border-b border-white/5 flex flex-col min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.05]' : ''
                        } ${isLastColumn ? '' : 'border-r'}`}
                >
                    <div className="p-1 flex justify-end">
                        <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-purple-600 text-white shadow-md' : 'text-white/20'
                            }`}>
                            {date.getDate()}
                        </span>
                    </div>

                    <div className="flex flex-col px-0.5 flex-1">
                        {tasks.slice(0, 5).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                {(provided, snapshot) => {
                                    const content = (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}

                                            style={{
                                                ...provided.draggableProps.style,
                                                // Если перетаскиваем, фиксируем указатель
                                                marginBottom: '1px',
                                                cursor: snapshot.isDragging ? 'grabbing' : 'pointer'
                                            }}
                                            className={`group flex items-center h-[18px] px-1 rounded-sm transition-all ${snapshot.isDragging ? 'z-[9999] shadow-2xl bg-[#1a1a1a] border border-white/10' : ''
                                                } ${task.completed ? 'opacity-40' : 'hover:bg-white/5'}`}
                                        >
                                            {/* Цветная полоска (индикатор тега) */}
                                            <div
                                                className="w-[3px] h-3 rounded-full mr-1 flex-shrink-0"
                                                style={{ backgroundColor: getTaskColor(task) }}
                                            />

                                            {/* Чекбокс (скрыт на мобилках) */}
                                            <div
                                                onClick={() => onToggle?.(task)}
                                                className={`hidden sm:flex flex-shrink-0 w-3 h-3 rounded-[3px] border border-white/20 items-center justify-center mr-1 transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'group-hover:border-white/40'
                                                    }`}>
                                                {task.completed && <Check size={8} className="text-[#08080a] stroke-[4px]" />}
                                            </div>

                                            <span className={`text-[12px] leading-none whitespace-nowrap overflow-hidden flex-1 ${task.completed ? 'line-through text-white/20' : 'text-white/80'
                                                }`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    );
                                    // Если задача перетаскивается, рендерим её через Портал
                                    if (snapshot.isDragging) {
                                        return <DraggablePortal>{content}</DraggablePortal>;
                                    }
                                    return content;
                                }}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        {tasks.length > 5 && (
                            <div className="text-[8px] text-white/20 font-medium pl-1.5">+ {tasks.length - 5}</div>
                        )}
                    </div>
                </div>
            )}
        </Droppable>
    );
};