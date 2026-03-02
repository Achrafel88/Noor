import React, { useState, useEffect, useRef } from 'react';
import { quranService, Ayah, RECITERS, RIWAYATS } from './quranService';
import { useUserStore } from '../../store/useUserStore';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useTranslations } from '../../hooks/useTranslations';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, BookOpen, X, Play, Pause, Volume2, Settings2, AlertCircle, Headphones, Languages, ChevronRight, ChevronLeft, Bookmark, RefreshCcw } from 'lucide-react';

interface QuranReaderProps {
  initialSurah?: any | null;
  initialPage?: number | null;
  assignedHizb?: number | null;
  circleId?: string | null;
  onBack: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({ initialSurah, initialPage, assignedHizb, circleId, onBack }) => {
  const { user, language, updateHizbProgress, circles, setActiveHizb, setLastRead } = useUserStore();
  const updateChallengeProgress = useChallengeStore((state) => state.updateProgress);
  const { t } = useTranslations();
  
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeAyah, setActiveAyah] = useState<Ayah | null>(null);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [readAyahsInHizb, setReadAyahsInHizb] = useState<Set<number>>(new Set());
  const [pagesTracked, setPagesTracked] = useState<Set<number>>(new Set());

  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [selectedRiwayah, setSelectedRiwayah] = useState(RIWAYATS.find(r => r.lang === language) || RIWAYATS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioAyah, setCurrentAudioAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showControls, setShowSettings] = useState(false);

  // Initialize page/hizb settings
  useEffect(() => {
    const init = async () => {
      if (assignedHizb && circleId && circleId !== 'personal') {
        const currentCircle = circles.find(c => c.id === circleId);
        const myAssign = currentCircle?.assignments.find(a => a.hizbNumber === assignedHizb && a.memberId === user?.id);
        if (myAssign?.lastReadPage) {
          setCurrentPage(myAssign.lastReadPage);
        }
      } else {
        if (initialPage) setCurrentPage(initialPage);
        else if (initialSurah) {
          const page = await quranService.getSurahStartPage(initialSurah.number);
          setCurrentPage(page);
        } else if (assignedHizb) {
          const page = assignedHizb === 1 ? 1 : Math.floor((assignedHizb - 1) * 10.06) + 1;
          setCurrentPage(page);
        }
      }
    };
    init();
  }, [assignedHizb, initialPage, initialSurah]);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      let result: Ayah[] = [];
      if (assignedHizb) {
        result = await quranService.getHizbDetail(assignedHizb, selectedReciter.id, selectedRiwayah.id);
      } else {
        const data = await quranService.getPageDetail(currentPage, selectedReciter.id, selectedRiwayah.id);
        result = data.ayahs;
      }
      
