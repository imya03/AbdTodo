import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, CheckCircle2, Circle, Trash2, Calendar as CalendarIcon, Layout, Settings, Command, ChevronLeft, ChevronRight, Edit2, X, Check, Tag } from 'lucide-react';

import { auth, db, appId } from './firebase';

import { StatsWidget } from './components/ui/StatsWidget';
import { GlassCard } from './components/ui/GlassCard';
import { MiniCalendar } from './components/calendar/MiniCalendar';
import { TaskItem } from './components/Task/TaskItem';
import { TaskList } from './components/Task/TaskList';
import { RightSidebar } from './components/layout/RightSidebar';
import { CommandBar } from './components/CommandBar/CommandBar';
import { FullCalendar } from './components/calendar/FullCalendar';


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


// Назначаем имя для отладки
TaskItem.displayName = 'TaskItem';

// --- Основной компонент приложения ---

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'search', 'calendar', 'settings'

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
      <BackgroundGlow />

      {/* Основной интерфейс */}
      <div className="flex h-screen px-0 py-4 md:p-6 gap-0 md:gap-6 relative z-10 w-full">

        {/* Боковая панель навигации */}
        <aside className="hidden sm:flex w-20 flex-col gap-8 items-center py-8">
          <div
            onClick={() => setActiveTab('tasks')} // Клик по лого возвращает к задачам
            className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 cursor-pointer active:scale-95 transition-transform"
          >
            <Command size={24} />
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { id: 'tasks', icon: Layout },
              { id: 'search', icon: Search },
              { id: 'calendar', icon: CalendarIcon },
              { id: 'settings', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-3 rounded-2xl transition-all ${activeTab === item.id
                  ? 'text-white bg-white/10 shadow-inner'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={24} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Контент */}
        <main className="flex-1 flex flex-col gap-6 w-full overflow-hidden">
          {activeTab === 'tasks' && (
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
              onOpenCommand={() => setIsCommandBarOpen(true)}
            />
          )}

          {activeTab === 'calendar' && (
            <FullCalendar tasks={tasks} />
          )}

          {/* Здесь можно добавить заглушки для других вкладок */}
          {activeTab === 'search' && <div className="text-white/20">Поиск (в разработке)</div>}
        </main>
        <div className="hidden xl:flex w-72 flex-col">
          <RightSidebar tasks={tasks} />
        </div>
      </div>



      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        value={newTaskInput}
        onChange={setNewTaskInput}
        onAdd={addTask}
      />


      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#121215]/80 backdrop-blur-lg border-t border-white/10 flex justify-around p-4 z-50">
        <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? 'text-purple-500' : 'text-white/40'}>
          <Layout size={24} />
        </button>
        <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-purple-500' : 'text-white/40'}>
          <CalendarIcon size={24} />
        </button>
        <button onClick={() => setIsCommandBarOpen(true)} className="text-white/40">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}

const BackgroundGlow = () => (
  <>
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
  </>
);