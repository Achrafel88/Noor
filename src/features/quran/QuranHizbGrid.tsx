import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Hash } from 'lucide-react';

interface QuranHizbGridProps {
  onSelectHizb: (hizb: number) => void;
}

export const QuranHizbGrid: React.FC<QuranHizbGridProps> = ({ onSelectHizb }) => {
  const hizbToPage = (hizb: number) => {
    if (hizb === 1) return 1;
    return Math.floor((hizb - 1) * 10.06) + 1;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 py-4">
      {[...Array(60)].map((_, i) => {
        const hizbNum = i + 1;
        const page = hizbToPage(hizbNum);
        return (
          <motion.button
            key={hizbNum}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectHizb(hizbNum)}
            className="bg-white border border-emerald-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-xl hover:border-spiritual-emerald/30 transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-spiritual-emerald group-hover:bg-spiritual-emerald group-hover:text-white transition-all">
              <BookMarked size={24} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest block mb-1">الحزب</span>
              <span className="text-2xl font-black text-spiritual-dark group-hover:text-spiritual-emerald transition-colors">{hizbNum}</span>
            </div>
            <div className="px-3 py-1 bg-slate-50 rounded-full text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
              صفحة {page}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
