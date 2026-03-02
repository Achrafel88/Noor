import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Navigation2, MapPin, RefreshCw, Layers, Monitor, Smartphone, CheckCircle2 } from 'lucide-react';
import { Qibla, Coordinates } from 'adhan';
import { useLocation } from '../../hooks/usePrayerTimes';

declare const L: any; // Leaflet global

export const QiblaCompass: React.FC = () => {
  const { coords } = useLocation();
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [mode, setMode] = useState<'sensor' | 'map'>('sensor');
  const [sensorState, setSensorStatus] = useState<'detecting' | 'active' | 'unavailable'>('detecting');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (coords) {
      const q = Qibla(new Coordinates(coords.latitude, coords.longitude));
      setQiblaDirection(q);
      
      // If we are in Map mode and coordinates just arrived, init/update map
      if (mode === 'map') initMap();
    }
  }, [coords, mode]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;
      if ((e as any).webkitCompassHeading !== undefined) {
        compassHeading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && (e as any).absolute === true) {
        compassHeading = (360 - e.alpha) % 360;
      }

      if (compassHeading !== null) {
        setHeading(compassHeading);
        setSensorStatus('active');
        const needleRot = (qiblaDirection - compassHeading + 360) % 360;
        setIsAligned(needleRot < 5 || needleRot > 355);
      }
    };

    const timeout = setTimeout(() => {
      if (heading === null) {
        setSensorStatus('unavailable');
        setMode('map'); // Auto-switch to map if laptop/sensors missing
      }
    }, 2500);

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation);
      clearTimeout(timeout);
    };
  }, [qiblaDirection]);

  const initMap = () => {
    if (!coords || !mapRef.current || leafletMap.current) return;

    // Use standard Leaflet with a high-quality satellite provider
    leafletMap.current = L.map(mapRef.current).setView([coords.latitude, coords.longitude], 18);
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }).addTo(leafletMap.current);

    const kaaba = [21.4225, 39.8262];
    const user = [coords.latitude, coords.longitude];

    // Icon for User
    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    L.marker(user, { icon: userIcon }).addTo(leafletMap.current);

    // Qibla Line (Great Circle approximately)
    const qiblaLine = L.polyline([user, kaaba], {
      color: '#10B981',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
      lineCap: 'round'
    }).addTo(leafletMap.current);

    // Zoom to fit or keep centered
    leafletMap.current.panTo(user);
  };

  const needleRotation = qiblaDirection - (heading || 0);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-6 px-4 max-w-lg mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-spiritual-emerald/5 rounded-2xl text-spiritual-emerald">
          <Compass size={32} />
        </div>
        <h2 className="text-3xl font-black text-spiritual-dark tracking-tight italic">Qibla Finder</h2>
        <p className="text-spiritual-dark/40 text-sm max-w-[300px] mx-auto leading-relaxed">
          {mode === 'sensor' 
            ? "Point your phone's top towards the Kaaba icon."
            : "Automatic Detection: Follow the green line from your current location."}
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-emerald-50/50 p-1.5 rounded-2xl w-full border border-emerald-100/50">
        <button 
          onClick={() => setMode('sensor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'sensor' ? 'bg-spiritual-emerald text-white shadow-lg' : 'text-spiritual-emerald/60 hover:bg-emerald-100/50'}`}
        >
          <Smartphone size={14} /> Sensor Mode
        </button>
        <button 
          onClick={() => setMode('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'map' ? 'bg-spiritual-emerald text-white shadow-lg' : 'text-spiritual-emerald/60 hover:bg-emerald-100/50'}`}
        >
          <Monitor size={14} /> Building View
        </button>
      </div>

      <div className="relative w-full aspect-square md:w-96 md:h-96 flex items-center justify-center">
        {mode === 'sensor' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence>
              {isAligned && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              )}
            </AnimatePresence>

            <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 shadow-2xl ${isAligned ? 'border-spiritual-accent' : 'border-emerald-100/50'}`} />
            
            <div className="absolute inset-6 rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `rotate(${- (heading || 0)}deg)` }}>
                 <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[12px] font-black text-spiritual-emerald">N</span>
                 <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-300">S</span>
              </div>
              <div className="opacity-[0.03] text-spiritual-dark"><Compass size={200} /></div>
            </div>

            <motion.div 
              animate={{ rotate: sensorState === 'unavailable' ? qiblaDirection : needleRotation }}
              transition={{ type: "spring", stiffness: 40, damping: 12 }}
              className="relative w-full h-full flex items-center justify-center z-10"
            >
              <div className="relative w-3 h-48">
                <motion.div 
                  animate={{ backgroundColor: isAligned ? '#10B981' : '#043927', scale: isAligned ? 1.2 : 1 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 p-3 rounded-2xl text-white shadow-2xl z-20"
                >
                   <Navigation2 size={24} fill="currentColor" />
                </motion.div>
                <div className={`w-full h-1/2 rounded-t-full shadow-lg transition-colors duration-500 ${isAligned ? 'bg-spiritual-accent' : 'bg-spiritual-emerald'}`} />
                <div className="w-full h-1/2 bg-slate-100 rounded-b-full" />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="w-full h-full rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100">
            <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
            {!coords && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-[10] p-8 text-center">
                <RefreshCw size={32} className="text-spiritual-emerald animate-spin mb-4" />
                <h4 className="font-black text-spiritual-dark">Locating Building...</h4>
                <p className="text-xs text-slate-400 mt-2">Please ensure GPS is enabled for automatic detection.</p>
              </div>
            )}
            <div className="absolute top-6 left-6 z-[10] bg-spiritual-emerald text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
               <Layers size={14} /> Satellite View
            </div>
          </div>
        )}
      </div>

      <div className={`w-full px-10 py-5 rounded-[2.5rem] border flex items-center justify-between transition-all duration-500 ${isAligned ? 'bg-spiritual-accent text-white shadow-xl shadow-emerald-500/20 border-spiritual-accent' : 'bg-white border-emerald-100 text-spiritual-emerald shadow-sm'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Qibla Direction</span>
          <span className="text-3xl font-black tracking-tighter">{Math.round(qiblaDirection)}° <span className="text-sm font-bold opacity-40">N</span></span>
        </div>
        {isAligned && (
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <CheckCircle2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Aligned</span>
          </div>
        )}
      </div>

      {coords && (
        <div className="flex items-center gap-2 text-[9px] font-bold text-spiritual-dark/30 uppercase tracking-[0.2em]">
          <MapPin size={10} className="text-spiritual-emerald" /> 
          {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
};
