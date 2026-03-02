import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Prayer } from 'adhan';

export const usePrayerTimes = (coords: { latitude: number; longitude: number } | null) => {
  const [prayerData, setPrayerData] = useState<{
    times: PrayerTimes | null;
    next: { name: string; time: Date; remaining: string } | null;
  }>({ 
    times: null, 
    next: { name: 'Fajr', time: new Date(), remaining: '00:00:00' } 
  });

  useEffect(() => {
    if (!coords) return;

    const timer = setInterval(() => {
      const coordinates = new Coordinates(coords.latitude, coords.longitude);
      const params = CalculationMethod.Other();
      params.fajrAngle = 19;
      params.ishaAngle = 17;
      
      const date = new Date();
      const prayers = new PrayerTimes(coordinates, date, params);
      
      const nextPrayer = prayers.nextPrayer();
      const nextPrayerTime = prayers.timeForPrayer(nextPrayer);
      
      let nextName = "Fajr";
      let targetTime = nextPrayerTime;

      if (!nextPrayerTime || nextPrayer === Prayer.None) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
        targetTime = tomorrowPrayers.fajr;
        nextName = "Fajr";
      } else {
        const prayerNames: Record<string, string> = {
          [Prayer.Fajr]: "Fajr",
          [Prayer.Sunrise]: "Sunrise",
          [Prayer.Dhuhr]: "Dhuhr",
          [Prayer.Asr]: "Asr",
          [Prayer.Maghrib]: "Maghrib",
          [Prayer.Isha]: "Isha",
        };
        nextName = prayerNames[nextPrayer] || "Next";
      }

      if (targetTime) {
        const diff = targetTime.getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        const remaining = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        setPrayerData({
          times: prayers,
          next: { name: nextName, time: targetTime, remaining }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [coords]);

  return prayerData;
};

export const useLocation = () => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    // Use watchPosition for continuous high-accuracy updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setError(null);
      },
      (err) => {
        setError(err.message);
        // Default to Casablanca only if real location fails
        if (!coords) {
          setCoords({ latitude: 33.5731, longitude: -7.5898 });
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { coords, error };
};
