import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Copy, Bookmark, Sparkles, Sun, Moon } from 'lucide-react';

const DUAS = [
  {
    id: 1,
    title: "Morning Remembrance",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the final return.",
    source: "Abu Dawud & At-Tirmidhi"
  },
  {
    id: 2,
    title: "Seeking Guidance",
    arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    translation: "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    source: "Surah Al-Kahf 18:10"
  },
  {
    id: 3,
    title: "Gratitude",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    translation: "All praise is for Allah by whose grace good things are completed.",
    source: "Ibn Majah"
  }
];

export const DailyDua: React.FC = () => {
  const [currentDuaIndex, setCurrentDuaIndex] = useState(0);
  const currentDua = DUAS[currentDuaIndex];

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-black text-spiritual-dark tracking-tight italic">Daily Duas</h2>
        <div className="flex gap-2">
          <button 
             onClick={() => setCurrentDuaIndex((prev) => (prev > 0 ? prev - 1 : DUAS.length - 1))}
             className="p-3 bg-white border border-emerald-100/50 rounded-2xl text-spiritual-dark/30 hover:text-spiritual-emerald transition-all"
          >
             <Sun size={20} />
          </button>
          <button 
             onClick={() => setCurrentDuaIndex((prev) => (prev + 1) % DUAS.length)}
             className="p-3 bg-white border border-emerald-100/50 rounded-2xl text-spiritual-dark/30 hover:text-spiritual-emerald transition-all"
          >
             <Moon size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentDua.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative bg-white border border-emerald-100/50 rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden group min-h-[400px] flex flex-col justify-between"
        >
          {/* Elegant Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-spiritual-emerald/5 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-tr-[5rem] -ml-10 -mb-10 group-hover:scale-110 transition-transform" />

          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-spiritual-emerald" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-spiritual-dark/30">{currentDua.title}</span>
            </div>

            <div 
              className="text-4xl md:text-5xl font-amiri text-right leading-[4.5rem] text-spiritual-dark"
              dir="rtl"
            >
              {currentDua.arabic}
            </div>

            <div className="space-y-4">
              <p className="text-xl font-medium text-spiritual-dark/70 leading-relaxed italic">
                "{currentDua.translation}"
              </p>
              <p className="text-xs font-bold text-spiritual-emerald/40 tracking-widest uppercase">— {currentDua.source}</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-10 border-t border-emerald-50 mt-10">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-spiritual-dark/30 hover:text-red-500 transition-colors">
                <Heart size={20} /> <span className="text-xs font-bold uppercase">Save</span>
              </button>
              <button className="flex items-center gap-2 text-spiritual-dark/30 hover:text-spiritual-emerald transition-colors">
                <Share2 size={20} /> <span className="text-xs font-bold uppercase">Share</span>
              </button>
            </div>
            <button className="p-3 bg-spiritual-emerald/10 text-spiritual-emerald rounded-2xl hover:bg-spiritual-emerald hover:text-white transition-all">
              <Copy size={20} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2">
        {DUAS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all ${i === currentDuaIndex ? 'w-8 bg-spiritual-emerald' : 'w-2 bg-emerald-100'}`}
          />
        ))}
      </div>
    </div>
  );
};
