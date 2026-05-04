// components/AcertijoCard.js
"use client";

/**
 * Tarjeta de acertijo. Paula puntea para "armar" el escaneo: la siguiente
 * lectura se valida contra ESTE invitado.
 */
export default function AcertijoCard({ index, invitado, onPick }) {
  return (
    <button
      onClick={() => onPick(invitado)}
      className="w-full text-left card p-5 active:scale-[.98] transition group"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-neon-pink/15 border border-neon-pink/40 flex items-center justify-center font-display font-bold text-neon-pink">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/40">
            ACERTIJO #{index + 1}
          </p>
          <p className="text-white/95 text-base mt-1 leading-snug">
            {invitado.acertijoParaPaula || "(Acertijo pendiente de configurar)"}
          </p>
          <p className="mt-3 text-xs font-mono text-neon-cyan/80 group-active:text-neon-cyan">
            Tocar para escanear su QR →
          </p>
        </div>
      </div>
    </button>
  );
}
