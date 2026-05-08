import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskItem } from '../Task/TaskItem';

const COLUMNS = [
    { id: 'todo', title: 'К выполнению', color: 'bg-blue-500' },
    { id: 'in-progress', title: 'В работе', color: 'bg-purple-500' },
    { id: 'done', title: 'Готово', color: 'bg-emerald-500' }
];

export const KanbanBoard = ({ tasks = [], onToggle, onDelete, onUpdate, onOpenCommand, tagColors }) => {
    
    // 1. Стабилизируем данные. Группируем задачи один раз при изменении tasks.
    const groupedTasks = useMemo(() => {
        const groups = { todo: [], 'in-progress': [], done: [] };
        
        tasks.forEach(t => {
            let status = 'todo';
            if (t.completed) status = 'done';
            else if (t.status === 'in-progress') status = 'in-progress';
            groups[status].push(t);
        });

        // Важно: сортируем по позиции, чтобы dnd всегда видел один и тот же порядок
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => (a.position || 0) - (b.position || 0));
        });

        return groups;
    }, [tasks]);

    return (
        <main className="flex-1 flex flex-col gap-8 h-full overflow-hidden">
            <header className="flex justify-between items-center shrink-0 px-2 mt-4">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                    Канбан
                </h1>
                <button onClick={onOpenCommand} className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm hover:bg-white/10 transition-all text-white/70">
                    <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
                    <span>Новая задача</span>
                </button>
            </header>

            <div className="flex-1 flex gap-6 justify-center w-full pb-6 custom-scrollbar px-2 overflow-hidden">
                {COLUMNS.map(column => (
                    <div key={column.id} className="flex flex-col flex-1 min-w-[320px] max-w-[400px] gap-4">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                <h3 className="font-semibold text-white/80 uppercase tracking-wider text-[10px]">{column.title}</h3>
                                <span className="text-white/20 text-xs font-medium">{groupedTasks[column.id].length}</span>
                            </div>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 rounded-[32px] p-3 transition-colors duration-300 flex flex-col border border-white/[0.05] overflow-y-auto custom-scrollbar min-h-[150px] ${
                                        snapshot.isDraggingOver ? 'bg-white/[0.06]' : 'bg-white/[0.02]'
                                    }`}
                                >
                                    {groupedTasks[column.id].map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(dragProvided, dragSnapshot) => {
                                                const isOverCalendar = dragSnapshot.draggingOver?.startsWith('calendar-');
                                                
                                                // 2. Объединяем все стили в ОДИН элемент
                                                const finalStyle = {
                                                    ...dragProvided.draggableProps.style,
                                                    transformOrigin: 'center center',
                                                    transition: dragSnapshot.isDragging ? 'transform 0.05s, opacity 0.2s' : 'none',
                                                    zIndex: dragSnapshot.isDragging ? 9999 : 1,
                                                    marginBottom: "12px", // Используем margin вместо paddingBottom для чистоты dnd
                                                    ...(isOverCalendar && {
                                                        transform: `${dragProvided.draggableProps.style.transform} scale(0.5)`,
                                                    })
                                                };

                                                return (
                                                    <div
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        {...dragProvided.dragHandleProps}
                                                        style={finalStyle}
                                                        // 3. Эффекты прозрачности вешаем прямо на контейнер Draggable
                                                        className={isOverCalendar ? 'opacity-60' : 'opacity-100'}
                                                    >
                                                        <TaskItem
                                                            task={task}
                                                            onToggle={onToggle}
                                                            onDelete={onDelete}
                                                            onUpdate={onUpdate}
                                                            tagColors={tagColors}
                                                        />
                                                    </div>
                                                );
                                            }}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {column.id === 'todo' && (
                                        <button
                                            onClick={onOpenCommand}
                                            className="mt-1 w-full py-4 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/20 hover:text-white/40 transition-all hover:bg-white/[0.02]"
                                        >
                                            <Plus size={18} />
                                            <span className="text-sm font-medium">Добавить</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </main>
    );
};