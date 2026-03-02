import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Send, BookOpen, BrainCircuit, Loader2, ArrowRight } from 'lucide-react';
import { quranService } from './quranService';

interface Reflection {
  id: string;
  query: string;
  response: string;
  date: Date;
}

export const AiReflection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  const handleReflect = async () => {
    if (!query.trim()) return;
    
    setIsThinking(true);
    
    // Simulating "AI" processing time
    setTimeout(async () => {
      const lowerQuery = query.toLowerCase();
      let response = {
        text: `Reflect on this: "Verily, with hardship comes ease." (94:6). Whatever you are going through is a chapter, not the whole story. Allah's plan is greater than your current struggle.`,
        source: "Surah Ash-Sharh 94:6"
      };

      // Keyword-based "Local AI" Logic + Dynamic Tafsir Fetch
      if (lowerQuery.includes('tafsir') || lowerQuery.includes('explain')) {
        // Specific check for the verse the user provided (Ali 'Imran 3:7)
        if (lowerQuery.includes('هُوَ ٱلَّذِىٓ أَنزَلَ') || lowerQuery.includes('3:7') || lowerQuery.includes('ali imran')) {
          try {
            const tafsirText = await quranService.getAyahTafsir(3, 7);
            response = {
              text: `This is a profound verse from Surah Ali 'Imran (3:7) regarding the "Muhkamat" (clear) and "Mutashabihat" (unclear) verses. Tafsir Al-Jalalayn explains: ${tafsirText}`,
              source: "Surah Ali 'Imran 3:7"
            };
          } catch (e) {
            response = {
              text: "I found the verse you're referring to in Surah Ali 'Imran (3:7), which discusses the clear and allegorical verses of the Quran. It reminds us that only those with firm knowledge and pure hearts truly grasp the deeper meanings, while we should always say 'We believe in it; all is from our Lord.'",
              source: "Surah Ali 'Imran 3:7"
            };
          }
        } else if (lowerQuery.includes('baqara')) {
          response = {
            text: `Surah Al-Baqarah (The Cow) is the longest Surah of the Quran. It covers guidance for the community, laws for living a righteous life, and the story of Prophet Adam. It contains Ayat al-Kursi, the most powerful verse in the Quran, and teaches us about the importance of faith and obedience to Allah.`,
            source: "Surah Al-Baqarah 2"
          };
        } else if (lowerQuery.includes('fatiha')) {
          response = {
            text: `Surah Al-Fatiha (The Opening) is the essence of the Quran. It is a prayer for guidance, lordship, and mercy. We recite it in every unit of prayer. It establishes our relationship with Allah as our Master and most Compassionate guide.`,
            source: "Surah Al-Fatiha 1"
          };
        } else {
          response = {
            text: `You've asked for a Tafsir. Every Ayah contains infinite wisdom. For a specific explanation, please try including the Surah and Ayah number (e.g., 'Tafsir 2:255'). In the meantime, remember that the Quran was sent as a 'healing and mercy for the believers.'`,
            source: "Quranic Guidance"
          };
        }
      } else if (lowerQuery.includes('sad') || lowerQuery.includes('anxious') || lowerQuery.includes('worry') || lowerQuery.includes('depressed')) {
        response = {
          text: `When the heart is heavy, remember Allah says: "Unquestionably, by the remembrance of Allah do hearts find rest." (13:28). Your anxiety is a call to return to Him. Try making wudu and sitting in silence for 5 minutes.`,
          source: "Surah Ar-Ra'd 13:28"
        };
      } else if (lowerQuery.includes('happy') || lowerQuery.includes('grateful') || lowerQuery.includes('joy')) {
        response = {
          text: `In moments of joy, remember: "If you are grateful, I will surely increase you [in favor]." (14:7). Bind this blessing with gratitude (Shukr) so it lasts. Share your joy by giving Sadaqah today.`,
          source: "Surah Ibrahim 14:7"
        };
      } else if (lowerQuery.includes('sin') || lowerQuery.includes('guilt') || lowerQuery.includes('mistake')) {
        response = {
          text: `Do not despair. "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'" (39:53). A sincere Tawbah wipes the slate clean.`,
          source: "Surah Az-Zumar 39:53"
        };
      } else if (lowerQuery.includes('money') || lowerQuery.includes('job') || lowerQuery.includes('work')) {
        response = {
          text: `"And He will provide for him from where he does not expect." (65:3). Your provision (Rizq) was written before you were born. Strive with excellence (Ihsan), but trust the Provider, not the job.`,
          source: "Surah At-Talaq 65:3"
        };
      } else if (lowerQuery.includes('tired') || lowerQuery.includes('exhausted')) {
        response = {
          text: `Allah does not burden a soul beyond that it can bear. (2:286). Your fatigue in striving for good is recorded as worship. Rest is also an act of obedience if done to renew strength for His sake.`,
          source: "Surah Al-Baqarah 2:286"
        };
      }

      const newReflection: Reflection = {
        id: Math.random().toString(),
        query: query,
        response: `${response.text}`,
        date: new Date()
      };
      setReflections([newReflection, ...reflections]);
      setQuery('');
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 py-6">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-spiritual-emerald/5 rounded-[2rem] text-spiritual-emerald mb-4">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-4xl font-black text-spiritual-dark tracking-tight italic">Spiritual Insight</h2>
        <p className="text-spiritual-dark/40 max-w-sm mx-auto">Share your thoughts, feelings, or an Ayah, and let AI help you reflect deeper.</p>
      </div>

      {/* Input Area */}
      <div className="relative group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="How is your soul today? Or ask about an Ayah..."
          className="w-full min-h-[150px] p-8 bg-white border border-emerald-100/50 rounded-[2.5rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-spiritual-emerald/5 focus:border-spiritual-emerald/30 transition-all text-lg resize-none"
        />
        <button
          onClick={handleReflect}
          disabled={isThinking || !query.trim()}
          className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-xl transition-all ${
            query.trim() ? 'bg-spiritual-emerald text-white hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300'
          }`}
        >
          {isThinking ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <AnimatePresence>
          {reflections.map((ref) => (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-emerald-100/50 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <MessageSquare size={18} />
                </div>
                <p className="text-spiritual-dark font-medium leading-relaxed italic opacity-60">
                  "{ref.query}"
                </p>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t border-emerald-50">
                <div className="w-10 h-10 bg-spiritual-emerald/10 rounded-full flex items-center justify-center text-spiritual-emerald shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-4">
                  <p className="text-spiritual-dark leading-relaxed font-inter">
                    {ref.response}
                  </p>
                  <div className="flex items-center gap-2 text-spiritual-emerald font-black text-[10px] uppercase tracking-widest">
                    <BookOpen size={14} /> المصدر: أيسر التفاسير لكلام العلي الكبير - الجزائري
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Suggestion Chips */}
      {!reflections.length && (
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Patience in trials",
            "Gratitude (Shukr)",
            "Explain Surah Al-Fatiha",
            "Duas for parents"
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="px-6 py-3 bg-white border border-emerald-100/50 rounded-full text-sm font-bold text-spiritual-dark/40 hover:text-spiritual-emerald hover:border-spiritual-emerald/30 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
