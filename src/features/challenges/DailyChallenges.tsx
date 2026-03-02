import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, BookOpen, Fingerprint, Sun, Sparkles, Moon } from 'lucide-react';
import { useChallengeStore, Challenge } from '../../store/useChallengeStore';
import { useTranslations } from '../../hooks/useTranslations';

const ChallengeIcon = ({ type }: { type: Challenge['type'] }) => {
  switch (type) {
    case 'quran': return <BookOpen size={20} />;
    case 'tasbih': return <Fingerprint size={20} />;
    case 'morning_dua': return <Sun size={20} />;
    case 'evening_dua': return <Moon size={20} />;
    default: return <Target size={20} />;
  }
};

export const DailyChallenges: React.FC = () => {
  const { dailyChallenges, resetDaily, completeChallenge } = useChallengeStore();
  const { t, language } = useTranslations();

  useEffect(() => {
    resetDaily();
  }, []);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between px-4">
        <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <Sparkles className="text-spiritual-accent" size={20} />
          <h3 className="text-xl font-black text-spiritual-accent dark:text-spiritual-accent italic tracking-tight">{t('daily_missions')}</h3>
        </div>
      </div>

      <div className="grid gap-4">
        {dailyChallenges.map((challenge) => {
          const progress = (challenge.current / challenge.goal) * 100;
          return (
            <motion.div 
              key={challenge.id}
              whileHover={{ x: language === 'ar' ? -5 : 5 }}
              className={`bg-white dark:bg-[#034d35]/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-[2rem] shadow-sm relative overflow-hidden transition-all ${challenge.completed ? 'opacity-60' : ''}`}
            >
              <div className={`flex items-center justify-between mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className={`p-3 rounded-2xl ${challenge.completed ? 'bg-emerald-100 text-spiritual-emerald' : 'bg-emerald-50 text-spiritual-emerald'}`}>
                    <ChallengeIcon type={challenge.type} />
                  </div>
                  <div>
                    <h4 className="font-bold text-spiritual-dark dark:text-emerald-50">{t(challenge.titleKey as any)}</h4>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {challenge.current} / {challenge.goal}
                    </p>
                  </div>
                </div>
                {challenge.completed ? (
                  <CheckCircle2 className="text-spiritual-accent" size={24} />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-100" />
                )}
              </div>

              {/* Mini Progress Bar */}
              <div className="h-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-spiritual-emerald rounded-full"
                />
              </div>

              {challenge.completed && (
                <div className="absolute inset-0 bg-white/5 dark:bg-black/5 pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
