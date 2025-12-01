import React from 'react';

interface IntroScreenProps {
  onEnter: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white text-center">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">For KNTX</h1>
        
        <p className="text-xl font-medium leading-relaxed mb-8 opacity-90">
          "แอพนี้สร้างขึ้นเพราะความขี้เกียจล้วนๆ <br/>
          จงมาเป็นคนขี้เกียจก้วยกันเถอะ 555"
        </p>

        <button
          onClick={onEnter}
          className="group relative px-8 py-3 bg-white text-purple-600 font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">เริ่มเลย! (Start)</span>
        </button>
      </div>
    </div>
  );
};