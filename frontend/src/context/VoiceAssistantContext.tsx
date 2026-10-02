import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { VoiceAssistantModal } from '../components/assistant/VoiceAssistantModal';
import { FloatingVoiceButton } from '../components/assistant/FloatingVoiceButton';

interface VoiceAssistantContextType {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const toggleAssistant = () => setIsOpen((prev) => !prev);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <VoiceAssistantContext.Provider value={{ isOpen, openAssistant, closeAssistant, toggleAssistant }}>
      {children}
      <VoiceAssistantModal isOpen={isOpen} onClose={closeAssistant} />
      {!isAdminRoute && <FloatingVoiceButton onClick={openAssistant} />}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return ctx;
};
