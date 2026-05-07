import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, appId } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInAnonymously, signInWithCustomToken, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where
} from 'firebase/firestore';

// Импорты компонентов
import {
  Layout,
  Search,
  Calendar as CalendarIcon,
  Settings,
  Command,
  Plus,
  KanbanSquare,
  LogOut
} from 'lucide-react';
import { TaskList } from './components/Task/TaskList';
import { RightSidebar } from './components/layout/RightSidebar';
import { CommandBar } from './components/CommandBar/CommandBar';
import { FullCalendar } from './components/calendar/FullCalendar';
import { AuthPage } from './components/Auth/AuthPage'; // Убедитесь, что путь верный
import { SettingsPage } from './components/Settings/SettingsPage';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';

// --- Главный компонент App ---
export default function App() {
  const [user, loading] = useAuthState(auth);

  // Инициализация Auth (вызывается всегда)
  useEffect(() => {
    const initAuth = async () => {
      // Примечание: Мы убрали автоматический signInAnonymously, 
      // чтобы пользователь мог войти через AuthPage.
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      }
    };
    initAuth();
  }, []);

  // Если идет загрузка состояния Auth
  if (loading) {
    return (
      <div className="bg-[#08080a] h-screen flex items-center justify-center">
        <div className="text-white/20 animate-pulse font-medium tracking-widest uppercase text-xs">
          Загрузка системы...
        </div>
      </div>
    );
  }

  // Если пользователя нет — показываем страницу авторизации
  if (!user) {
    return <AuthPage />;
  }

  // Если авторизован — показываем Dashboard
  return <Dashboard user={user} />;
}

// --- Компонент Dashboard (Основной интерфейс) ---
function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [activeTab, setActiveTab] = useState('tasks');

  // Слушатель Firestore с фильтрацией по userId
  useEffect(() => {
    if (!user) return;

    // Запрашиваем только задачи текущего пользователя
    const tasksQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Firestore error:", err);
      // Если в консоли ошибка об отсутствии индекса, перейдите по ссылке в ошибке
    });

    return () => unsubscribe();
  }, [user]);

  // Управление задачами
  const addTask = async (e) => {
    e?.preventDefault();
    if (!newTaskInput.trim()) return;

    const { cleanTitle, tags, dueDate } = parseTask(newTaskInput);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
        title: cleanTitle,
        completed: false,
        tags,
        dueDate,
        userId: user.uid, // Привязка к пользователю
        position: 0,
        createdAt: serverTimestamp()
      });
      setNewTaskInput("");
      setIsCommandBarOpen(false);
    } catch (err) {
      console.error("Add task error:", err);
    }
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

  // Drag & Drop в календаре
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newDateStr = destination.droppableId;

    // Оптимистичное обновление UI
    setTasks(prev => prev.map(t =>
      t.id === draggableId ? { ...t, dueDate: new Date(newDateStr).toISOString() } : t
    ));

    await updateTask(draggableId, {
      dueDate: new Date(newDateStr).toISOString()
    });
  };

  // Hotkeys ⌘K
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




  const [tagColors, setTagColors] = useState({});

  // Загрузка цветов тегов из БД
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', user.uid);

    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setTagColors(docSnap.data().tagColors || {});
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Функция сохранения цвета для тега
  const updateTagColor = async (tagName, color) => {
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', user.uid);
    await setDoc(settingsRef, {
      tagColors: {
        ...tagColors,
        [tagName]: color
      }
    }, { merge: true });
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-[#08080a] text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      <BackgroundGlow />

      <div className="flex h-screen px-0 py-4 md:p-3 gap-0 md:gap-3 relative z-10 w-full">
        {/* Боковая панель */}
        <aside className="hidden sm:flex w-20 flex-col gap-8 items-center py-8">
          <div
            onClick={() => setActiveTab('tasks')}
            className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 cursor-pointer transition-transform active:scale-95"
          >
            <Command size={24} />
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { id: 'tasks', icon: KanbanSquare },
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

          <button
            onClick={handleLogout}
            className="mt-auto p-3 text-white/20 hover:text-red-400 transition-colors"
            title="Выйти"
          >
            <LogOut size={24} />
          </button>
        </aside>

        {/* Контент */}
        <main className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {activeTab === 'tasks' && (
            <KanbanBoard
              tasks={tasks}
              onToggle={toggleTask} // Когда кликаем чекбокс — улетает в Done
              onDelete={deleteTask}
              onUpdate={updateTask} // Через это можно менять поле status: 'in-progress' и т.д.
              onOpenCommand={() => setIsCommandBarOpen(true)}
            />
          )}
          {activeTab === 'calendar' && (
            <FullCalendar
              tasks={tasks}
              tagColors={tagColors} // Передаем объект с цветами
              onUpdateTaskDate={updateTask}
              onDragEnd={onDragEnd}
              onToggle={toggleTask}
            />
          )}
          {activeTab === 'search' && <div className="text-white/20 p-8">Поиск (в разработке)</div>}


          {activeTab === 'settings' && (
            <SettingsPage
              tasks={tasks}
              tagColors={tagColors}
              onUpdateTagColor={updateTagColor}
            />
          )}
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

      {/* Мобильная навигация */}
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
        <button onClick={handleLogout} className="text-white/20">
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
}

// --- Вспомогательные функции и компоненты ---

const BackgroundGlow = () => (
  <>
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
  </>
);

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