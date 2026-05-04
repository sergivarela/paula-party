// components/GhostOverlay.js
"use client";

/**
 * Overlay de fantasma: cubre toda la pantalla cuando vidas <= 0.
 * Tonos grises, sin botones (un fantasma no actúa).
 */
export default function GhostOverlay({ nombre }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center bg-[#0a0a0c]/95 backdrop-blur-md">
      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1 }
          50% { opacity: .55 }
        }
      `}</style>

      <div className="text-8xl mb-6 grayscale" style={{ animation: "flicker 2.4s ease-in-out infinite" }}>
        👻
      </div>

      <p className="font-mono text-xs tracking-[0.4em] text-zinc-500">
        GAME OVER
      </p>
      <h1 className="font-display text-5xl font-black text-zinc-300 mt-3 uppercase tracking-tight">
        Eres un<br />
        <span className="text-zinc-100">Fantasma</span>
      </h1>

      <p className="text-zinc-500 mt-6 max-w-xs text-sm leading-relaxed">
        Tus tres vidas se han acabado, {nombre}. Sigue en la fiesta, pero ya no
        puedes eliminar a nadie. Sé bueno y entrega tu dígito si Paula te
        encuentra…
      </p>

      <div className="mt-10 flex gap-2">
        <span className="w-2 h-2 rounded-full bg-zinc-600" />
        <span className="w-2 h-2 rounded-full bg-zinc-700" />
        <span className="w-2 h-2 rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}
