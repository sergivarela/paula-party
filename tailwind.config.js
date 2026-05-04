/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta neón de fiesta
        ink: "#08070d",       // fondo casi negro con un toque morado
        ink2: "#12101c",      // fondo de tarjetas
        edge: "#221d33",      // bordes
        neon: {
          pink: "#ff2ec8",
          cyan: "#27e1ff",
          lime: "#caff33",
          purple: "#a14dff",
        },
        ghost: "#7c7693",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui"],
        body: ["var(--font-body)", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace"],
      },
      boxShadow: {
        neon: "0 0 24px rgba(255, 46, 200, 0.45), 0 0 60px rgba(161, 77, 255, 0.25)",
        cyan: "0 0 24px rgba(39, 225, 255, 0.45)",
        lime: "0 0 24px rgba(202, 255, 51, 0.45)",
        deep: "0 12px 40px -10px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "scan-line": "scanLine 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shake": "shake 0.4s linear",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
      },
    },
  },
  plugins: [],
};
