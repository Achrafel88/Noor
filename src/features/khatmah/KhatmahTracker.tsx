import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, TrendingUp, Flower2, Droplets, Sparkles } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

const GardenFlower = ({ delay, scale, x, y }: { delay: number; scale: number; x: string; y: string }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale, opacity: 1 }}
    transition={{ delay, duration: 1, type: "spring" }}
    className="absolute text-spiritual-emerald/20"
    style={{ left: x, top: y }}
  >
    <Flower2 size={40} />
  </motion.div>
);

export const KhatmahTracker: React.FC = () => {
  const { personalProgress } = useUserStore();

  const totalAyahs = 6236;
  const readAyahs = Math.floor((personalProgress / 100) * totalAyahs);
  const remainingAyahs = totalAyahs - readAyahs;
  
  const daysInRamadan = 30;
  const currentDay = 1; 
  const expectedPace = (totalAyahs / daysInRamadan) * currentDay;
  const isAhead = readAyahs >= expectedPace;

  // Calculate how many flowers to show based on progress (max 12)
  const flowerCount = Math.floor((personalProgress / 100) * 12);

  return (
    <div className="space-y-8 pb-12">
      {/* Spiritual Garden Visual */}
      <div className="relative h-64 bg-gradient-to-b from-emerald-50/50 to-white rounded-[3rem] border border-emerald-100/50 overflow-hidden shadow-inner">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-2"
          >
            <span className="text-spiritual-emerald font-bold tracking-[0.2em] uppercase text-[10px]">Your Spiritual Garden</span>
            <h3 className="text-2xl font-black text-spiritual-dark">Keep it Blooming</h3>
            <p className="text-spiritual-dark/40 text-sm max-w-[200px]">Every Ayah you read waters your garden.</p>
          </motion.div>
        </div>

        {/* Dynamic Flowers */}
        <AnimatePresence>
          {[...Array(12)].map((_, i) => (
            i < flowerCount && (
              <GardenFlower 
                key={i} 
                delay={i * 0.1} 
                scale={0.5 + (Math.random() * 0.5)}
                x={`${(i % 4) * 25 + (Math.random() * 10)}%`}
                y={`${Math.floor(i / 4) * 30 + (Math.random() * 20)}%`}
              />
            )
          ))}
        </AnimatePresence>

        {/* Decorative Grass/Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-500/5 to-transparent" />
      </div>

      {/* Main Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-emerald-100/50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <span className="text-spiritual-dark/30 uppercase tracking-[0.2em] text-[10px] font-black">Quran Completion</span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-black text-spiritual-dark">{personalProgress}%</h2>
                <span className="text-spiritual-emerald text-sm font-bold flex items-center gap-1">
                  <Sparkles size={14} /> +2% today
                </span>
              </div>
            </div>
            <div className="p-4 bg-spiritual-emerald/5 rounded-2xl text-spiritual-emerald">
              <Trophy size={28} />
            </div>
          </div>

          {/* Premium Progress Bar */}
          <div className="relative h-6 bg-emerald-50 rounded-full overflow-hidden mb-10 p-1 border border-emerald-100/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${personalProgress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-spiritual-emerald to-emerald-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_3s_linear_infinite]" />
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-spiritual-dark/30 flex items-center gap-1">
                <Droplets size={10} className="text-blue-400" /> Read
              </span>
              <p className="text-xl font-black text-spiritual-dark">{readAyahs}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-spiritual-dark/30">Left</span>
              <p className="text-xl font-black text-spiritual-dark">{remainingAyahs}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-spiritual-dark/30">Goal</span>
              <p className="text-xl font-black text-spiritual-dark">Juz 30</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pace Indicator */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-8 rounded-[2.5rem] border flex items-center gap-6 transition-all ${
          isAhead 
            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-900' 
            : 'bg-amber-500/5 border-amber-500/10 text-amber-900'
        }`}
      >
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${
          isAhead ? 'bg-spiritual-emerald text-white' : 'bg-amber-500 text-white'
        }`}>
          <Target size={28} />
        </div>
        <div>
          <h4 className="font-black text-lg">{isAhead ? "Spiritual Momentum" : "Need a Push?"}</h4>
          <p className="text-sm opacity-60 leading-relaxed font-medium">
            {isAhead 
              ? "You're surpassing your goal. You'll likely finish the Quran in 22 days at this rate." 
              : "A small effort goes a long way. Read 12 more Ayahs tonight to stay on schedule."}
          </p>
        </div>
      </motion.div>

      {/* Modern Streak Visual */}
      <div className="bg-spiritual-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-2xl italic tracking-tight">Active Streak</h3>
              <p className="text-white/40 text-sm">Consistency is the key to growth.</p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-spiritual-emerald">7</span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-white/30">Days</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-3">
            {[...Array(7)].map((_, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.1 }}
                className={`flex-1 aspect-square rounded-2xl flex items-center justify-center transition-all ${
                  i < 5 
                    ? 'bg-gradient-to-br from-spiritual-emerald to-emerald-600 shadow-lg shadow-emerald-900/40' 
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className={`text-sm font-black ${i < 5 ? 'text-white' : 'text-white/20'}`}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute right-[-20%] top-[-20%] w-[50%] aspect-square bg-spiritual-emerald/10 blur-[100px] rounded-full" />
      </div>
    </div>
  );
};
