import React, { useState, useEffect } from 'react';
import { Book, BookOpen, Compass, Calendar, Settings, Bell, Sun, Moon, Clock, Heart, Sparkles, User, Info, BrainCircuit, ShieldCheck, CreditCard, MapPin, LogOut, ArrowRight, Mail, Languages, Check, Lock, Eye, EyeOff, Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuranList } from './features/quran/QuranList';
import { QuranReader } from './features/quran/QuranReader';
import { KhatmahTracker } from './features/khatmah/KhatmahTracker';
import { QiblaCompass } from './features/prayer-times/QiblaCompass';
import { MosqueFinder } from './features/prayer-times/MosqueFinder';
import { DuaLibrary } from './features/duas/DuaLibrary';
import { TasbihCounter } from './features/prayer-times/TasbihCounter';
import { DailyChallenges } from './features/challenges/DailyChallenges';
import { KhatmahSocialManager } from './features/social/KhatmahSocialManager';
import { AiReflection } from './features/quran/AiReflection';
import { Surah } from './features/quran/quranService';
import { useUserStore } from './store/useUserStore';
import { useLocation, usePrayerTimes } from './hooks/usePrayerTimes';
import { useTranslations } from './hooks/useTranslations';
import { format } from 'date-fns';

const PrayerCard = ({ name, time, isActive }: { name: string, time: string, isActive?: boolean }) => {
  const { t } = useTranslations();
  const translatedName = t(name.toLowerCase() as any);
  return (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} className={`relative p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${isActive ? 'bg-spiritual-emerald text-white shadow-xl scale-105 z-10' : 'bg-white border border-emerald-100 text-spiritual-dark hover:shadow-2xl hover:border-emerald-200'}`}>
      {isActive && <motion.div layoutId="active-glow" className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent pointer-events-none" />}
      <span className={`text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black mb-1 md:mb-2 ${isActive ? 'opacity-60' : 'opacity-40'}`}>{translatedName}</span>
      <span className="text-lg md:text-xl font-black font-inter tracking-tighter">{time}</span>
      {isActive && <div className="absolute top-2 right-3 md:right-4 w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
    </motion.div>
  );
};

const RamadanProgressCard = () => {
  const ramadanStart = new Date('2026-03-20');
  const today = new Date();
  const diffTime = today.getTime() - ramadanStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(0, Math.min(30, diffDays));
  const progress = ((currentDay / 30) * 100).toFixed(1);
  const isBefore = diffDays < 1;
  const { t, language } = useTranslations();
  return (
    <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden shadow-2xl shadow-emerald-900/5 group border border-emerald-100">
      <div className={`relative z-10 space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className={`flex justify-between items-start ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className="space-y-1"><span className="text-spiritual-dark/30 text-[9px] md:text-[10px] uppercase font-black tracking-[0.3em]">{t('ramadan_journey')}</span><h3 className="text-2xl md:text-3xl font-black italic text-spiritual-emerald">{isBefore ? `${t('starts_in')} ${Math.abs(diffDays)} ${t('days')}` : `${t('day')} ${currentDay} / 30`}</h3></div>
          <div className="p-3 md:p-4 bg-emerald-50 rounded-2xl border border-emerald-100"><Calendar size={20} className="text-spiritual-emerald" /></div>
        </div>
        <div className="space-y-3">
          <div className={`flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest text-spiritual-dark/30 ${language === 'ar' ? 'flex-row-reverse' : ''}`}><span>{isBefore ? t('preparation') : t('on_track')}</span><span className="text-spiritual-emerald">{isBefore ? '0%' : `${progress}%`}</span></div>
          <div className="h-2.5 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100"><motion.div initial={{ width: 0 }} animate={{ width: isBefore ? '0%' : `${progress}%` }} className="h-full bg-gradient-to-r from-spiritual-emerald to-spiritual-accent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]" /></div>
        </div>
        <div className="flex gap-3 md:gap-4">
          <div className="flex-1 p-3 md:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100"><span className="block text-[9px] md:text-[10px] text-spiritual-dark/30 uppercase font-black mb-1">Target</span><span className="font-bold text-sm md:text-base text-spiritual-dark">Eid al-Fitr</span></div>
          <div className="flex-1 p-3 md:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100"><span className="block text-[9px] md:text-[10px] text-spiritual-dark/30 uppercase font-black mb-1">Status</span><span className="font-bold text-sm md:text-base text-spiritual-emerald">{isBefore ? t('get_ready') : t('on_track')}</span></div>
        </div>
      </div>
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-spiritual-accent/5 rounded-full blur-[100px] group-hover:bg-spiritual-accent/10 transition-all duration-700" />
    </div>
  );
};

const AuthScreen = () => {
  const { t, language } = useTranslations();
  const { login, signup } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Authentication failed');
      }
    } else {
      const result = await signup(name, email, password);
      if (result.success) {
        setIsLogin(true);
        setPassword('');
        setError(language === 'ar' ? 'تم إنشاء الحساب بنجاح، يرجى تسجيل الدخول' : 'Account created! Please login now.');
      } else {
        setError(result.message || 'Signup failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen selection:bg-spiritual-emerald/20 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] right-[-10%] w-[80%] aspect-square bg-spiritual-accent blur-[120px] rounded-full" />
        <motion.div animate={{ scale: [1.3, 1, 1.3], opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] left-[-10%] w-[70%] aspect-square bg-spiritual-emerald blur-[150px] rounded-full" />
      </div>
      
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-32 md:pb-40 relative z-10 flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-emerald-100 rounded-[3rem] p-8 md:p-12 shadow-2xl max-w-md w-full relative overflow-hidden"
        >
          <div className="relative z-10 text-center space-y-8">
            <div className="w-64 h-64 bg-white rounded-[3.5rem] flex items-center justify-center mx-auto shadow-sm overflow-hidden">
              <img src="/logo.png" alt="Noor Logo" className="w-full h-full object-contain p-6" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-spiritual-dark italic">{isLogin ? t('login') : t('signup')}</h2>
              <p className="text-sm text-slate-400 font-bold">{t('auth_welcome')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name')} required className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-spiritual-emerald/20 outline-none font-bold" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')} required className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-spiritual-emerald/20 outline-none font-bold" />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} required className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-spiritual-emerald/20 outline-none font-bold" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-spiritual-emerald transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-5 bg-spiritual-emerald text-white rounded-2xl font-black shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? t('login') : t('signup'))}
                <ArrowRight size={18} />
              </button>
            </form>

            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-spiritual-emerald uppercase tracking-widest hover:underline">
              {isLogin ? t('no_account') : t('have_account')}
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-spiritual-emerald/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        </motion.div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showMosqueMap, setShowMosqueMap] = useState(false);
  const { lastReadAyah, user, isAuthenticated, logout, language, setLanguage, activeHizb, setActiveHizb, fetchUserData } = useUserStore();
  const { t } = useTranslations();
  const { coords } = useLocation();
  const { times, next } = usePrayerTimes(coords);

  useEffect(() => {
    if (isAuthenticated) fetchUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeHizb) setActiveTab('quran');
  }, [activeHizb]);

  const formatPrayerTime = (date: Date | null) => date ? format(date, 'hh:mm a') : "--:--";

  const renderHome = () => (
    <section className="space-y-8 md:space-y-12 pb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_40px_80px_rgba(4,57,39,0.12)] border-2 border-emerald-50">
        <div className={`relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12 ${language === 'ar' ? 'lg:flex-row-reverse' : ''}`}>
          <div className={`space-y-4 ${language === 'ar' ? 'text-right flex flex-col items-end' : 'text-left'}`}>
            <div className={`flex items-center gap-3 bg-spiritual-emerald/5 w-fit px-4 md:px-5 py-2 rounded-full border border-spiritual-emerald/10 shadow-sm ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className="w-2 h-2 bg-spiritual-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-spiritual-emerald">{t('next_prayer')}: {next ? t(next.name.split(' ')[0].toLowerCase() as any) : '...'}</span>
            </div>
            <div className="space-y-1">
              <div className="text-5xl md:text-7xl lg:text-8xl font-black font-inter tracking-tighter flex items-baseline gap-3 md:gap-4 text-spiritual-emerald">
                {next ? next.remaining : '00:00:00'}
                <span className={`text-[10px] md:text-xs uppercase font-bold opacity-40 tracking-[0.2em] md:tracking-[0.4em] translate-y-[-5px] md:translate-y-[-10px] text-spiritual-dark bg-none ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t('left')}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-emerald-50/50 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-emerald-100 shadow-sm group">
              <Sun size={18} className="text-spiritual-accent mb-2 md:mb-3 group-hover:rotate-180 transition-transform duration-1000" /><span className="block text-[9px] md:text-[10px] uppercase font-black opacity-40 tracking-[0.2em] mb-1 text-spiritual-dark">{t('imsak')}</span><span className="text-xl md:text-2xl font-black text-spiritual-emerald">{times ? formatPrayerTime(times.fajr) : '--:--'}</span>
            </div>
            <div className="bg-emerald-50/50 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-emerald-100 shadow-sm group">
              <Moon size={18} className="text-spiritual-accent mb-2 md:mb-3 group-hover:scale-125 transition-transform" /><span className="block text-[9px] md:text-[10px] uppercase font-black opacity-40 tracking-[0.2em] mb-1 text-spiritual-dark">{t('iftar')}</span><span className="text-xl md:text-2xl font-black text-spiritual-emerald">{times ? formatPrayerTime(times.maghrib) : '--:--'}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-[80%] aspect-square bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      </div>
      
      {lastReadAyah && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => handleSelectSurah({ number: lastReadAyah.surah, name: lastReadAyah.name } as any, lastReadAyah.page)}
          className="w-full p-8 bg-spiritual-emerald rounded-[3rem] shadow-2xl shadow-emerald-900/20 text-white flex items-center justify-between group overflow-hidden relative border-4 border-white"
        >
          <div className="relative z-10 text-right" dir="rtl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-spiritual-accent rounded-full animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">{t('resume_subtitle')}</span>
            </div>
            <h3 className="text-4xl font-black italic mb-2 text-white font-amiri tracking-tight drop-shadow-sm">{lastReadAyah.name}</h3>
            <div className="flex items-center gap-3 justify-end">
              <span className="px-4 py-1.5 bg-black/20 rounded-xl text-sm text-spiritual-accent font-black border border-white/10">{t('ayah')} {lastReadAyah.ayah}</span>
              <span className="px-4 py-1.5 bg-black/20 rounded-xl text-sm text-spiritual-accent font-black border border-white/10">{t('page')} {lastReadAyah.page}</span>
            </div>
          </div>
          <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border-2 border-white/30">
            <BookOpen size={40} className="text-white" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-spiritual-accent/20 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
        </motion.button>
      )}

      <div className="space-y-6 md:space-y-8">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
           <div className={language === 'ar' ? 'text-right' : 'text-left'}><h3 className="text-xl md:text-2xl font-black text-spiritual-dark italic tracking-tight">{t('todays_prayer')}</h3><p className="text-[10px] md:text-xs text-spiritual-dark/30 font-bold uppercase tracking-widest mt-1">{t('accurate_location')}</p></div>
           <button onClick={() => { if(coords) setShowMosqueMap(true); else alert("Location not detected."); }} className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-spiritual-emerald hover:shadow-md transition-all w-fit">{t('view_map')} <MapPin size={12} /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6" dir="ltr">
          <PrayerCard name="Fajr" time={times ? formatPrayerTime(times.fajr) : '--:--'} isActive />
          <PrayerCard name="Dhuhr" time={times ? formatPrayerTime(times.dhuhr) : '--:--'} />
          <PrayerCard name="Asr" time={times ? formatPrayerTime(times.asr) : '--:--'} />
          <PrayerCard name="Maghrib" time={times ? formatPrayerTime(times.maghrib) : '--:--'} isActive />
          <PrayerCard name="Isha" time={times ? formatPrayerTime(times.isha) : '--:--'} />
        </div>
      </div>
      <DailyChallenges />
      <TasbihCounter />
      <DuaLibrary />
    </section>
  );

  const handleSelectSurah = (surah: Surah | null, pageOrHizb?: number) => {
    if (pageOrHizb && pageOrHizb < 0) {
      setActiveHizb({ circleId: 'personal', hizbNum: Math.abs(pageOrHizb) });
    } else {
      setSelectedSurah(surah);
      setSelectedPage(pageOrHizb || null);
    }
    setActiveTab('quran');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'quran':
        return <QuranReader assignedHizb={activeHizb?.hizbNum} circleId={activeHizb?.circleId} initialSurah={selectedSurah} initialPage={selectedPage} onBack={() => { setSelectedSurah(null); setSelectedPage(null); setActiveHizb(null); }} />;
      case 'groups': return <KhatmahSocialManager />;
      case 'calendar': return <KhatmahTracker />;
      case 'qibla': return <QiblaCompass />;
      case 'insight': return <AiReflection />;
      case 'settings':
        return (
          <div className="space-y-10 py-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <h2 className="text-3xl md:text-4xl font-black text-spiritual-dark tracking-tight italic text-center">{t('settings')}</h2>
            <div className="grid gap-6">
              <div className="grid gap-4 md:gap-6 w-full">
                <div className="flex flex-col md:flex-row items-center md:justify-between p-8 bg-spiritual-emerald text-white rounded-[2.5rem] shadow-xl relative overflow-hidden text-center md:text-left">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6"><div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white"><User size={32} /></div><div><h4 className="font-black text-2xl">{user?.name}</h4><p className="text-sm opacity-60">{user?.email}</p></div></div>
                    <button onClick={() => logout()} className="mt-6 md:mt-0 relative z-10 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><LogOut size={18} /> {t('sign_out')}</button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return renderHome();
    }
  };

  if (!isAuthenticated) return <AuthScreen />;

  return (
    <div className="min-h-screen selection:bg-spiritual-emerald/20 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden"><motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] right-[-10%] w-[80%] aspect-square bg-spiritual-accent blur-[120px] rounded-full" /><motion.div animate={{ scale: [1.3, 1, 1.3], opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] left-[-10%] w-[70%] aspect-square bg-spiritual-emerald blur-[150px] rounded-full" /></div>
      <div className="fixed bottom-6 md:bottom-10 inset-x-0 flex justify-center z-50 pointer-events-none px-4"><nav className="bg-white/90 backdrop-blur-2xl border border-emerald-100/50 px-6 md:px-12 py-4 md:py-6 rounded-full shadow-2xl flex items-center justify-center gap-4 md:gap-10 w-fit pointer-events-auto transition-all duration-500">{[ { id: 'home', icon: Sun }, { id: 'quran', icon: Book }, { id: 'insight', icon: BrainCircuit }, { id: 'qibla', icon: Compass }, { id: 'groups', icon: Users }, { id: 'settings', icon: Settings } ].map(({ id, icon: Icon }) => (<button key={id} onClick={() => { setActiveTab(id); setSelectedSurah(null); setSelectedPage(null); setActiveHizb(null); }} className={`relative p-2 transition-all duration-300 ${activeTab === id ? 'text-spiritual-emerald scale-110 md:scale-125' : 'text-slate-300 hover:text-spiritual-emerald/40'}`}><Icon size={24} strokeWidth={activeTab === id ? 3 : 2} />{activeTab === id && <motion.div layoutId="nav-pill" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-spiritual-emerald rounded-full" />}</button>))}</nav></div>
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-32 md:pb-40 relative z-10">
        <header className="flex flex-col items-center justify-center gap-8 mb-12 md:mb-20 text-center"><div className={`w-full flex items-center justify-between px-2 md:px-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}><div className="relative group"><button onClick={() => setShowLangDropdown(!showLangDropdown)} className="p-4 bg-white border border-emerald-100 rounded-2xl text-spiritual-emerald shadow-sm hover:shadow-xl transition-all flex items-center gap-2 uppercase text-[10px] font-black tracking-widest"><Languages size={18} /> {language}</button><AnimatePresence>{showLangDropdown && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 bg-white border border-emerald-100 rounded-2xl shadow-2xl overflow-hidden min-w-[140px] z-50 p-1">{[ { id: 'en', name: 'English' }, { id: 'ar', name: 'العربية' }, { id: 'es', name: 'Español' } ].map(lang => (<button key={lang.id} onClick={() => { setLanguage(lang.id as any); setShowLangDropdown(false); }} className={`w-full px-4 py-3 text-left text-xs font-bold transition-all rounded-xl flex items-center justify-between ${language === lang.id ? 'bg-emerald-50 text-spiritual-emerald' : 'text-slate-400 hover:bg-slate-50'}`}>{lang.name} {language === lang.id && <Check size={14} />}</button>))}</motion.div>)}</AnimatePresence></div>    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-spiritual-emerald rounded-full animate-pulse" />
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-spiritual-emerald">Live Companion</span>
      </div>
      <h1 className="text-5xl md:text-6xl font-black text-spiritual-dark tracking-tighter italic text-center">Noor</h1>
    </div><div className="w-[60px]" /> </div></header>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {activeTab === 'home' ? renderHome() : (activeTab === 'quran' && !selectedSurah && !selectedPage && !activeHizb ? <QuranList onSelectSurah={handleSelectSurah} /> : renderContent())}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>{showMosqueMap && coords && (<MosqueFinder userCoords={coords} onClose={() => setShowMosqueMap(false)} />)}</AnimatePresence>
    </div>
  );
};

export default App;
