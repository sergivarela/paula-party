// components/MissionCard.js
"use client";

export default function MissionCard({ arma }) {
  return (
    <div className="card border-glow p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-cyan">
          TU ARMA
        </p>
        <span className="text-[10px] font-mono text-white/40">CLASIFICADO</span>
      </div>
      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
          Reto social
        </p>
        <p className="text-white/95 text-base leading-relaxed">
          {arma || (
            <span className="text-white/30 italic">Sin arma definida</span>
          )}
        </p>
      </div>
    </div>
  );
}
