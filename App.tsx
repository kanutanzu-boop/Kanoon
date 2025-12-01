import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { MicIcon, SwitchIcon, ClearIcon, SendIcon } from './components/Icons';
import { translateText } from './services/geminiService';
import { LanguageDirection, TranslationResponse } from './types';

// Debounce helper
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState<LanguageDirection>(LanguageDirection.TH_TO_JP);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced input for auto-translation (laziness factor)
  const debouncedInput = useDebounce(inputText, 800);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence for immediate translation
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
             // Interim results handling if needed, but we mostly care about final for translation
          }
        }
        if (finalTranscript) {
          setInputText(finalTranscript);
        }
      };
    }
  }, []);

  // Handle translation effect
  useEffect(() => {
    const performTranslation = async () => {
      if (!debouncedInput.trim()) {
        setResult(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await translateText(debouncedInput, direction);
        setResult(res);
      } finally {
        setIsLoading(false);
      }
    };

    performTranslation();
  }, [debouncedInput, direction]);

  const toggleDirection = () => {
    setDirection(prev => prev === LanguageDirection.TH_TO_JP ? LanguageDirection.JP_TO_TH : LanguageDirection.TH_TO_JP);
    // Clear input when switching language to avoid confusion, or keep it? 
    // "Laziness" implies keeping it might trigger weird translations, but let's clear for UX safety.
    setInputText('');
    setResult(null);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Browser does not support speech recognition.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Set language based on direction
      recognitionRef.current.lang = direction === LanguageDirection.TH_TO_JP ? 'th-TH' : 'ja-JP';
      recognitionRef.current.start();
    }
  };

  const handleManualTranslate = async () => {
      if (!inputText.trim()) return;
      setIsLoading(true);
      const res = await translateText(inputText, direction);
      setResult(res);
      setIsLoading(false);
  };

  if (showIntro) {
    return <IntroScreen onEnter={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center px-6">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">For KNTX</h1>
        <div className="text-xs text-slate-400 font-light">Real-time Translator</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col gap-6">
        
        {/* Language Switcher */}
        <div className="flex items-center justify-between bg-white rounded-full p-2 shadow-sm border border-slate-100">
          <div className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all ${direction === LanguageDirection.TH_TO_JP ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}>
            Thai 🇹🇭
          </div>
          
          <button 
            onClick={toggleDirection}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors mx-2"
          >
            <SwitchIcon className="w-5 h-5" />
          </button>

          <div className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all ${direction === LanguageDirection.JP_TO_TH ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}>
            Japanese 🇯🇵
          </div>
        </div>

        {/* Input Area */}
        <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={direction === LanguageDirection.TH_TO_JP ? "พิมพ์หรือพูดภาษาไทย..." : "日本語を入力..."}
              className="w-full h-40 p-6 rounded-3xl border-0 bg-white shadow-lg text-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-200 resize-none outline-none transition-all"
            />
            
            {/* Input Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {inputText && (
                <button 
                  onClick={() => { setInputText(''); setResult(null); }}
                  className="p-3 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <ClearIcon className="w-6 h-6" />
                </button>
              )}
              
              <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-md transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-200'
                }`}
              >
                <MicIcon className="w-6 h-6" active={isListening} />
              </button>
            </div>
        </div>

        {/* Result Area */}
        <div className={`transition-all duration-500 ease-out transform ${result || isLoading ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
          {isLoading ? (
            <div className="bg-indigo-50 rounded-3xl p-8 shadow-inner animate-pulse flex flex-col items-center justify-center h-48">
              <div className="flex gap-2 mb-2">
                <div className="w-3 h-3 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0s'}}></div>
                <div className="w-3 h-3 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-indigo-300 font-medium">Translating...</span>
            </div>
          ) : result ? (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
               {result.reading && (
                <div className="text-indigo-200 text-lg mb-2 font-light">
                  {result.reading}
                </div>
               )}
               <div className="text-4xl font-bold leading-normal break-words">
                 {result.translatedText}
               </div>
            </div>
          ) : null}
        </div>

      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-300 text-sm">
        Lazy Translator for KNTX
      </footer>
    </div>
  );
};

export default App;