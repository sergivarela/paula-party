// components/AcertijoCard.js
"use client";

export default function AcertijoCard({ index, invitado, onPick }) {
  const escaneado = invitado.qrEscaneado;

  return (
    <button
      onClick={() => onPick(invitado)}
      className={`w-full text-left card p-5 active:scale-[.98] transition group ${
        escaneado ? "border border-neon-lime/30 bg-neon-lime/5" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold ${
            escaneado
              ? "bg-neon-lime/20 border border-neon-lime/50 text-neon-lime text-xl"
              : "bg-neon-pink/15 border border-neon-pink/40 text-neon-pink"
          }`}
        >
          {escaneado ? "✓" : String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-mono text-[10px] tracking-[0.25em] ${escaneado ? "text-neon-lime/50" : "text-white/40"}`}>
            {escaneado ? `ENCONTRADO · DÍGITO ${invitado.digitoAsignado}` : `ACERTIJO #${index + 1}`}
          </p>
          <p className={`text-base mt-1 leading-snug ${escaneado ? "text-white/50" : "text-white/95"}`}>
            {invitado.acertijoParaPaula || "(Acertijo pendiente de configurar)"}
          </p>
          <p className={`mt-3 text-xs font-mono ${escaneado ? "text-neon-lime/50" : "text-neon-cyan/80 group-active:text-neon-cyan"}`}>
            {escaneado ? "Tocar para ver de nuevo →" : "Tocar para escanear su QR →"}
          </p>
        </div>
      </div>
    </button>
  );
}
