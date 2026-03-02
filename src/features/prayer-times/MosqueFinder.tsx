import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, ExternalLink, Loader2, RefreshCw, Compass, Target, Map as MapIcon } from 'lucide-react';

interface MosqueFinderProps {
  userCoords: { latitude: number; longitude: number } | null;
  onClose: () => void;
}

export const MosqueFinder: React.FC<MosqueFinderProps> = ({ userCoords, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(Date.now());

  // استخدام نظام البحث المحلي (q=mosque) مع تحديد الموقع (ll) ونسبة التكبير (z)
  // هذا الرابط يضمن أن جوجل تبحث "حولك" فقط ولا تذهب لمدينة أخرى
  const googleMapsUrl = userCoords 
    ? `https://maps.google.com/maps?q=mosque&ll=${userCoords.latitude},${userCoords.longitude}&z=16&t=m&output=embed`
    : `https://maps.google.com/maps?q=mosque&output=embed`;

  // رابط الفتح المباشر للبحث عن المساجد "القريبة مني"
  const directLink = `https://www.google.com/maps/search/mosque+near+me/@${userCoords?.latitude},${userCoords?.longitude},15z`;

  useEffect(() => {
    if (userCoords) {
      setMapKey(Date.now());
    }
  }, [userCoords?.latitude, userCoords?.longitude]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] bg-white dark:bg-[#011610] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between bg-white dark:bg-[#011610] z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-2xl text-spiritual-emerald">
            <MapIcon size={24} className="text-spiritual-accent" />
          </div>
          <div>
            <h3 className="text-xl font-black text-spiritual-dark dark:text-emerald-100 italic">Local Mosque Finder</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Searching your current city area</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMapKey(Date.now())}
            className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-2xl text-spiritual-emerald hover:bg-emerald-100 transition-all"
          >
            <RefreshCw size={20} />
          </button>
          <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-emerald-950 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-slate-50 dark:bg-spiritual-dark">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
            <Loader2 className="animate-spin text-spiritual-emerald mb-4" size={40} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scanning local area...</p>
          </div>
        )}
        
        <iframe
          key={mapKey}
          title="Local Mosque Search"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          onLoad={() => setLoading(false)}
          src={googleMapsUrl}
          className="relative z-10"
        />
      </div>

      {/* Bottom Info Section */}
      <div className="p-6 bg-white dark:bg-[#011a13] border-t border-emerald-100 dark:border-emerald-900/30 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white dark:bg-emerald-950 rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="text-spiritual-accent" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Current Area Locked</p>
                <p className="text-xs font-bold text-spiritual-dark dark:text-emerald-100">
                  {userCoords ? `Nearby GPS: ${userCoords.latitude.toFixed(3)}, ${userCoords.longitude.toFixed(3)}` : "Detecting..."}
                </p>
              </div>
            </div>
            <div className="text-right">
               <div className="flex items-center gap-1 text-[10px] font-black text-spiritual-emerald uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded">
                 <div className="w-1 h-1 bg-spiritual-emerald rounded-full animate-pulse" />
                 Local
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => window.open(directLink, '_blank')}
            className="w-full py-5 bg-spiritual-emerald text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Navigation size={20} /> Search All Masjids in Google Maps
          </button>
        </div>
      </div>
    </motion.div>
  );
};
