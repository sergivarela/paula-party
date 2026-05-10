// components/MissionCard.js
"use client";

import { useState } from "react";

export default function MissionCard({ arma }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="card border-glow p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-cyan">
          TU ARMA
        </p>
        <button
          onClick={() => setVisible((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-white/70 transition active:scale-95"
          aria-label={visible ? "Ocultar arma" : "Mostrar arma"}
        >
          {visible ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              VISIBLE
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              OCULTO
            </>
          )}
        </button>
      </div>
      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
          Reto social
        </p>
        {visible ? (
          <p className="text-white/95 text-base leading-relaxed">
            {arma || <span className="text-white/30 italic">Sin arma definida</span>}
          </p>
        ) : (
          <div
            onClick={() => setVisible(true)}
            className="cursor-pointer select-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center text-white/30 text-sm font-mono tracking-widest"
          >
            ••••••••••••••••••••
          </div>
        )}
      </div>
    </div>
  );
}
