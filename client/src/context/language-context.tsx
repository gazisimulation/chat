import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { enTranslations } from "../i18n/en";
import { trTranslations } from "../i18n/tr";

type Language = "en" | "tr";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  translations: Record<string, any>;
};

const defaultLanguage: Language = "en";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get saved language or use default
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || defaultLanguage;
  });

  // Get translations based on language
  const translations = language === "en" ? enTranslations : trTranslations;

  // Toggle between languages
  const toggleLanguage = () => {
    const newLanguage: Language = language === "en" ? "tr" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  // Update document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