      if (result && result.length > 0) {
        setAyahs(result);
      } else setError(true);
    } catch (e) { 
      console.error("Reader load error", e);
      setError(true); 
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [assignedHizb, currentPage, selectedReciter, selectedRiwayah]);

  const markRead = (ayah: Ayah) => {
    const sNum = ayah.surah?.number || 1;
    const sName = ayah.surah?.name || "سورة";
    
    // Only update personal trackers if NOT in a group mission or explicitly in personal mode
    if (!circleId || circleId === 'personal') {
      setLastRead(sNum, ayah.numberInSurah, sName, ayah.page);
      
      // Update overall personal progress based on page
      if (ayah.page) {
        const progress = Math.round((ayah.page / 604) * 100);
        useUserStore.getState().updatePersonalProgress(progress);
      }
    }
    
    if (ayah.page && !pagesTracked.has(ayah.page)) {
      setPagesTracked(prev => new Set(prev).add(ayah.page));
      updateChallengeProgress('quran', 1);
    }

    // Only update Group progress if we ARE in a mission
    if (assignedHizb && circleId && circleId !== 'personal') {
      const newRead = new Set(readAyahsInHizb);
      newRead.add(ayah.number);
      setReadAyahsInHizb(newRead);
      updateHizbProgress(circleId, assignedHizb, newRead.size, ayahs.length, {
        ayah: ayah.numberInSurah,
        surah: sNum,
        name: sName,
        page: ayah.page
      });
    }
  };

  const playAudio = (ayah: Ayah) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(ayah.audio);
    audioRef.current = audio;
    setCurrentAudioAyah(ayah.number);
    setIsPlaying(true);
    markRead(ayah);
    audio.play();
    audio.onended = () => {
      const idx = ayahs.findIndex(a => a.number === ayah.number);
      if (idx < ayahs.length - 1) playAudio(ayahs[idx + 1]);
      else { setIsPlaying(false); setCurrentAudioAyah(null); }
    };
  };

  const togglePlayback = () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else if (ayahs.length > 0) {
      const startFrom = currentAudioAyah ? ayahs.find(a => a.number === currentAudioAyah) : ayahs[0];
      if (startFrom) playAudio(startFrom);
    }
  };

  const handleAyahClick = async (ayah: Ayah) => {
    setActiveAyah(ayah);
    markRead(ayah); 
    setLoadingTafsir(true);
    setTafsir(null);
    try {
      const text = await quranService.getAyahTafsir(ayah.surah?.number || 1, ayah.numberInSurah);
      setTafsir(text);
    } catch (e) { setTafsir("تعذر جلب التفسير"); }
    finally { setLoadingTafsir(false); }
  };

  const nextPage = () => { if (currentPage < 604) setCurrentPage(p => p + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

  const handleDragEnd = (event: any, info: any) => {
    if (assignedHizb) return; 
    const threshold = 100;
    if (info.offset.x < -threshold) nextPage();
    else if (info.offset.x > threshold) prevPage();
  };

  return (
    <div className="pt-24 pb-32">
      <div className="fixed top-0 left-0 right-0 bg-[#FDFCF7]/95 backdrop-blur-xl border-b border-emerald-100/50 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => { setActiveHizb(null); onBack(); }} className="p-2 bg-emerald-50 rounded-xl text-spiritual-emerald hover:bg-emerald-100 transition-all"><ArrowLeft size={20} /></button>
          
          <div className="flex-1 flex justify-center items-center gap-2">
            <div className="bg-spiritual-emerald text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-lg flex items-center gap-2">
              {assignedHizb ? `الحزب ${assignedHizb}` : (ayahs[0]?.surah?.name || initialSurah?.name || 'المصحف')}
            </div>
            {!error && ayahs.length > 0 && (
              <button onClick={togglePlayback} className="p-2 bg-spiritual-accent text-white rounded-xl shadow-md hover:scale-105 transition-all">
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(!showControls)} className="p-2 bg-emerald-50 rounded-xl text-spiritual-emerald hover:bg-emerald-100 transition-all">
              <Settings2 size={20} />
            </button>
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-spiritual-emerald font-black text-xs shadow-inner">{currentPage}</div>
          </div>
        </div>

        <AnimatePresence>
          {showControls && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-emerald-50/50 border-b border-emerald-100 overflow-hidden shadow-inner">
              <div className="max-w-4xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><Headphones size={12} /> {t('select_reciter')}</label>
                  <select value={selectedReciter.id} onChange={(e) => setSelectedReciter(RECITERS.find(r => r.id === e.target.value) || RECITERS[0])} className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-spiritual-emerald/20 transition-all">
                    {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><Languages size={12} /> {t('language')}</label>
                  <select value={selectedRiwayah.id} onChange={(e) => setSelectedRiwayah(RIWAYATS.find(r => r.id === e.target.value) || RIWAYATS[0])} className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-spiritual-emerald/20 transition-all">
                    {RIWAYATS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 overflow-x-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-spiritual-emerald" size={48} />
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('loading')}...</p>
          </div>
        ) : error || ayahs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 px-8 text-center bg-white border border-emerald-100 rounded-[3rem] shadow-xl">
            <AlertCircle className="text-red-400" size={48} />
            <h3 className="text-xl font-black text-spiritual-dark">فشل تحميل البيانات</h3>
            <div className="flex gap-3">
              <button onClick={loadData} className="px-6 py-3 bg-emerald-50 text-spiritual-emerald rounded-2xl font-bold flex items-center gap-2 border border-emerald-100"><RefreshCcw size={18} /> إعادة المحاولة</button>
              <button onClick={onBack} className="px-6 py-3 bg-spiritual-emerald text-white rounded-2xl font-bold shadow-lg">العودة للرئيسية</button>
            </div>
          </div>
        ) : (
          <motion.div 
            key={currentPage}
            drag={assignedHizb ? undefined : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-[#FDFCF7] rounded-[3rem] shadow-2xl border border-emerald-100/50 p-8 md:p-16 relative overflow-hidden min-h-[80vh] cursor-grab active:cursor-grabbing"
          >
            <div className="max-w-3xl mx-auto relative z-10 text-right font-amiri" dir="rtl">
              <div className={`leading-[4.5rem] md:leading-[7.1rem] text-4xl md:text-5xl text-spiritual-dark ${selectedRiwayah.lang !== 'ar' ? 'font-inter text-2xl leading-relaxed text-right' : ''}`}>
                {ayahs.map((ayah, idx) => {
                  const isNewSurah = idx === 0 || ayahs[idx-1].surah?.number !== ayah.surah?.number;
                  const isActive = currentAudioAyah === ayah.number;
                  const lastRead = useUserStore.getState().lastReadAyah;
                  const isBookmarked = lastRead?.surah === ayah.surah?.number && lastRead?.ayah === ayah.numberInSurah;

                  return (
                    <React.Fragment key={ayah.number}>
                      {isNewSurah && (
                        <div className="w-full text-center my-12 pointer-events-none">
                          <div className="inline-block px-12 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-spiritual-emerald font-black text-2xl md:text-4xl mb-8">{ayah.surah?.name || "سورة"}</div>
                          {ayah.numberInSurah === 1 && ayah.surah?.number !== 1 && ayah.surah?.number !== 9 && <div className="text-3xl md:text-4xl opacity-70 mb-8 italic">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>}
                        </div>
                      )}
                      <motion.span 
                        onViewportEnter={() => markRead(ayah)}
                        viewport={{ amount: 0.5 }}
                        onClick={() => handleAyahClick(ayah)} 
                        className={`cursor-pointer hover:bg-emerald-500/10 rounded-2xl transition-all px-2 py-1 relative inline ${readAyahsInHizb.has(ayah.number) || isBookmarked ? 'text-spiritual-emerald font-bold' : ''} ${isActive ? 'bg-spiritual-accent/20 ring-4 ring-spiritual-accent/10' : ''} ${isBookmarked ? 'ring-2 ring-spiritual-accent/30' : ''}`}
                      >
                        {ayah.text}
                        <span className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mx-2 text-sm font-bold border-2 rounded-full align-middle translate-y-[-4px] shadow-sm bg-white border-emerald-100 ${isBookmarked ? 'text-spiritual-accent border-spiritual-accent' : 'text-spiritual-emerald'}`}>
                          {ayah.numberInSurah}
                        </span>
                      </motion.span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            
            {!assignedHizb && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20 text-[8px] font-black uppercase tracking-widest text-spiritual-emerald pointer-events-none">
                <ChevronLeft size={10} className="animate-pulse" /> {t('swipe_hint')} <ChevronRight size={10} className="animate-pulse" />
              </div>
            )}
          </motion.div>
        )}

        {!assignedHizb && !loading && !error && (
          <div className="flex items-center justify-between mt-12 px-2 gap-4">
            <button onClick={prevPage} disabled={currentPage <= 1} className="flex-1 py-5 bg-white border border-emerald-100 rounded-3xl text-spiritual-emerald font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-50 disabled:opacity-30 disabled:grayscale transition-all"><ChevronLeft size={20} /> {t('prev_page')}</button>
            <div className="w-16 h-16 bg-spiritual-dark text-spiritual-accent rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-white/10"><span className="text-[10px] font-black uppercase opacity-40 leading-none mb-1">PAGE</span><span className="text-xl font-black leading-none">{currentPage}</span></div>
            <button onClick={nextPage} disabled={currentPage >= 604} className="flex-1 py-5 bg-white border border-emerald-100 rounded-3xl text-spiritual-emerald font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-50 disabled:opacity-30 disabled:grayscale transition-all">{t('next_page')} <ChevronRight size={20} /></button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeAyah && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveAyah(null)} className="fixed inset-0 bg-spiritual-dark/40 backdrop-blur-sm z-50" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] shadow-2xl z-50 p-8 md:p-12 pb-40 md:pb-56 max-h-[85vh] overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-spiritual-emerald text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{activeAyah.numberInSurah}</div>
                    <div>
                      <h4 className="font-black text-2xl text-spiritual-dark">{activeAyah.surah?.name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('ayah')} {activeAyah.numberInSurah} • {t('page')} {activeAyah.page}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { markRead(activeAyah); setActiveAyah(null); }} className="p-4 bg-spiritual-accent/10 text-spiritual-accent rounded-2xl hover:bg-spiritual-accent hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase">
                      <Bookmark size={20} fill={useUserStore.getState().lastReadAyah?.ayah === activeAyah.numberInSurah ? "currentColor" : "none"} /> {t('save_to_resume')}
                    </button>
                    <button onClick={() => playAudio(activeAyah)} className="p-4 bg-emerald-50 text-spiritual-emerald rounded-2xl hover:bg-spiritual-emerald hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase">
                      <Volume2 size={20} /> {t('play_ayah')}
                    </button>
                    <button onClick={() => setActiveAyah(null)} className="p-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-8 text-right" dir="rtl">
                  <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 shadow-inner">
                    <p className="text-4xl font-amiri leading-[1.8] text-spiritual-dark">{activeAyah.text}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-spiritual-emerald font-black text-xs uppercase tracking-[0.2em] justify-end bg-emerald-50 w-fit px-4 py-2 rounded-full mr-0 ml-auto border border-emerald-100">
                      {t('tafsir_source')} <BookOpen size={16} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[150px] flex items-center justify-center relative overflow-hidden">
                      {loadingTafsir ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-spiritual-emerald" size={32} />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('loading')}...</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-amiri leading-relaxed text-spiritual-dark/80 text-right w-full">{tafsir}</p>
                      )}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
