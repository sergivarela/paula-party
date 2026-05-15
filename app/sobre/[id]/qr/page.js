// app/sobre/[id]/qr/page.js
"use client";

import { useParams } from "next/navigation";
import QRCode from "react-qr-code";

const BASE_URL = "https://paula-party.vercel.app";

export default function QrImprimirPage() {
  const { id } = useParams();
  const url = `${BASE_URL}/sobre/${id}`;

  const nombres = {
    "carla-ruiz": "Carla Ruiz",
    "celia-folla": "Celia Folla",
  };
  const nombre = nombres[id] || id;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-8 py-10 gap-8">
      <div className="text-center space-y-1">
        <p className="font-mono text-[10px] tracking-[0.4em] text-neon-pink">
          QR PARA IMPRIMIR
        </p>
        <h1 className="font-display text-2xl font-bold">{nombre}</h1>
      </div>

      <div className="p-6 bg-white rounded-3xl shadow-deep">
        <QRCode
          value={url}
          size={240}
          bgColor="#ffffff"
          fgColor="#08070d"
          level="M"
        />
      </div>

      <div className="text-center space-y-2">
        <p className="text-white/40 text-xs font-mono">
          Paula escaneará este QR con la cámara del móvil
        </p>
        <p className="text-white/20 text-[10px] font-mono break-all">{url}</p>
      </div>

      <button
        onClick={() => window.print()}
        className="btn-neon px-8 py-4 text-base print:hidden"
      >
        🖨️ Imprimir
      </button>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          main { color: black !important; justify-content: center; padding: 2rem; }
          .card, [class*="border-glow"] { border: 1px solid #ccc !important; background: white !important; }
        }
      `}</style>
    </main>
  );
}
