import React, { useState, useEffect } from 'react';
import { quranService, Surah } from './quranService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, List, Grid3X3, Hash, BookMarked, BookOpen } from 'lucide-react';
import { QuranPageGrid } from './QuranPageGrid';
import { QuranHizbGrid } from './QuranHizbGrid';
import { useUserStore } from '../../store/useUserStore';
import { useTranslations } from '../../hooks/useTranslations';

interface QuranListProps {
  onSelectSurah: (surah: Surah | null, page?: number) => void;
}

export const QuranList: React.FC<QuranListProps> = ({ onSelectSurah }) => {
  const { lastReadAyah } = useUserStore();
  const { t } = useTranslations();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'surah' | 'page' | 'hizb'>('surah');

  useEffect(() => {
    quranService.getSurahs()
      .then(setSurahs)
      .finally(() => setLoading(false));
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.includes(searchTerm) ||
    s.number.toString() === searchTerm
  );

  const numericSearch = parseInt(searchTerm);
  const isNumeric = !isNaN(numericSearch);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-spiritual-emerald" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Resume Reading Card */}
      {lastReadAyah && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onSelectSurah({ number: lastReadAyah.surah, name: lastReadAyah.name } as any, lastReadAyah.page)}
          className="w-full p-6 bg-spiritual-emerald rounded-[2.5rem] shadow-xl shadow-emerald-900/20 text-white flex items-center justify-between group overflow-hidden relative border-2 border-white/50"
        >
          <div className="relative z-10 text-right" dir="rtl">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mb-2 block">{t('resume_reading')}</span>
            <h3 className="text-3xl font-black italic text-white font-amiri mb-2 tracking-tight drop-shadow-sm">{lastReadAyah.name}</h3>
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-black/10 rounded-lg text-xs text-spiritual-accent font-black">{t('ayah')} {lastReadAyah.ayah}</span>
              <span className="text-white/30">•</span>
              <span className="px-2 py-0.5 bg-black/10 rounded-lg text-xs text-spiritual-accent font-black">{t('page')} {lastReadAyah.page}</span>
            </div>
          </div>
          <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
            <BookOpen size={28} className="text-white" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-spiritual-accent/10 rounded-full blur-2xl" />
        </motion.button>
      )}

      {/* Top bar with Toggle and Search */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex bg-emerald-50/50 p-1.5 rounded-2xl border border-emerald-100/50 w-fit overflow-x-auto">
          <button 
            onClick={() => setViewMode('surah')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'surah' ? 'bg-spiritual-emerald text-white shadow-lg' : 'text-spiritual-emerald/60 hover:bg-emerald-100/50'}`}
          >
            <List size={14} /> السور
          </button>
          <button 
            onClick={() => setViewMode('hizb')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'hizb' ? 'bg-spiritual-emerald text-white shadow-lg' : 'text-spiritual-emerald/60 hover:bg-emerald-100/50'}`}
          >
            <BookMarked size={14} /> الأحزاب
          </button>
          <button 
            onClick={() => setViewMode('page')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'page' ? 'bg-spiritual-emerald text-white shadow-lg' : 'text-spiritual-emerald/60 hover:bg-emerald-100/50'}`}
          >
            <Grid3X3 size={14} /> الصفحات
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-spiritual-dark/30" size={18} />
          <input 
            type="text"
            placeholder="بحث (سورة، حزب، صفحة)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-emerald-100/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-spiritual-emerald/5 transition-all text-right"
            dir="rtl"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'surah' ? (
          <motion.div 
            key="surah-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {isNumeric && (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onSelectSurah(null, numericSearch)}
                  className="flex items-center justify-between p-6 bg-emerald-50 border border-spiritual-emerald/20 rounded-3xl hover:bg-spiritual-emerald hover:text-white transition-all group"
                >
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">انتقال إلى</span>
                    <h4 className="text-xl font-black">الصفحة {numericSearch}</h4>
                  </div>
                  <Hash size={24} className="opacity-20" />
                </button>
                {numericSearch <= 60 && (
                  <button 
                    onClick={() => onSelectSurah(null, -numericSearch)} // Using negative for Hizb signal or handling in App
                    className="flex items-center justify-between p-6 bg-accent-amber/5 border border-spiritual-accent/20 rounded-3xl hover:bg-spiritual-accent hover:text-white transition-all group"
                  >
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">انتقال إلى</span>
                      <h4 className="text-xl font-black">الحزب {numericSearch}</h4>
                    </div>
                    <BookMarked size={24} className="opacity-20" />
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {filteredSurahs.map((surah) => (
                <motion.button
                  key={surah.number}
                  whileHover={{ scale: 1.01, y: -2 }}
                  onClick={() => onSelectSurah(surah)}
                  className="flex items-center justify-between p-4 md:p-6 bg-white border border-emerald-100/50 rounded-2xl hover:border-spiritual-emerald/30 hover:shadow-xl transition-all text-left group"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 bg-spiritual-emerald/5 rounded-xl flex items-center justify-center text-spiritual-emerald font-bold text-sm group-hover:bg-spiritual-emerald group-hover:text-white transition-all">
                      {surah.number}
                    </div>
                    <div className="truncate">
                      <h4 className="font-black text-spiritual-dark group-hover:text-spiritual-emerald transition-colors truncate">{surah.englishName}</h4>
                      <p className="text-[10px] text-spiritual-dark/40 uppercase font-bold tracking-widest truncate">
                        {surah.revelationType} • {surah.numberOfAyahs} Ayahs
                      </p>
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-amiri text-spiritual-emerald shrink-0 ml-2">
                    {surah.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : viewMode === 'hizb' ? (
          <motion.div
            key="hizb-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <QuranHizbGrid onSelectHizb={(h) => onSelectSurah(null, -h)} />
          </motion.div>
        ) : (
          <motion.div
            key="page-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <QuranPageGrid onSelectPage={(p) => onSelectSurah(null, p)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
