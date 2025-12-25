import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'User';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // 🔥 ВОТ ЗДЕСЬ БЫЛА ОШИБКА
      // token сохранялся ТОЛЬКО в zustand, но НЕ туда, откуда его читает Apollo
      setAuth: (user, token) => {
        localStorage.setItem('token', token); // ✅ КЛЮЧЕВАЯ СТРОКА
        set({ user, token });
      },

      clearAuth: () => {
        localStorage.removeItem('token'); // ✅ симметрично
        set({ user: null, token: null });
      },

      isAuthenticated: () => get().user !== null,
      isAdmin: () => get().user?.role === 'Admin',
    }),
    {
      name: 'auth-storage',
    }
  )
);
