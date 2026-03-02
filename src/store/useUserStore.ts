import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = 'http://localhost:3001/api';

export interface Assignment {
  memberName: string;
  memberId: string;
  hizbNumber: number;
  totalAyahs: number;
  readAyahs: number;
  status: 'pending' | 'completed';
  lastReadAyah?: number;
  lastReadSurah?: number;
  lastReadSurahName?: string;
  lastReadPage?: number;
}

export interface KhatmahCircle {
  id: string;
  name: string;
  code: string;
  leaderId: string;
  khatmatCount: number;
  members: { id: string; name: string; progress: number }[];
  assignments: Assignment[];
}

interface UserState {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  language: 'ar' | 'en' | 'es';
  theme: 'light' | 'dark';
  activeHizb: { circleId: string, hizbNum: number } | null; // Track circle + hizb
  circles: KhatmahCircle[];
  signup: (name: string, email: string, password: string) => Promise<{success: boolean, message?: string}>;
  login: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  createCircle: (name: string) => Promise<void>;
  joinCircle: (code: string) => Promise<{success: boolean, message?: string}>;
  assignHizb: (circleId: string, memberId: string, memberName: string, hizbNum: number) => Promise<void>;
  updateHizbProgress: (circleId: string, hizbNum: number, readAyahs: number, totalAyahs: number, lastRead?: { ayah: number, surah: number, name: string, page: number }) => void;
  setActiveHizb: (data: { circleId: string, hizbNum: number } | null) => void;
  setLanguage: (lang: 'ar' | 'en' | 'es') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLastRead: (surah: number, ayah: number, name: string, page: number) => void;
  lastReadAyah: { surah: number; ayah: number; name: string; page: number } | null;
  personalProgress: number;
  updatePersonalProgress: (progress: number) => Promise<void>;
  fetchUserData: () => Promise<void>;
  leaveCircle: (circleId: string, newLeaderId?: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      language: 'ar',
      theme: 'light',
      activeHizb: null,
      circles: [],
      lastReadAyah: null,
      personalProgress: 0,

      signup: async (name, email, password) => {
        try {
          const response = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const data = await response.json();
          if (response.ok) {
            // Remove automatic login
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (e) { return { success: false, message: 'Server error' }; }
      },

      login: async (email, password) => {
        try {
          const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          if (response.ok) {
            set({ user: data, isAuthenticated: true, personalProgress: data.personalProgress || 0 });
            await get().fetchUserData();
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (e) { return { success: false, message: 'Server error' }; }
      },

      fetchUserData: async () => {
        const user = get().user;
        if (!user) return;
        try {
          const response = await fetch(`${API_BASE}/user-data/${user.id}`);
          const data = await response.json();
          if (data.circles) set({ circles: data.circles });
          if (data.lastRead) set({ lastReadAyah: data.lastRead });
          if (data.personalProgress !== undefined) set({ personalProgress: data.personalProgress });
        } catch (e) { console.error(e); }
      },

      logout: () => set({ user: null, isAuthenticated: false, circles: [], activeHizb: null, lastReadAyah: null, personalProgress: 0 }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setActiveHizb: (activeHizb) => set({ activeHizb }),

      updatePersonalProgress: async (progress) => {
        const user = get().user;
        set({ personalProgress: progress });
        if (user) {
          try {
            await fetch(`${API_BASE}/personal-progress`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, progress })
            });
          } catch (e) { console.error(e); }
        }
      },

      createCircle: async (name) => {
        const user = get().user;
        if (!user) return;
        try {
          await fetch(`${API_BASE}/circles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, leaderId: user.id })
          });
          await get().fetchUserData();
        } catch (e) { console.error(e); }
      },

      joinCircle: async (code) => {
        const user = get().user;
        if (!user) return { success: false, message: 'Login first' };
        try {
          const response = await fetch(`${API_BASE}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code.trim().toUpperCase(), userId: user.id })
          });
          if (response.ok) {
            await get().fetchUserData();
            return { success: true };
          }
          const data = await response.json();
          return { success: false, message: data.message };
        } catch (e) { return { success: false, message: 'Server error' }; }
      },

      assignHizb: async (circleId, memberId, memberName, hizbNum) => {
        try {
          await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ circleId, userId: memberId, hizbNum, readAyahs: 0 })
          });
          await get().fetchUserData();
        } catch (e) { console.error(e); }
      },

      leaveCircle: async (circleId, newLeaderId) => {
        const user = get().user;
        if (!user) return;
        try {
          await fetch(`${API_BASE}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ circleId, userId: user.id, newLeaderId })
          });
          await get().fetchUserData();
        } catch (e) { console.error(e); }
      },

      updateHizbProgress: async (circleId, hizbNum, readAyahs, totalAyahs, lastRead) => {
        const user = get().user;
        if (!user) return;

        set((state) => ({
          circles: state.circles.map(c => 
            c.id === circleId ? {
              ...c,
              assignments: c.assignments.map(a => 
                (a.hizbNumber === hizbNum && a.memberId === user.id) ? { 
                  ...a, readAyahs, totalAyahs, status: readAyahs >= totalAyahs ? 'completed' : 'pending',
                  lastReadAyah: lastRead?.ayah, lastReadSurah: lastRead?.surah,
                  lastReadSurahName: lastRead?.name, lastReadPage: lastRead?.page
                } : a
              )
            } : c
          )
        }));

        try {
          await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ circleId, userId: user.id, hizbNum, readAyahs, totalAyahs, lastRead })
          });
          await get().fetchUserData();
        } catch (e) { console.error(e); }
      },

      setLastRead: async (surah, ayah, name, page) => {
        const user = get().user;
        set({ lastReadAyah: { surah, ayah, name, page } });
        if (user) {
          try {
            await fetch(`${API_BASE}/personal-last-read`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, surah, ayah, name, page })
            });
          } catch (e) { console.error(e); }
        }
      },
    }),
    { name: 'ramadan-soul-mysql-v4' }
  )
);
