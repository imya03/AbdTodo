import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Circle, Edit2, Trash2, CheckCircle2, CalendarIcon, Tag, Check } from "lucide-react";
import React, { memo } from 'react';



const TaskItemComponent = forwardRef(({ task, onToggle, onDelete, onUpdate, tagColors }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDate, setEditDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : "");
  const [editTags, setEditTags] = useState(task.tags ? task.tags.join(', ') : "");


  const handleSave = () => {
    const tagsArray = editTags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag !== "");
    onUpdate(task.id, {
      title: editTitle,
      dueDate: editDate ? new Date(editDate).toISOString() : null,
      tags: tagsArray
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    >
      <GlassCard className={`p-3 group flex flex-col transition-all hover:bg-white/[0.07] ${isEditing ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 'hover:border-white/20'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(task)}
            className={`transition-colors flex-shrink-0 ${task.completed ? 'text-purple-500' : 'text-white/20 hover:text-white/40'}`}
          >
            {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>

          <div className="flex-1 cursor-pointer" onClick={() => !isEditing && setIsEditing(true)}>
            {isEditing ? (
              <input
                autoFocus
                className="w-full bg-transparent border-none outline-none text-white font-medium placeholder:text-white/20"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Название задачи"
              />
            ) : (
              <h3 className={`font-medium transition-all ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                {task.title}
              </h3>
            )}

            <div className="flex flex-wrap gap-2 mt-1">
              {task.tags?.map(tag => {
                // Получаем цвет конкретно для этого тега из словаря tagColors
                // Если цвета нет, используем дефолтный (например, фиолетовый)
                const currentTagColor = tagColors[tag] || '#a855f7';

                return (
                  <span
                    key={tag}
                    style={{ borderColor: currentTagColor }}
                    className="border-b-2 opacity-70 text-[10px] px-1 py-0.5 text-white/90"
                  >
                    #{tag}
                  </span>
                );
              })}

              {task.dueDate && (
                <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CalendarIcon size={10} />
                  {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-purple-400 transition-all"
              >
                <Edit2 size={16} />
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
                      <CalendarIcon size={12} /> Дедлайн
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
                      <Tag size={12} /> Теги (через запятую)
                    </label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50 transition-colors placeholder:text-white/10"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="дом, работа, срочно"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                  >
                    <Check size={14} /> Сохранить
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
});


export const TaskItem = memo(TaskItemComponent);