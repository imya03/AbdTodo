import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export const CommandBar = ({ isOpen, onClose, value, onChange, onAdd }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121215] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Plus className="text-purple-500" size={24} />
              <input
                autoFocus
                placeholder="Добавить задачу... (например: Купить продукты #дом завтра)"
                className="bg-transparent border-none outline-none flex-1 text-lg text-white placeholder:text-white/20"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAdd()}
              />
            </div>
            <div className="p-2 bg-white/[0.02]">
              <div className="p-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Подсказки
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                <Hint label="#тег" description="Автоматическая категоризация" />
                <Hint label="завтра" description="Установка даты дедлайна" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Маленький внутренний компонент для чистоты
const Hint = ({ label, description }) => (
  <div className="p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer">
    <span className="text-purple-500 font-mono text-xs">{label}</span>
    <span className="text-xs text-white/60">{description}</span>
  </div>
);