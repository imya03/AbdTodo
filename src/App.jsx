import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar as CalendarIcon, 
  Layout, 
  Settings, 
  Command,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Check,
  Tag
} from 'lucide-react';

import { auth, db, appId } from './firebase';

import { StatsWidget } from './components/ui/StatsWidget';
import { GlassCard } from './components/ui/GlassCard';
import { MiniCalendar } from './components/calendar/MiniCalendar';
import { TaskItem } from './components/Task/TaskItem';



// --- Вспомогательные функции ---
// NLP Парсер для задач
const parseTask = (text) => {
  const tags = text.match(/#\w+/g)?.map(t => t.slice(1)) || [];
  let dueDate = null;
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('завтра')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate = tomorrow.toISOString();
  } else if (lowerText.includes('сегодня')) {
    dueDate = new Date().toISOString();
  }

  return { 
    cleanTitle: text.replace(/#\w+/g, '').replace(/завтра|сегодня/gi, '').trim(),
    tags,
    dueDate
  };
};

// --- Компоненты UI ---

// const GlassCard = ({ children, className = "" }) => (
//   <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl ${className}`}>
//     {children}
//   </div>
// );

// Компактный виджет статистики
// const StatsWidget = ({ tasks }) => {
//   const completed = tasks.filter(t => t.completed).length;
//   const total = tasks.length;
//   const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

//   return (
//     <GlassCard className="p-4 flex items-center gap-4">
//       <div className="relative w-12 h-12 flex items-center justify-center">
//         <svg className="w-full h-full transform -rotate-90">
//           <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
//           <motion.circle 
//             cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
//             strokeDasharray={125.6}
//             initial={{ strokeDashoffset: 125.6 }}
//             animate={{ strokeDashoffset: 125.6 - (125.6 * percentage) / 100 }}
//             className="text-purple-500" 
//           />
//         </svg>
//         <span className="absolute text-[10px] font-bold text-white">{percentage}%</span>
//       </div>
//       <div>
//         <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Прогресс</p>
//         <p className="text-white text-sm font-semibold">{completed} из {total} сделано</p>
//       </div>
//     </GlassCard>
//   );
// };

// Мини-календарь
// const MiniCalendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
//   const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
//   const adjustedStart = startDay === 0 ? 6 : startDay - 1;
//   const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
//   const calendarDays = Array.from({ length: 42 }, (_, i) => {
//     const day = i - adjustedStart + 1;
//     return day > 0 && day <= daysInMonth ? day : null;
//   });

//   const monthName = currentDate.toLocaleString('ru-RU', { month: 'long' });

//   return (
//     <GlassCard className="p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-white font-medium capitalize text-sm">{monthName}</h3>
//         <div className="flex gap-2">
//           <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="text-white/40 hover:text-white transition-colors">
//             <ChevronLeft size={16} />
//           </button>
//           <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="text-white/40 hover:text-white transition-colors">
//             <ChevronRight size={16} />
//           </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-7 gap-1 text-center">
//         {days.map(d => <div key={d} className="text-[10px] text-white/30 font-bold uppercase">{d}</div>)}
//         {calendarDays.map((day, i) => {
//           const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
//           return (
//             <div key={i} className={`text-[10px] py-1 rounded-lg ${day ? 'text-white/80' : 'text-transparent'} ${isToday ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : ''}`}>
//               {day}
//             </div>
//           );
//         })}
//       </div>
//     </GlassCard>
//   );
// };

// --- Компонент редактируемой задачи ---
// Используем forwardRef, чтобы Framer Motion мог корректно анимировать компонент внутри AnimatePresence
// const TaskItem = forwardRef(({ task, onToggle, onDelete, onUpdate }, ref) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editTitle, setEditTitle] = useState(task.title);
//   const [editDate, setEditDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : "");
//   const [editTags, setEditTags] = useState(task.tags ? task.tags.join(', ') : "");

//   const handleSave = () => {
//     const tagsArray = editTags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag !== "");
//     onUpdate(task.id, {
//       title: editTitle,
//       dueDate: editDate ? new Date(editDate).toISOString() : null,
//       tags: tagsArray
//     });
//     setIsEditing(false);
//   };

//   return (
//     <motion.div
//       ref={ref}
//       layout
//       initial={{ opacity: 0, y: 20, scale: 0.95 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
//     >
//       <GlassCard className={`p-4 group flex flex-col transition-all hover:bg-white/[0.07] ${isEditing ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 'hover:border-white/20'}`}>
//         <div className="flex items-center gap-4">
//           <button 
//             onClick={() => onToggle(task)}
//             className={`transition-colors flex-shrink-0 ${task.completed ? 'text-purple-500' : 'text-white/20 hover:text-white/40'}`}
//           >
//             {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
//           </button>
          
//           <div className="flex-1 cursor-pointer" onClick={() => !isEditing && setIsEditing(true)}>
//             {isEditing ? (
//               <input 
//                 autoFocus
//                 className="w-full bg-transparent border-none outline-none text-white font-medium placeholder:text-white/20"
//                 value={editTitle}
//                 onChange={(e) => setEditTitle(e.target.value)}
//                 placeholder="Название задачи"
//               />
//             ) : (
//               <h3 className={`font-medium transition-all ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
//                 {task.title}
//               </h3>
//             )}
            
//             <div className="flex flex-wrap gap-2 mt-1">
//               {task.tags?.map(tag => (
//                 <span key={tag} className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
//                   #{tag}
//                 </span>
//               ))}
//               {task.dueDate && (
//                 <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full flex items-center gap-1">
//                   <CalendarIcon size={10} />
//                   {new Date(task.dueDate).toLocaleDateString('ru-RU')}
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             {!isEditing && (
//                <button 
//                 onClick={() => setIsEditing(true)}
//                 className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-purple-400 transition-all"
//               >
//                 <Edit2 size={16} />
//               </button>
//             )}
//             <button 
//               onClick={() => onDelete(task.id)}
//               className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
//             >
//               <Trash2 size={18} />
//             </button>
//           </div>
//         </div>

//         <AnimatePresence>
//           {isEditing && (
//             <motion.div 
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: 'auto', opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="overflow-hidden"
//             >
//               <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
//                       <CalendarIcon size={12} /> Дедлайн
//                     </label>
//                     <input 
//                       type="date"
//                       className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
//                       value={editDate}
//                       onChange={(e) => setEditDate(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
//                       <Tag size={12} /> Теги (через запятую)
//                     </label>
//                     <input 
//                       className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50 transition-colors placeholder:text-white/10"
//                       value={editTags}
//                       onChange={(e) => setEditTags(e.target.value)}
//                       placeholder="дом, работа, срочно"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2 pt-2">
//                   <button 
//                     onClick={() => setIsEditing(false)}
//                     className="px-4 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
//                   >
//                     Отмена
//                   </button>
//                   <button 
//                     onClick={handleSave}
//                     className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
//                   >
//                     <Check size={14} /> Сохранить
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </GlassCard>
//     </motion.div>
//   );
// });

// Назначаем имя для отладки
TaskItem.displayName = 'TaskItem';

// --- Основной компонент приложения ---

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState("");

  // Инициализация Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Слушатели Firestore
  useEffect(() => {
    if (!user) return;

    // Задачи (Публичные в рамках демо-артефакта)
    const tasksQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Tasks error:", err));

    return () => {
      unsubscribeTasks();
    };
  }, [user]);

  // Управление задачами
  const addTask = async (e) => {
    e?.preventDefault();
    if (!newTaskInput.trim() || !user) return;

    const { cleanTitle, tags, dueDate } = parseTask(newTaskInput);
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
      title: cleanTitle,
      completed: false,
      tags,
      dueDate,
      userId: user.uid,
      createdAt: serverTimestamp()
    });

    setNewTaskInput("");
    setIsCommandBarOpen(false);
  };

  const toggleTask = async (task) => {
    const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id);
    await updateDoc(taskRef, { completed: !task.completed });
  };

  const deleteTask = async (id) => {
    const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', id);
    await deleteDoc(taskRef);
  };

  const updateTask = async (id, data) => {
    const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', id);
    await updateDoc(taskRef, data);
  };

  // Shortcut ⌘K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      {/* Фоновые свечения */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Основной интерфейс */}
      <div className="flex h-screen p-6 gap-6 relative z-10">
        
        {/* Боковая панель навигации */}
        <aside className="w-20 flex flex-col gap-8 items-center py-8">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Command size={24} />
          </div>
          <nav className="flex flex-col gap-6">
            {[Layout, Search, CalendarIcon, Settings].map((Icon, i) => (
              <button key={i} className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                <Icon size={24} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Контент */}
        <main className="flex-1 flex flex-col gap-6">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                AbdTodo
              </h1>
              <p className="text-white/40 font-medium">Коллаборативный таск-менеджер</p>
            </div>
            <button 
              onClick={() => setIsCommandBarOpen(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium hover:bg-white/10 transition-all active:scale-95"
            >
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
              <span>Быстрое действие</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onUpdate={updateTask}
                />
              ))}
            </AnimatePresence>
            
            {tasks.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-white/20">
                <Layout size={48} strokeWidth={1} className="mb-4" />
                <p>Список задач пуст</p>
              </div>
            )}
          </div>
        </main>

        {/* Правая панель виджетов */}
        <aside className="w-72 flex flex-col gap-6">
          <StatsWidget tasks={tasks} />
          <MiniCalendar />
          
          <GlassCard className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4 flex items-center justify-center text-2xl font-bold shadow-xl shadow-purple-500/20 text-white">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-semibold text-white/90">Синхронизация</h4>
            <p className="text-sm text-white/40 mt-1">Все ваши задачи сохраняются в облаке и доступны на всех устройствах</p>
          </GlassCard>
        </aside>
      </div>

      {/* Command Bar (Spotlight) */}
      <AnimatePresence>
        {isCommandBarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCommandBarOpen(false)}
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
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
              </div>
              <div className="p-2 bg-white/[0.02]">
                <div className="p-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Подсказки
                </div>
                <div className="grid grid-cols-2 gap-1 p-1">
                  <div className="p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer">
                    <span className="text-purple-500 font-mono text-xs">#тег</span>
                    <span className="text-xs text-white/60">Автоматическая категоризация</span>
                  </div>
                  <div className="p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer">
                    <span className="text-purple-500 font-mono text-xs">завтра</span>
                    <span className="text-xs text-white/60">Установка даты дедлайна</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}