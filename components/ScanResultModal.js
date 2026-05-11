// components/ScanResultModal.js
"use client";

import { useEffect } from "react";

/**
 * Modal de resultado tras escaneo. Tres variantes:
 * - kind="success"  -> dígito desbloqueado
 * - kind="ghost"    -> PENALIZACIÓN, fantasma escaneado
 * - kind="mismatch" -> el QR no coincide con el acertijo elegido
 */
export default function ScanResultModal({ kind, payload, onClose }) {
  // Tap en cualquier sitio (excepto botón) cierra
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!kind) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-5 py-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-[fadeIn_.18s_ease-out]"
      onClick={onClose}
    >
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pop { 0% { transform: scale(.85); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
      `}</style>

      <div
        className="w-full max-w-sm my-auto"
        style={{ animation: "pop .25s cubic-bezier(.2,.8,.2,1.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {kind === "success" && <SuccessCard payload={payload} onClose={onClose} />}
        {kind === "ghost" && <GhostCard payload={payload} onClose={onClose} />}
        {kind === "mismatch" && <MismatchCard payload={payload} onClose={onClose} />}
      </div>
    </div>
  );
}

function SuccessCard({ payload, onClose }) {
  const { nombre, digito, foto, mensaje } = payload || {};
  return (
    <div className="card border-glow p-6 text-center space-y-4">
      {foto ? (
        <img
          src={foto}
          alt={nombre}
          className="w-full rounded-2xl object-contain shadow-deep"
        />
      ) : (
        <div className="text-5xl">✨</div>
      )}
      <p className="font-mono text-xs tracking-[0.3em] text-neon-lime">
        DÍGITO DESBLOQUEADO
      </p>
      <h2 className="font-display text-2xl font-bold">
        ¡Encontraste a {nombre}!
      </h2>

      {mensaje && (
        <p className="text-white/80 text-sm leading-relaxed italic border-l-2 border-neon-purple/50 pl-3 text-left">
          "{mensaje}"
        </p>
      )}

      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
          Apunta este número
        </p>
        <div
          className="font-display font-bold text-neon-lime leading-none"
          style={{
            fontSize: "3.5rem",
            textShadow: "0 0 16px rgba(202,255,51,.55), 0 0 40px rgba(202,255,51,.35)",
          }}
        >
          {digito}
        </div>
      </div>

      <button onClick={onClose} className="btn-neon w-full text-lg">
        Seguir buscando →
      </button>
    </div>
  );
}

function GhostCard({ payload, onClose }) {
  const { nombre, digito, foto, mensaje } = payload || {};
  return (
    <div
      className="rounded-3xl p-8 text-center space-y-4 border-2 border-red-500 bg-gradient-to-b from-red-950/95 to-red-900/80"
      style={{ boxShadow: "0 0 40px rgba(239,68,68,.55)" }}
    >
      {foto ? (
        <img
          src={foto}
          alt={nombre}
          className="w-full rounded-2xl object-contain opacity-70 grayscale shadow-deep"
        />
      ) : (
        <div className="text-6xl">💀</div>
      )}
      <p className="font-mono text-xs tracking-[0.3em] text-red-300">
        ALERTA · ESTADO FANTASMA
      </p>
      <h2 className="font-display text-3xl font-black uppercase text-white leading-tight">
        ¡Penalización!
      </h2>
      <p className="text-red-100 text-base leading-snug">
        <span className="font-bold">{nombre}</span> ya es un{" "}
        <span className="font-bold uppercase">fantasma</span>. Toca un trago de castigo.
      </p>

      {mensaje && (
        <p className="text-red-200/80 text-sm leading-relaxed italic border-l-2 border-red-400/40 pl-3 text-left">
          "{mensaje}"
        </p>
      )}

      <div className="pt-1">
        <p className="text-red-300/60 text-xs uppercase tracking-widest mb-1">Su dígito</p>
        <div
          className="font-display font-bold text-white leading-none"
          style={{ fontSize: "3.5rem", textShadow: "0 0 20px rgba(239,68,68,.6)" }}
        >
          {digito}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 px-6 py-4 rounded-2xl font-display font-bold text-lg bg-white text-red-700 active:scale-95 transition"
      >
        He cumplido el castigo
      </button>
    </div>
  );
}

const FRASES_MISMATCH = [
  { emoji: "🥶", etiqueta: "¡FRÍO, FRÍO!", texto: "Ese no es. Vuelve a leer el acertijo con calma." },
  { emoji: "🔍", etiqueta: "SIGUE BUSCANDO", texto: "Casi… pero no. El que buscas sigue por ahí escondido." },
  { emoji: "🌀", etiqueta: "¡DESPISTE!", texto: "Has escaneado al equivocado. ¿Seguro que has leído bien el acertijo?" },
  { emoji: "👀", etiqueta: "OJO AL DATO", texto: "No es ese. Abre bien los ojos y vuelve a intentarlo." },
  { emoji: "🎯", etiqueta: "FALLASTE", texto: "Cerca… o quizás no tanto. Sigue buscando." },
  { emoji: "🕵️", etiqueta: "PISTA EQUIVOCADA", texto: "Ese no era tu objetivo. El que buscas anda por aquí." },
];

function MismatchCard({ onClose }) {
  const frase = FRASES_MISMATCH[Math.floor(Math.random() * FRASES_MISMATCH.length)];
  return (
    <div className="card p-8 text-center space-y-4 border-2 border-amber-400/60">
      <div className="text-5xl">{frase.emoji}</div>
      <p className="font-mono text-xs tracking-[0.3em] text-amber-300">
        {frase.etiqueta}
      </p>
      <h2 className="font-display text-2xl font-bold">
        QR incorrecto
      </h2>
      <p className="text-white/60 text-sm leading-relaxed">
        {frase.texto}
      </p>
      <button onClick={onClose} className="btn-ghost w-full text-base">
        Volver a intentarlo
      </button>
    </div>
  );
}
