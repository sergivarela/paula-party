// components/QrScanner.js
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Escáner de QR basado en html5-qrcode.
 *
 * Props:
 * - onScan(text): callback cuando lee un QR válido. Lo llamamos UNA VEZ y
 *   detenemos la cámara para que el padre pueda mostrar feedback sin que
 *   el escáner siga disparando lecturas.
 * - onClose(): cerrar el escáner.
 *
 * Notas de implementación:
 * - html5-qrcode toca `window`, así que el componente es client-only y la
 *   librería se importa dinámicamente dentro del useEffect.
 * - Pedimos cámara trasera (facingMode: environment) que es la útil en móvil.
 */
export default function QrScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const containerId = "qr-reader";
  const [status, setStatus] = useState("init"); // init | running | denied | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    let instance = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        instance = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = instance;

        await instance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            // recuadro de escaneo cuadrado adaptado al ancho disponible
            qrbox: (vw, vh) => {
              const min = Math.min(vw, vh);
              const size = Math.floor(min * 0.7);
              return { width: size, height: size };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Disparamos solo una vez para evitar lecturas en bucle
            if (!scannerRef.current) return;
            const captured = scannerRef.current;
            scannerRef.current = null;
            captured
              .stop()
              .catch(() => {})
              .finally(() => onScan?.(decodedText));
          },
          () => {
            // callback de "no se pudo decodificar este frame" — lo ignoramos
          }
        );

        if (!cancelled) setStatus("running");
      } catch (err) {
        console.error("QR scanner error", err);
        if (cancelled) return;
        const msg = String(err?.message || err);
        if (/permission|denied|notallowed/i.test(msg)) {
          setStatus("denied");
        } else {
          setStatus("error");
          setErrorMsg(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
      const ref = scannerRef.current;
      scannerRef.current = null;
      if (ref) {
        ref.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm flex flex-col">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-neon-cyan">
            ESCANEANDO
          </p>
          <h2 className="font-display text-2xl font-bold mt-1">
            Apunta al QR del invitado
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/15 active:scale-95"
          aria-label="Cerrar escáner"
        >
          ✕
        </button>
      </div>

      {/* Visor */}
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-glow bg-black">
          <div id={containerId} className="absolute inset-0" />

          {/* Esquinas decorativas */}
          {status === "running" && (
            <>
              <Corner className="top-3 left-3" rotate={0} />
              <Corner className="top-3 right-3" rotate={90} />
              <Corner className="bottom-3 right-3" rotate={180} />
              <Corner className="bottom-3 left-3" rotate={270} />
              <div className="scanline" />
            </>
          )}

          {/* Estados de error */}
          {status === "init" && (
            <Overlay>
              <p className="font-mono text-xs tracking-widest text-white/70">
                PIDIENDO CÁMARA…
              </p>
              <p className="text-white/60 text-sm mt-2 text-center px-6">
                Tu navegador te pedirá permiso para usar la cámara. Acepta para
                empezar a escanear.
              </p>
            </Overlay>
          )}
          {status === "denied" && (
            <Overlay>
              <div className="text-4xl mb-2">🎥</div>
              <p className="font-display text-xl font-bold">Permiso denegado</p>
              <p className="text-white/60 text-sm mt-2 text-center px-6">
                Activa la cámara desde los ajustes del navegador y vuelve a abrir
                el escáner.
              </p>
            </Overlay>
          )}
          {status === "error" && (
            <Overlay>
              <div className="text-4xl mb-2">⚠️</div>
              <p className="font-display text-xl font-bold">No pudimos abrir la cámara</p>
              <p className="text-white/50 text-xs mt-2 text-center px-6 font-mono">
                {errorMsg}
              </p>
            </Overlay>
          )}
        </div>
      </div>

      <div className="p-5 pb-8 text-center">
        <p className="text-white/50 text-sm">
          Mantén el QR centrado y enfocado.
        </p>
      </div>
    </div>
  );
}

function Corner({ className = "", rotate = 0 }) {
  return (
    <div
      className={`absolute w-7 h-7 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-neon-lime rounded-full" />
      <div className="absolute top-0 left-0 h-full w-[3px] bg-neon-lime rounded-full" />
    </div>
  );
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
      {children}
    </div>
  );
}
