const BASE_URL = 'https://api.alquran.cloud/v1';
const QURAN_COM_API = 'https://api.quran.com/api/v4';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  surah: Surah;
  audio?: string;
}

export const RECITERS = [
  { id: 'MaherAlMuaiqly128kbps', name: 'Maher Al-Muaiqly' },
  { id: 'Abdul_Basit_Murattal_128kbps', name: 'Abdul Basit' },
  { id: 'Alafasy_128kbps', name: 'Mishary Rashid Alafasy' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'Abdurrahman As-Sudais' },
  { id: 'Minshawi_Murattal_128kbps', name: 'Mohamed Siddiq Al-Minshawi' },
  { id: 'Hani_Rifai_192kbps', name: 'Hani ar-Rifai' },
  { id: 'Saad_Al_Ghamidi_128kbps', name: 'Saad Al-Ghamidi' }
];

export const RIWAYATS = [
  { id: 'quran-uthmani', name: 'Riwayat Hafs (حفص)', lang: 'ar' },
  { id: 'quran-warsh', name: 'Riwayat Warsh (ورش)', lang: 'ar' },
  { id: 'en.sahih', name: 'English (Sahih)', lang: 'en' },
  { id: 'fr.hamidullah', name: 'Français (Hamidullah)', lang: 'fr' }
];

export const quranService = {
  async getSurahs(): Promise<Surah[]> {
    try {
      const response = await fetch(`${BASE_URL}/surah`);
      const data = await response.json();
      return data.data || [];
    } catch (e) { return []; }
  },

  async getPageDetail(pageNumber: number, reciter: string, edition: string = 'quran-uthmani'): Promise<{ayahs: Ayah[], page: number}> {
    try {
      const response = await fetch(`${BASE_URL}/page/${pageNumber}/${edition}`);
      const data = await response.json();
      if (!data.data || !data.data.ayahs) throw new Error("No data");
      
      const ayahs = data.data.ayahs.map((a: any) => {
        const sNum = a.surah?.number || 1;
        return {
          ...a,
          surah: a.surah || { number: 1, name: "" },
          audio: `https://everyayah.com/data/${reciter}/${String(sNum).padStart(3, '0')}${String(a.numberInSurah).padStart(3, '0')}.mp3`
        };
      });
      return { ayahs, page: pageNumber };
    } catch (e) { throw e; }
  },

  async getHizbDetail(hizbNumber: number, reciter: string, edition: string = 'quran-uthmani'): Promise<Ayah[]> {
    // محاولة أولى من Al Quran Cloud
    try {
      const response = await fetch(`${BASE_URL}/hizb/${hizbNumber}/${edition}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.ayahs && data.data.ayahs.length > 0) {
          return data.data.ayahs.map((a: any) => {
            const sNum = a.surah?.number || 1;
            return {
              ...a,
              surah: a.surah || { number: sNum, name: "" },
              audio: `https://everyayah.com/data/${reciter}/${String(sNum).padStart(3, '0')}${String(a.numberInSurah).padStart(3, '0')}.mp3`
            };
          });
        }
      }
    } catch (e) {
      console.warn("Al Quran Cloud Hizb fetch failed, trying Quran.com...", e);
    }

    // خطة بديلة من Quran.com (أكثر استقراراً)
    try {
      const surahs = await quranService.getSurahs();
      const surahMap = new Map(surahs.map(s => [s.number, s.name]));
      const qcomResp = await fetch(`${QURAN_COM_API}/verses/by_hizb/${hizbNumber}?language=ar&words=false&fields=text_uthmani,chapter_id,verse_number,page_number&per_page=500`);
      const qcomData = await qcomResp.json();
      
      if (qcomData.verses && qcomData.verses.length > 0) {
        return qcomData.verses.map((v: any) => ({
          number: v.id,
          text: v.text_uthmani,
          numberInSurah: v.verse_number,
          page: v.page_number,
          surah: { 
            number: v.chapter_id, 
            name: surahMap.get(v.chapter_id) || `سورة ${v.chapter_id}` 
          },
          audio: `https://everyayah.com/data/${reciter}/${String(v.chapter_id).padStart(3, '0')}${String(v.verse_number).padStart(3, '0')}.mp3`
        }));
      }
    } catch (e) {
      console.error("All Hizb sources failed", e);
    }
    
    return [];
  },

  async getSurahStartPage(number: number): Promise<number> {
    try {
      const response = await fetch(`${BASE_URL}/surah/${number}/quran-simple`);
      const data = await response.json();
      return data.data.ayahs[0].page;
    } catch (e) { return 1; }
  },

  async getAyahTafsir(surah: number, ayah: number): Promise<string> {
    try {
      const response = await fetch(`${QURAN_COM_API}/tafsirs/16/by_ayah/${surah}:${ayah}`);
      const data = await response.json();
      return data.tafsir?.text?.replace(/<[^>]*>?/gm, '') || "التفسير غير متوفر حالياً";
    } catch (e) { return "تعذر جلب التفسير"; }
  }
};
