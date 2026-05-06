// components/GhostOverlay.js
"use client";

import QRCode from "react-qr-code";

export default function GhostOverlay({ nombre, userId }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center bg-[#0a0a0c]/95 backdrop-blur-md overflow-y-auto py-10">
      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1 }
          50% { opacity: .55 }
        }
      `}</style>

      <div className="text-7xl mb-4 grayscale" style={{ animation: "flicker 2.4s ease-in-out infinite" }}>
        👻
      </div>

      <p className="font-mono text-xs tracking-[0.4em] text-zinc-500">
        GAME OVER
      </p>
      <h1 className="font-display text-4xl font-black text-zinc-300 mt-2 uppercase tracking-tight">
        Eres un <span className="text-zinc-100">Fantasma</span>
      </h1>

      <p className="text-zinc-500 mt-4 max-w-xs text-sm leading-relaxed">
        Ya no puedes eliminar a nadie, {nombre}. Pero si Paula te encuentra,
        enséñale este QR para que consiga tu dígito.
      </p>

      <div className="mt-6 p-4 bg-white rounded-2xl shadow-deep">
        <QRCode
          value={userId}
          size={180}
          bgColor="#ffffff"
          fgColor="#08070d"
          level="M"
        />
      </div>

      <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 mt-4">
        TU QR · ENSÉÑASELO A PAULA
      </p>
    </div>
  );
}
