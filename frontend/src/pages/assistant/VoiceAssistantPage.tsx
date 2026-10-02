import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Bus,
  Clock,
  CheckCircle2,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { AssistantMessage } from '../../types';

export const VoiceAssistantPage: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your APSRTC Voice Assistant. You can ask me for bus timings (e.g., "What buses go from Eluru to Vijayawada?"), women\'s safety assistance, or how to register a complaint. Speak or type below!',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
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
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Load suggestions
  useEffect(() => {
    api.get<any>(`/assistant/suggestions?lang=${language}`)
      .then(res => setSuggestions(res.suggestions || []))
      .catch(console.error);

    // Update initial welcome message on language switch
    if (language === 'te') {
      setMessages([
        {
          id: 'welcome-te',
          sender: 'assistant',
          text: 'నమస్కారం! నేను మీ APSRTC స్మార్ట్ వాయిస్ అసిస్టెంట్ ను. ఏలూరు నుండి వివిధ ప్రాంతాలకు బస్సుల వేళలు, మహిళా భద్రత లేదా ఫిర్యాదుల నమోదు గురించి నన్ను అడగవచ్చు. మాట్లాడండి లేదా టైప్ చేయండి!',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-en',
          sender: 'assistant',
          text: 'Hello! I am your APSRTC Voice Assistant. You can ask me for bus timings (e.g. "Buses from Eluru to Vijayawada"), women\'s safety assistance, or how to register a complaint. Speak or type below!',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!isSpeakingEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res: any = await api.post('/assistant/query', {
        message: text,
        language
      });

      const botMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        intent: res.intent,
        data: res.data,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(res.response);
    } catch (err: any) {
      const errorMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: err.message || 'Sorry, I encountered an error connecting to the transit assistant engine. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    window.speechSynthesis.cancel();
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>APSRTC Multilingual AI & Rules Engine</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Bilingual Voice Assistant</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant voice and text assistance in English and Telugu (తెలుగు)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-md transition ${language === 'en' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-3 py-1.5 rounded-md transition ${language === 'te' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}
              >
                తెలుగు
              </button>
            </div>

            {/* Audio Speech Toggle */}
            <button
              onClick={() => {
                if (isSpeakingEnabled) window.speechSynthesis.cancel();
                setIsSpeakingEnabled(!isSpeakingEnabled);
              }}
              className={`p-2 rounded-lg border border-slate-200 transition ${isSpeakingEnabled ? 'text-purple-600 bg-purple-50' : 'text-slate-400 bg-white'}`}
              title={isSpeakingEnabled ? 'Audio synthesis active (click to mute)' : 'Speech audio muted'}
            >
              {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear conversation */}
            <button
              onClick={handleClearHistory}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 bg-white transition"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 text-xs py-1">Quick prompts:</span>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sug)}
              className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 px-3 py-1 rounded-full text-xs transition shadow-2xs"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Conversation Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-[460px] overflow-y-auto space-y-4 flex flex-col">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-purple-700 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Structured Bus Services Card if attached */}
                {m.data?.services && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-slate-900">
                    <div className="font-bold flex items-center text-purple-900">
                      <Bus className="w-3.5 h-3.5 mr-1" />
                      Departures from Depot Board:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.data.services.map((srv: any, i: number) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-bold text-purple-700">{srv.boarding_time}</span>
                            <span className="text-slate-500 ml-1.5 font-medium">{srv.bus_type}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{srv.platform_number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-xl w-fit">
              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching verified records...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to speak'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              language === 'te'
                ? 'బస్సుల వేళల గురించి మాట్లాడండి లేదా టైప్ చేయండి...'
                : 'Ask a question or speak in English / Telugu...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || loading}
            className="p-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl transition disabled:opacity-50"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
