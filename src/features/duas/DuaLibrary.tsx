import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, Heart, BookOpen, ChevronRight, ChevronLeft, Sunrise, CheckCircle2, Bed } from 'lucide-react';
import { useTranslations } from '../../hooks/useTranslations';
import { useChallengeStore } from '../../store/useChallengeStore';

interface DuaContent {
  arabic: string;
  title: string;
  count: number;
}

interface Dua {
  id: string;
  category: 'morning' | 'evening' | 'sleep' | 'general';
  arabic: string;
  title: string;
  count: number;
  source?: string;
}

const MORNING_ADHKAR: Omit<Dua, 'id' | 'category'>[] = [
  { title: 'آية الكرسي', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضِ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ', count: 1, source: 'سورة البقرة (255)' },
  { title: 'سورة الإخلاص', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', count: 3 },
  { title: 'سورة الفلق', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', count: 3 },
  { title: 'سورة الناس', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ', count: 3 },
  { title: 'دعاء الصباح', arabic: 'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. ربِّ أسألك خير ما في هذا اليوم وخير ما بعده، وأعوذ بك من شر ما في هذا اليوم وشر ما بعده، ربِّ أعوذ بك من الكسل وسوء الكبر، ربِّ أعوذ بك من عذاب في النار وعذاب في القبر.', count: 1 },
  { title: 'التوكل', arabic: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.', count: 1 },
  { title: 'سيد الاستغفار', arabic: 'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليّ، وأبوء بذنبي فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.', count: 1 },
  { title: 'الرضا', arabic: 'رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.', count: 3 },
  { title: 'الشهادة', arabic: 'اللهم إني أصبحت أشهدك وأشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمدًا عبدك ورسولك.', count: 4 },
  { title: 'الحسب', arabic: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.', count: 7 },
  { title: 'الحفظ', arabic: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.', count: 3 },
  { title: 'العافية', arabic: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت، اللهم إني أعوذ بك من الكفر والفقر وأعوذ بك من عذاب القبر، لا إله إلا أنت.', count: 3 },
  { title: 'الاستغاثة', arabic: 'يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.', count: 1 },
  { title: 'الاستغفار', arabic: 'أستغفر الله وأتوب إليه.', count: 100 },
  { title: 'التسبيح', arabic: 'سبحان الله وبحمده.', count: 100 },
];

const SLEEP_ADHKAR: Omit<Dua, 'id' | 'category'>[] = [
  { title: 'آية الكرسي', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...', count: 1 },
  { title: 'المعوذات', arabic: 'سورة الإخلاص + الفلق + الناس', count: 3 },
  { title: 'دعاء النوم', arabic: 'باسمك اللهم أموت وأحيا.', count: 1 },
];

const processEvening = (adhkar: Omit<Dua, 'id' | 'category'>[]) => {
  return adhkar.map(a => ({
    ...a,
    arabic: a.arabic
      .replace(/أصبحنا/g, 'أمسينا')
      .replace(/أصبحت/g, 'أمسيت')
      .replace(/هذا اليوم/g, 'هذه الليلة')
      .replace(/إليك النشور/g, 'إليك المصير')
  }));
};

const DUA_DATA: Dua[] = [
  ...MORNING_ADHKAR.map((d, i) => ({ ...d, id: `m${i}`, category: 'morning' as const })),
  ...processEvening(MORNING_ADHKAR).map((d, i) => ({ ...d, id: `e${i}`, category: 'evening' as const })),
  ...SLEEP_ADHKAR.map((d, i) => ({ ...d, id: `s${i}`, category: 'sleep' as const })),
];

export const DuaLibrary: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Dua['category']>('morning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const { language, t } = useTranslations();
  const updateChallengeProgress = useChallengeStore((state) => state.updateProgress);

  const filteredDuas = DUA_DATA.filter(d => d.category === activeCategory);
  
  // Safeguard: if category is empty, show nothing or a message
  if (filteredDuas.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white border border-emerald-100 rounded-[3rem] shadow-xl">
      <Sparkles className="text-spiritual-accent mb-4" size={48} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">قريباً...</p>
    </div>
  );

  const currentDua = filteredDuas[currentIndex] || filteredDuas[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredDuas.length);
    setSessionCount(0);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredDuas.length) % filteredDuas.length);
    setSessionCount(0);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x < -threshold) handleNext();
    else if (info.offset.x > threshold) handlePrev();
  };

  const handleCompleteDua = () => {
    if (sessionCount < currentDua.count) {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      // If finished all repetitions of the CURRENT individual dua, increment progress
      if (newCount === currentDua.count) {
        if (activeCategory === 'morning') updateChallengeProgress('morning_dua', 1);
        if (activeCategory === 'evening') updateChallengeProgress('evening_dua', 1);
      }
    }
  };

  return (
    <div className="space-y-10 py-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-black text-spiritual-accent tracking-tight italic">{t('supplications')}</h2>
      </div>

      <div className="flex bg-emerald-50/50 p-1.5 rounded-2xl border border-emerald-100/50 w-full overflow-x-auto gap-2 scrollbar-hide">
        {[
          { id: 'morning', name: t('morning'), icon: Sun },
          { id: 'evening', name: t('evening'), icon: Moon },
          { id: 'sleep', name: t('sleep'), icon: Bed },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id as any); setCurrentIndex(0); setSessionCount(0); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-spiritual-emerald text-white shadow-lg' : 'text-spiritual-emerald/60 hover:bg-emerald-100/50'}`}
          >
            <cat.icon size={14} /> {cat.name}
          </button>
        ))}
      </div>

      <div className="relative min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentDua.id + language}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.95, x: 20 }} 
            animate={{ opacity: 1, scale: 1, x: 0 }} 
            exit={{ opacity: 0, scale: 0.95, x: -20 }} 
            className="bg-white border border-emerald-100 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 flex flex-col justify-between h-full overflow-hidden relative cursor-grab active:cursor-grabbing"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-spiritual-emerald/[0.02] rounded-bl-[5rem]" />
            
            {/* Swipe Hint */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20 text-[8px] font-black uppercase tracking-widest text-spiritual-emerald pointer-events-none">
              <ChevronLeft size={10} className="animate-pulse" /> {t('swipe_hint')} <ChevronRight size={10} className="animate-pulse" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-spiritual-dark/30">{currentDua.title}</span>
                <div className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black text-spiritual-emerald tracking-widest">
                  {sessionCount} / {currentDua.count}
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-amiri text-right leading-relaxed text-spiritual-dark" dir="rtl">{currentDua.arabic}</p>
              {currentDua.source && <span className="block text-[10px] font-bold text-spiritual-emerald/40 uppercase tracking-widest text-right">{currentDua.source}</span>}
            </div>

            <div className="flex justify-between items-center mt-10 pt-8 border-t border-emerald-50">
               <button 
                onClick={handleCompleteDua}
                disabled={sessionCount >= currentDua.count}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${sessionCount >= currentDua.count ? 'bg-emerald-100 text-spiritual-emerald' : 'bg-spiritual-accent text-white shadow-lg hover:scale-105'}`}
               >
                 {sessionCount >= currentDua.count ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
                 {sessionCount >= currentDua.count ? t('done_dhikr') : t('repeat_dhikr')}
               </button>
               
               <div className="flex gap-2">
                 <button onClick={handlePrev} className="p-3 bg-emerald-50 text-spiritual-emerald rounded-xl hover:bg-emerald-100 transition-all"><ChevronLeft size={20} className={language === 'ar' ? 'rotate-180' : ''} /></button>
                 <button onClick={handleNext} className="p-3 bg-emerald-50 text-spiritual-emerald rounded-xl hover:bg-emerald-100 transition-all"><ChevronRight size={20} className={language === 'ar' ? 'rotate-180' : ''} /></button>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
