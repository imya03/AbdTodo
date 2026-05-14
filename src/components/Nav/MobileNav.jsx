import React from 'react';
import { ListTodo, CalendarDays, LayoutDashboard, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const MobileNav = ({ activeTab, setActiveTab, onOpenCommand }) => {
  const navItems = [
    { id: 'list', icon: ListTodo, label: 'Список' },
    { id: 'calendar', icon: CalendarDays, label: 'Календарь' },
    { id: 'kanban', icon: LayoutDashboard, label: 'Канбан' },
    { id: 'settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <div className="md:hidden fixed bottom-8 left-0 right-0 px-6 flex items-center gap-3 z-50">
      {/* Основная панель навигации */}
      <nav className="flex-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-2 flex items-center justify-between shadow-2xl shadow-black/20">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-white text-black shadow-lg' : 'text-white/40'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Текст теперь виден всегда, меняется только прозрачность и вес */}
              <span className={`text-[8px] font-bold uppercase tracking-tight transition-colors duration-300 ${
                isActive ? 'text-black' : 'text-white/40'
              }`}>
                {item.label}
              </span>

              {/* Эффект свечения для активной вкладки */}
              {isActive && (
                <motion.div 
                  layoutId="activePill"
                  className="absolute inset-0 bg-white rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Плавающая кнопка (Floating Action Button) */}
      <button
        onClick={onOpenCommand}
        className="w-14 h-14 bg-gradient-to-tr from-red-500 to-rose-400 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(244,63,94,0.4)] active:scale-90 transition-transform border border-white/20"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
};