import React, { useState, useEffect } from 'react';
import { Layout, MoreHorizontal, Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskItem } from '../Task/TaskItem';

export const KanbanBoard = ({ tasks, onToggle, onDelete, onUpdate, onOpenCommand }) => {
    // 1. Локальное состояние для мгновенной реакции
    const [localTasks, setLocalTasks] = useState(tasks);

    // Синхронизируем локальный стейт с пропсами (когда приходят данные из Firebase)
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const columns = [
        { id: 'todo', title: 'К выполнению', color: 'bg-blue-500' },
        { id: 'in-progress', title: 'В работе', color: 'bg-purple-500' },
        { id: 'done', title: 'Готово', color: 'bg-emerald-500' }
    ];

    // Сортируем задачи по полю position
    const getTasksByStatus = (status) => {
        const filtered = localTasks.filter(t => {
            if (status === 'done') return t.completed === true;
            if (status === 'todo') return !t.completed && (t.status === 'todo' || !t.status);
            return !t.completed && t.status === status;
        });
        return filtered.sort((a, b) => (a.position || 0) - (b.position || 0));
    };

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        const isCompleted = newStatus === 'done';
        const isSameColumn = source.droppableId === destination.droppableId;

        // Получаем задачи целевой колонки
        let columnTasks = getTasksByStatus(newStatus);

        // ВАЖНО: Если перемещаем внутри одной колонки, 
        // удаляем перемещаемую задачу из списка для точного расчета позиций соседей
        if (isSameColumn) {
            columnTasks = columnTasks.filter(t => t.id !== draggableId);
        }

        let newPosition;

        if (columnTasks.length === 0) {
            newPosition = 1000;
        } else if (destination.index === 0) {
            // Ставим в самое начало
            newPosition = (columnTasks[0].position || 0) - 1000;
        } else if (destination.index >= columnTasks.length) {
            // Ставим в самый конец
            newPosition = (columnTasks[columnTasks.length - 1].position || 0) + 1000;
        } else {
            // Ставим между двумя задачами
            // Теперь индексы всегда верные, так как мы "подготовили" массив выше
            const prev = columnTasks[destination.index - 1].position || 0;
            const next = columnTasks[destination.index].position || 0;
            newPosition = (prev + next) / 2;
        }

        // Оптимистичное обновление
        const updatedLocalTasks = localTasks.map(t =>
            t.id === draggableId
                ? { ...t, status: newStatus, completed: isCompleted, position: newPosition }
                : t
        );
        setLocalTasks(updatedLocalTasks);

        // Отправка в БД
        onUpdate(draggableId, {
            completed: isCompleted,
            status: newStatus,
            position: newPosition
        });
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <main className="flex-1 flex flex-col gap-8 h-full overflow-hidden">
                <header className="flex justify-between items-center shrink-0 px-2 mt-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                            Канбан
                        </h1>
                    </div>
                    <button onClick={onOpenCommand} className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm hover:bg-white/10 transition-all active:scale-95 text-white/70">
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
                        <span>Новая задача</span>
                    </button>
                </header>

                <div className="flex-1 flex gap-6 w-full pb-6 custom-scrollbar px-2">
                    {columns.map(column => (
                        <div key={column.id} className="flex flex-col flex-1 max-w-[400px] gap-4">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                    <h3 className="font-semibold text-white/80 uppercase tracking-wider text-[10px]">{column.title}</h3>
                                    <span className="text-white/20 text-xs font-medium">{getTasksByStatus(column.id).length}</span>
                                </div>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        // Заменили gap-3 на padding у элементов, чтобы dnd корректно считал место
                                        className={`flex-1 rounded-[32px] p-3 transition-colors duration-300 flex flex-col ${snapshot.isDraggingOver ? 'bg-white/[0.06]' : 'bg-white/[0.02]'
                                            } border border-white/[0.05] overflow-y-auto custom-scrollbar min-h-[150px]`}
                                    >
                                        {getTasksByStatus(column.id).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            // Фикс прыжка: добавляем отступ снизу вместо gap у родителя
                                                            paddingBottom: '12px',
                                                        }}
                                                        className="outline-none"
                                                    >
                                                        <div className={`${snapshot.isDragging ? 'shadow-2xl scale-[1.02]' : ''} transition-transform`}>
                                                            <TaskItem
                                                                task={task}
                                                                onToggle={onToggle}
                                                                onDelete={onDelete}
                                                                onUpdate={onUpdate}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
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
        </DragDropContext>
    );
};