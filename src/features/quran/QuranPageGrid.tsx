import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Hash } from 'lucide-react';

interface QuranPageGridProps {
  onSelectPage: (page: number) => void;
}

export const QuranPageGrid: React.FC<QuranPageGridProps> = ({ onSelectPage }) => {
  const [activeJuz, setActiveJuz] = useState(1);
  const totalPages = 604;
  const juzStartPages = [1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582, 605];

  const getPagesForJuz = (juz: number) => {
    const start = juzStartPages[juz - 1];
    const end = juzStartPages[juz] - 1;
    const pages = [];
    for (let i = start; i <= end; i++) {
      if (i <= totalPages) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-8">
      {/* Juz Selector (Horizontal Scroll) */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {[...Array(30)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setActiveJuz(i + 1)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
              activeJuz === i + 1 
                ? 'bg-spiritual-emerald text-white shadow-lg' 
                : 'bg-white border border-emerald-100 text-slate-400 hover:border-emerald-300'
            }`}
          >
            Juz {i + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {getPagesForJuz(activeJuz).map((page) => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectPage(page)}
            className="aspect-[3/4] bg-white border border-emerald-100 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-50 rounded-bl-2xl flex items-center justify-center text-[10px] font-black text-spiritual-emerald/40 group-hover:bg-spiritual-emerald group-hover:text-white transition-colors">
              {page}
            </div>
            <Hash size={20} className="text-emerald-100 group-hover:text-emerald-500 transition-colors" />
            <span className="text-xl font-black text-spiritual-dark group-hover:text-spiritual-emerald transition-colors">
              {page}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">Page</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
