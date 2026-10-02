import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    platformName: "APSRTC Smart Passenger Platform",
    tagline: "Official Unified Passenger Information System",
    home: "Home",
    busSchedules: "Bus Schedules",
    womensSafety: "Women's Safety",
    complaints: "Complaints Portal",
    smsRoute: "SMS Route Info",
    voiceAssistant: "Voice Assistant",
    dashboard: "Dashboard",
    adminPortal: "Admin Portal",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    welcome: "Welcome",
    from: "From (Source)",
    to: "To (Destination)",
    travelDate: "Travel Date",
    searchBuses: "Search Buses",
    emergencyHelpline: "Emergency Helpline 112",
    contactEnquiry: "APSRTC Enquiry: 08812-230303",
  },
  te: {
    platformName: "APSRTC స్మార్ట్ ప్రయాణీకుల వేదిక",
    tagline: "ఆంధ్రప్రదేశ్ రాష్ట్ర రోడ్డు రవాణా సంస్థ అధికారిక డిజిటల్ సేవలు",
    home: "ప్రారంభం",
    busSchedules: "బస్సు వేళలు",
    womensSafety: "మహిళా భద్రత",
    complaints: "ఫిర్యాదుల విభాగం",
    smsRoute: "SMS రూట్ సమాచారం",
    voiceAssistant: "వాయిస్ అసిస్టెంట్",
    dashboard: "డాష్‌బోర్డ్",
    adminPortal: "అడ్మిన్ పోర్టల్",
    login: "లాగిన్",
    register: "రిజిస్ట్రేషన్",
    logout: "లాగ్ అవుట్",
    welcome: "స్వాగతం",
    from: "బయలుదేరు స్థలం",
    to: "చేరుకొను స్థలం",
    travelDate: "ప్రయాణ తేదీ",
    searchBuses: "బస్సుల శోధన",
    emergencyHelpline: "అత్యవసర సహాయం 112",
    contactEnquiry: "APSRTC ఎంక్వైరీ: 08812-230303",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('apsrtc_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('apsrtc_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
