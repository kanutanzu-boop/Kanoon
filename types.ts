export enum LanguageDirection {
  TH_TO_JP = 'TH_TO_JP',
  JP_TO_TH = 'JP_TO_TH',
}

export interface TranslationResponse {
  original: string;
  translatedText: string;
  reading?: string; // For Japanese Furigana/Hiragana
}

// Web Speech API Types
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}