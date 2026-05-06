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
      className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/80 backdrop-blur-sm animate-[fadeIn_.18s_ease-out]"
      onClick={onClose}
    >
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pop { 0% { transform: scale(.85); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
      `}</style>

      <div
        className="w-full max-w-sm"
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
    <div className="card border-glow p-8 text-center space-y-5">
      {foto ? (
        <img
          src={foto}
          alt={nombre}
          className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-deep"
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

      <div className="my-2">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
          Apunta este número
        </p>
        <div
          className="font-display font-bold text-neon-lime leading-none"
          style={{
            fontSize: "8rem",
            textShadow:
              "0 0 24px rgba(202,255,51,.55), 0 0 60px rgba(202,255,51,.35)",
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
  const { nombre } = payload || {};
  return (
    <div
      className="rounded-3xl p-8 text-center space-y-4 border-2 border-red-500 bg-gradient-to-b from-red-950/95 to-red-900/80 animate-shake"
      style={{ boxShadow: "0 0 40px rgba(239,68,68,.55)" }}
    >
      <div className="text-6xl animate-pulse-soft">💀</div>
      <p className="font-mono text-xs tracking-[0.3em] text-red-300">
        ALERTA · ESTADO FANTASMA
      </p>
      <h2 className="font-display text-3xl font-black uppercase text-white leading-tight">
        ¡Penalización!
      </h2>
      <p className="text-red-100 text-base leading-snug">
        Has escaneado a <span className="font-bold">{nombre}</span> y ya es un{" "}
        <span className="font-bold uppercase">fantasma</span>.
      </p>
      <p className="text-white font-display text-xl mt-3">
        🍷 Pide un castigo antes de seguir
      </p>
      <button
        onClick={onClose}
        className="w-full mt-4 px-6 py-4 rounded-2xl font-display font-bold text-lg bg-white text-red-700 active:scale-95 transition"
      >
        He cumplido el castigo
      </button>
    </div>
  );
}

function MismatchCard({ payload, onClose }) {
  const { esperado, recibido } = payload || {};
  return (
    <div className="card p-8 text-center space-y-4 border-2 border-amber-400/60">
      <div className="text-5xl">🤔</div>
      <p className="font-mono text-xs tracking-[0.3em] text-amber-300">
        ESE NO ES
      </p>
      <h2 className="font-display text-2xl font-bold">
        El QR no coincide con el acertijo
      </h2>
      <p className="text-white/60 text-sm">
        Esperabas a <span className="text-white font-semibold">{esperado}</span>
        {recibido ? (
          <>
            {" "}y has escaneado a{" "}
            <span className="text-white font-semibold">{recibido}</span>.
          </>
        ) : null}
      </p>
      <button onClick={onClose} className="btn-ghost w-full text-base">
        Volver a intentarlo
      </button>
    </div>
  );
}
