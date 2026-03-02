import { useUserStore } from '../store/useUserStore';
import { translations } from '../locales/translations';

export const useTranslations = () => {
  const language = useUserStore((state) => state.language);
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  };
  return { t, language };
};
