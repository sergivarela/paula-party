// components/Hearts.js
"use client";

/**
 * Renderiza N corazones (3 por defecto). Los `vidas` activos se muestran
 * en color y con animación de latido; los perdidos quedan apagados.
 */
export default function Hearts({ vidas = 0, total = 3, size = "text-4xl" }) {
  const safe = Math.max(0, Math.min(total, vidas));
  return (
    <div className="flex items-center gap-2" aria-label={`${safe} de ${total} vidas`}>
      {Array.from({ length: total }).map((_, i) => {
        const activo = i < safe;
        return (
          <span
            key={i}
            className={`${size} leading-none transition-all duration-300 ${
              activo
                ? "heartbeat drop-shadow-[0_0_10px_rgba(255,46,200,0.6)]"
                : "grayscale opacity-25"
            }`}
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            {activo ? "❤️" : "🖤"}
          </span>
        );
      })}
    </div>
  );
}
