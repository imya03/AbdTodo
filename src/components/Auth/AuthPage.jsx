import React, { useState } from 'react';
import { auth } from '../../firebase'; // Путь к твоему конфигу firebase
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { GlassCard } from '../ui/GlassCard';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080a]">
      <GlassCard className="w-full max-w-md p-8 flex flex-col gap-6 border border-white/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'С возвращением' : 'Создать аккаунт'}
          </h1>
          <p className="text-white/40 text-sm">Управляйте своими задачами эффективно</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="text-red-400 text-xs px-2">{error}</p>}

          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          {isLogin ? 'Еще нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </button>
      </GlassCard>
    </div>
  );
};