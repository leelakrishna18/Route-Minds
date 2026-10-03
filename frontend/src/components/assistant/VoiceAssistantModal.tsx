import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Bus,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { AssistantMessage } from '../../types';
import { classifyLocalIntent } from '../../utils/assistantIntents';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-init',
      sender: 'assistant',
      text: 'Hello! I am your APSRTC Voice Assistant. You can ask me for bus timings (e.g., "Buses from Eluru to Vijayawada"), emergency help, or complaint tracking. Speak or type below!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Pre-load and cache speech synthesis voices for Safari and Chrome
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition with Safari safeguards
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          handleSend(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning/error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access was not allowed. Please permit microphone access in browser settings to speak, or type below.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition setup error:', err);
      }
    }
  }, [language]);

  // Load suggestions on language switch
  useEffect(() => {
    api.get<any>(`/assistant/suggestions?lang=${language}`)
      .then(res => {
        setSuggestions(res.suggestions || []);
      })
      .catch(() => {});

    if (language === 'te') {
      setMessages(prev => [
        ...prev,
        {
          id: `lang-switched-${Date.now()}`,
          sender: 'assistant',
          text: 'తెలుగు భాషకు మార్చబడింది. ఏలూరు నుండి విజయవాడ, హైదరాబాద్ లేదా విశాఖపట్నం బస్సుల వేళలు తెలుసుకోవడానికి అడగండి!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setQuickReplies(['ఏలూరు నుండి విజయవాడ', 'హైదరాబాద్ బస్సులు', 'మహిళా భద్రత', 'హెల్ప్‌లైన్ నంబర్']);
    } else {
      setQuickReplies(['Eluru to Vijayawada', 'Buses to Hyderabad', 'Morning buses to Vizag', 'Helpline numbers']);
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Safari or type your question below.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.warn('Could not start speech recognition:', e);
        setIsListening(false);
        alert('Could not activate microphone. Please check browser microphone permissions or type your query below.');
      }
    }
  };

  const speakText = (text: string, msgId?: string) => {
    if (!isSpeakingEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Clean URLs, markdown asterisks, hashes, and formatting symbols
      const cleanText = text
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[*#_~`]/g, '')
        .replace(/[•]/g, ', ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      if (language === 'te') {
        const teVoice = voices.find(v => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu'));
        if (teVoice) {
          utterance.voice = teVoice;
          utterance.lang = teVoice.lang;
        } else {
          // Fallback to Indian English or Hindi voice capable of Indian place names
          const inVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN' || v.name.toLowerCase().includes('india'));
          if (inVoice) {
            utterance.voice = inVoice;
            utterance.lang = inVoice.lang;
          } else {
            utterance.lang = 'en-IN';
          }
        }
      } else {
        const enInVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
        if (enInVoice) {
          utterance.voice = enInVoice;
          utterance.lang = 'en-IN';
        } else {
          utterance.lang = 'en-IN';
        }
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      if (msgId) setCurrentlySpeakingId(msgId);

      utterance.onend = () => {
        currentUtteranceRef.current = null;
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        currentUtteranceRef.current = null;
        setCurrentlySpeakingId(null);
      };

      // Workaround for Chrome cancel() race condition
      setTimeout(() => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Prime audio context on user gesture
    if ('speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {}
    }

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Fast local intent check to avoid unnecessary backend calls for casual / unrelated queries
    const localResult = classifyLocalIntent(text, language);
    if (localResult) {
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: AssistantMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: localResult.response,
        intent: localResult.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      if (localResult.quickReplies) {
        setQuickReplies(localResult.quickReplies);
      }
      speakText(localResult.response, botMsgId);
      return;
    }

    setLoading(true);

    try {
      const res: any = await api.post('/assistant/query', {
        message: text,
        language
      });

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: AssistantMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: res.response,
        intent: res.intent,
        data: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      if (res.quick_replies) {
        setQuickReplies(res.quick_replies);
      }
      speakText(res.response, botMsgId);
    } catch (err: any) {
      const errorMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: err.message || 'Connecting to transit engine... Please click Retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full sm:max-w-xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[650px] border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-apsrtc-primary p-3.5 sm:p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm sm:text-base leading-none">APSRTC Voice Assistant</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-[11px] text-purple-200 mt-0.5">Bilingual AI Bus & Travel Guide</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex bg-white/20 p-0.5 rounded-lg border border-white/20 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-white text-purple-900 shadow-sm' : 'text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2 py-0.5 rounded ${language === 'te' ? 'bg-white text-purple-900 shadow-sm' : 'text-white'}`}
              >
                తెలుగు
              </button>
            </div>

            {/* Voice Mute Toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
              title={isSpeakingEnabled ? "Mute Voice" : "Unmute Voice"}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
            >
              {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-300" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              title="Close Assistant"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500 transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Structured Bus Services Card if present */}
                {msg.data && msg.data.services && msg.data.services.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Verified Depot Departures</span>
                      <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono">
                        {msg.data.count} Total
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.data.services.map((svc: any) => (
                        <div key={svc.service_id} className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                              <span className="font-mono text-purple-700">{svc.boarding_time}</span>
                              <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">{svc.bus_type}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Platform: {svc.platform_number || 'Main Platform'}
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice audio playback button for assistant messages */}
                {msg.sender === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentlySpeakingId === msg.id) {
                          window.speechSynthesis.cancel();
                          setCurrentlySpeakingId(null);
                        } else {
                          speakText(msg.text, msg.id);
                        }
                      }}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                        currentlySpeakingId === msg.id
                          ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                      }`}
                      title={currentlySpeakingId === msg.id ? "Stop voice" : "Read aloud (Play voice sound)"}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play Voice Sound</span>
                        </>
                      )}
                    </button>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>
                )}

                {msg.sender === 'user' && (
                  <div className="text-[9px] mt-1.5 text-right text-purple-200">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center space-x-2 text-slate-500 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>Checking APSRTC depot timetable records...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {quickReplies.length > 0 && (
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-semibold text-slate-500 flex-shrink-0">Quick:</span>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qr)}
                className="flex-shrink-0 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200 transition shadow-2xs"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Footer Input & Speech Action */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Speak question"}
              className={`p-2.5 rounded-full transition shadow-sm flex-shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? (language === 'te' ? 'వినబడుతోంది... మాట్లాడండి...' : 'Listening... Speak now...')
                  : (language === 'te' ? 'ప్రశ్న అడగండి (ఉదా: ఏలూరు నుండి విజయవాడ)' : 'Ask a question or speak (e.g. Buses to Vijayawada)...')
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition shadow-sm disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
