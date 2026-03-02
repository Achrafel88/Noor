import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trophy, BookOpen, ChevronRight, Hash, ShieldCheck, Sparkles, X, MapPin } from 'lucide-react';
import { useUserStore, KhatmahCircle } from '../../store/useUserStore';
import { useTranslations } from '../../hooks/useTranslations';

export const SocialCircles: React.FC = () => {
  const { circles, isAuthenticated, joinCircle, language } = useUserStore();
  const { t } = useTranslations();
  const [code, setCode] = useState('');
  const [activeCircle, setActiveCircle] = useState<KhatmahCircle | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-[#034d35]/20 border border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950 rounded-3xl flex items-center justify-center text-spiritual-emerald mx-auto">
          <Users size={40} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-spiritual-dark dark:text-emerald-100">Social Khatmah</h3>
          <p className="text-sm text-slate-400 mt-2">Sign in to join a circle with your family and friends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between px-2">
        <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <Users className="text-spiritual-emerald" size={24} />
          <h3 className="text-2xl font-black text-spiritual-dark dark:text-emerald-100 italic tracking-tight">Khatmah Circles</h3>
        </div>
      </div>

      <div className="grid gap-6">
        {circles.map((circle) => {
          const totalProgress = circle.members.reduce((acc, m) => acc + m.progress, 0) / (circle.members.length || 1);
          
          return (
            <motion.button
              key={circle.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveCircle(circle)}
              className="bg-white dark:bg-[#034d35]/20 border border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] p-8 shadow-sm text-left relative overflow-hidden group"
            >
              <div className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 ${language === 'ar' ? 'md:flex-row-reverse text-right' : ''}`}>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="bg-emerald-50 dark:bg-emerald-900 text-spiritual-emerald px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{circle.code}</span>
                    <h4 className="text-xl font-black text-spiritual-dark dark:text-emerald-50">{circle.name}</h4>
                  </div>
                  <div className={`flex items-center gap-4 text-xs font-bold text-slate-400 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="flex items-center gap-1"><Users size={14} /> {circle.members.length} Members</span>
                  </div>
                </div>

                <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Total Progress</p>
                    <p className="text-2xl font-black text-spiritual-emerald">{Math.round(totalProgress)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-spiritual-emerald group-hover:bg-spiritual-emerald group-hover:text-white transition-all">
                    <ChevronRight size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-50 dark:bg-emerald-950">
                <motion.div initial={{ width: 0 }} animate={{ width: `${totalProgress}%` }} className="h-full bg-spiritual-accent" />
              </div>
            </motion.button>
          );
        })}

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={20} />
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter Circle Code" className="w-full pl-12 pr-6 py-4 bg-white dark:bg-spiritual-dark border border-emerald-100 dark:border-emerald-900/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold dark:text-white" />
          </div>
          <button onClick={() => { joinCircle(code); setCode(''); }} className="w-full md:w-auto px-8 py-4 bg-spiritual-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-spiritual-emerald transition-all shadow-xl">Join Circle</button>
        </div>
      </div>

      <AnimatePresence>
        {activeCircle && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCircle(null)} className="absolute inset-0 bg-spiritual-dark/60 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-2xl bg-white dark:bg-[#011a13] rounded-t-[3rem] md:rounded-[3rem] shadow-2xl z-[110] p-8 md:p-12 max-h-[90vh] overflow-y-auto" >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-3xl text-spiritual-emerald"><Users size={32} /></div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-black text-spiritual-dark dark:text-emerald-100">{activeCircle.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Group Leaderboard</p>
                  </div>
                </div>
                <button onClick={() => setActiveCircle(null)} className="p-3 bg-slate-100 dark:bg-emerald-950 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                {activeCircle.members.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-emerald-950/20 rounded-[2rem] border border-slate-100 dark:border-emerald-900/30 transition-all hover:bg-white dark:hover:bg-emerald-900/40 hover:shadow-xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-spiritual-dark rounded-2xl flex items-center justify-center text-spiritual-dark dark:text-emerald-100 font-black shadow-sm group-hover:bg-spiritual-emerald group-hover:text-white transition-all">{member.name[0]}</div>
                      <div>
                        <h5 className="font-black text-spiritual-dark dark:text-emerald-50">{member.name}</h5>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-lg font-black text-spiritual-emerald">{member.progress}%</span>
                        {member.progress === 100 && <Trophy size={16} className="text-spiritual-accent" />}
                      </div>
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-emerald-900/50 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-spiritual-accent shadow-[0_0_10px_#10B981]" style={{ width: `${member.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-8 bg-spiritual-emerald text-white rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-emerald-900/20">
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2"><Sparkles size={16} className="text-spiritual-accent" /><span className="text-[10px] font-black uppercase tracking-widest">Group Achievement</span></div>
                   <h5 className="text-2xl font-black italic">Almost there!</h5>
                   <p className="text-sm opacity-70 mt-2">Your group is doing great. Keep up the momentum to finish the Khatmah together!</p>
                 </div>
                 <div className="absolute right-[-20px] top-[-20px] opacity-10"><Trophy size={150} /></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
