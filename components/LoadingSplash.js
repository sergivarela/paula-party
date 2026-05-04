// components/LoadingSplash.js
"use client";

export default function LoadingSplash({ message = "Cargando…" }) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 gap-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-neon-pink/30" />
        <div className="absolute inset-0 rounded-full border-t-2 border-neon-pink animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-2 border-neon-cyan/20 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🎂
        </div>
      </div>
      <p className="font-mono text-xs tracking-[0.25em] text-white/60">
        {message.toUpperCase()}
      </p>
    </main>
  );
}
