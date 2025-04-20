import { useLanguage } from "@/context/language-context";

// Type for translation parameters
type TranslationParams = {
  [key: string]: string | number;
};

// Translation function with string interpolation
function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  
  return Object.entries(params).reduce((result, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return result.replace(regex, String(value));
  }, text);
}

// Get a value from nested object using dot notation path
function getValue(obj: Record<string, any>, path: string): string {
  return path.split('.').reduce((result, key) => {
    return result && result[key] !== undefined ? result[key] : '';
  }, obj);
}

// Hook for translations
export function useTranslation() {
  const { translations } = useLanguage();
  
  // Translation function
  const t = (key: string, params?: TranslationParams): string => {
    const value = getValue(translations, key);
    
    if (!value) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    return interpolate(value, params);
  };
  
  return { t };
}
