import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Fingerprint, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslations } from '../../hooks/useTranslations';
import { useChallengeStore } from '../../store/useChallengeStore';

const getPresets = (t: any) => [
  { name: t('subhanallah'), count: 33 },
  { name: t('alhamdulillah'), count: 33 },
  { name: t('allahuakbar'), count: 34 },
  { name: t('lailahaillallah'), count: 100 },
];

export const TasbihCounter: React.FC = () => {
  const { t, language } = useTranslations();
  const presets = getPresets(t);
  const updateChallengeProgress = useChallengeStore((state) => state.updateProgress);
  
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activePreset, setActivePreset] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    updateChallengeProgress('tasbih', 1);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleReset = () => {
    setCount(0);
    setIsPressed(false);
  };

  const cyclePreset = () => {
    setActivePreset((prev) => (prev + 1) % presets.length);
    setCount(0);
  };

  const progress = (count / presets[activePreset].count) * 100;

  return (
    <div className="bg-white border border-emerald-100 rounded-[3.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 relative overflow-hidden group">
      <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
        <div className={`space-y-8 text-center w-full md:w-1/2 ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
          <div className="space-y-2">
            <div className={`flex items-center justify-center gap-2 ${language === 'ar' ? 'md:justify-start flex-row-reverse' : 'md:justify-start'}`}>
              <div className="w-1.5 h-1.5 bg-spiritual-accent rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-spiritual-dark/30">{t('tasbih')}</span>
            </div>
            <h3 className="text-3xl font-black text-spiritual-dark tracking-tight italic">
              {presets[activePreset].name}
            </h3>
          </div>

          <div className={`flex flex-wrap justify-center gap-2 ${language === 'ar' ? 'md:justify-start flex-row-reverse' : 'md:justify-start'}`}>
            <button onClick={cyclePreset} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-spiritual-emerald rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
              {t('switch_dhikr')} <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
              <RotateCcw size={14} /> {t('reset')}
            </button>
          </div>

          <div className="pt-4 border-t border-emerald-50">
            <div className={`flex justify-between items-end ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('session_goal')}</p>
                <p className="text-xl font-black text-spiritual-dark/40">{presets[activePreset].count}</p>
              </div>
              <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('total_today')}</p>
                <p className="text-xl font-black text-spiritual-emerald">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <svg className="w-48 h-48 md:w-56 md:h-48 transform -rotate-90">
            <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-emerald-50" />
            <motion.circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - progress }} className="text-spiritual-emerald" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleIncrement} onMouseDown={() => setIsPressed(true)} onMouseUp={() => setIsPressed(false)} className={`w-32 h-32 md:w-40 md:h-40 rounded-full shadow-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isPressed ? 'bg-spiritual-dark text-white scale-95 shadow-inner' : 'bg-white border-4 border-emerald-50 text-spiritual-dark hover:border-spiritual-emerald/20'}`}>
              <AnimatePresence mode="wait">
                <motion.span key={count} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-4xl md:text-5xl font-black font-inter tracking-tighter">{count}</motion.span>
              </AnimatePresence>
              <Fingerprint size={24} className={isPressed ? 'text-spiritual-accent' : 'text-spiritual-emerald'} />
            </motion.button>
          </div>
        </div>
      </div>
      <div className="absolute -right-10 -top-10 opacity-[0.03] text-spiritual-emerald pointer-events-none"><Sparkles size={200} /></div>
    </div>
  );
};
