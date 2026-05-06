// app/party/paula/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { subscribeToInvitados, marcarQrEscaneado, fetchUser } from "@/lib/usersApi";
import LoadingSplash from "@/components/LoadingSplash";
import AcertijoCard from "@/components/AcertijoCard";
import QrScanner from "@/components/QrScanner";
import ScanResultModal from "@/components/ScanResultModal";

/**
 * Dashboard de Paula:
 *  - Lista en tiempo real de los 14 invitados (filtrando los ya escaneados)
 *  - Tap en un acertijo => arma el escáner para ese invitado concreto
 *  - Lectura QR => 3 ramas:
 *      • éxito    -> ScanResultModal kind="success" + marcarQrEscaneado
 *      • fantasma -> ScanResultModal kind="ghost"   (NO marca como escaneado;
 *                    Paula tiene que volver a escanearlo tras la penalización)
 *      • mismatch -> ScanResultModal kind="mismatch"
 */
export default function PaulaDashboard() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [invitados, setInvitados] = useState([]);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [acertijoElegido, setAcertijoElegido] = useState(null);
  const [resultado, setResultado] = useState(null); // { kind, payload }

  // Redirect si no es Paula
  useEffect(() => {
    if (!loading && user && user.rol !== "paula") {
      router.replace("/party/invitado");
    }
  }, [user, loading, router]);

  // Suscripción en tiempo real a TODOS los invitados.
  // Así, si alguien se vuelve fantasma mientras Paula mira la lista, la
  // próxima vez que pulse ya verá su estado actualizado.
  useEffect(() => {
    const unsub = subscribeToInvitados(setInvitados);
    return () => unsub();
  }, []);

  // Pendientes primero, escaneados al final — todos visibles
  const ordenados = useMemo(
    () =>
      [...invitados].sort((a, b) => {
        if (a.qrEscaneado !== b.qrEscaneado) return a.qrEscaneado ? 1 : -1;
        return a.id > b.id ? 1 : -1;
      }),
    [invitados]
  );

  const pendientes = ordenados.filter((u) => !u.qrEscaneado);
  const completados = invitados.length - pendientes.length;
  const total = invitados.length || 14;

  // Tras leer un QR, validar contra el invitado elegido
  async function handleScan(decodedText) {
    setScannerActivo(false);
    const idEscaneado = (decodedText || "").trim();

    if (!acertijoElegido) {
      // No debería pasar (sólo abrimos escáner desde una card), pero por si acaso
      setResultado({
        kind: "mismatch",
        payload: { esperado: "—", recibido: idEscaneado },
      });
      return;
    }

    // Si el QR no es ni siquiera del invitado del acertijo, mismatch
    if (idEscaneado !== acertijoElegido.id) {
      // Intentamos resolver el nombre real del QR escaneado para feedback bonito
      let recibidoNombre = idEscaneado;
      try {
        const otro = await fetchUser(idEscaneado);
        if (otro?.nombre) recibidoNombre = otro.nombre;
      } catch (_) {}
      setResultado({
        kind: "mismatch",
        payload: {
          esperado: acertijoElegido.nombre,
          recibido: recibidoNombre,
        },
      });
      return;
    }

    // El QR coincide con el invitado del acertijo: comprobar si es fantasma.
    // Releemos el documento por si justo acaba de cambiar de estado.
    const fresco = await fetchUser(idEscaneado);
    const esFantasma =
      !fresco || fresco.estado === "fantasma" || (fresco.vidas ?? 0) <= 0;

    if (esFantasma) {
      await marcarQrEscaneado(acertijoElegido.id);
      setResultado({
        kind: "ghost",
        payload: {
          nombre: acertijoElegido.nombre,
          digito: acertijoElegido.digitoAsignado ?? "?",
          foto: fresco?.foto ?? null,
          mensaje: fresco?.mensajeFelicitacion ?? null,
        },
      });
      return;
    }

    // Éxito real: revelar dígito y marcar como escaneado en Firestore
    await marcarQrEscaneado(acertijoElegido.id);
    setResultado({
      kind: "success",
      payload: {
        nombre: acertijoElegido.nombre,
        digito: acertijoElegido.digitoAsignado ?? "?",
        foto: fresco.foto ?? null,
        mensaje: fresco.mensajeFelicitacion ?? null,
      },
    });
  }

  if (loading || !user) {
    return <LoadingSplash message="Cargando misión de Paula…" />;
  }

  return (
    <main className="min-h-dvh px-5 py-8 max-w-md mx-auto pb-32">
      {/* Cabecera */}
      <header className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-pink">
          MODO · PROTAGONISTA
        </p>
        <h1 className="font-display text-4xl font-bold mt-2 leading-none">
          Hola, <span className="text-neon-pink">{user.nombre}</span> 🎂
        </h1>
        <p className="text-white/60 mt-3 text-sm leading-relaxed">
          Cada amigo guarda un dígito de tu candado. Lee el acertijo, encuéntralo
          y escanea su QR.
        </p>
      </header>

      {/* Progreso */}
      <div className="card p-5 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/50">
              PROGRESO
            </p>
            <p className="font-display text-3xl font-bold mt-1">
              {completados}
              <span className="text-white/30 text-xl"> / {total}</span>
            </p>
          </div>
          <p className="text-white/50 text-xs font-mono">
            {pendientes.length} pendientes
          </p>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan transition-all duration-500"
            style={{ width: `${(completados / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de acertijos */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white/90 px-1">
          Tus acertijos
        </h2>

        {pendientes.length === 0 && invitados.length > 0 && (
          <div className="card border-glow p-8 text-center space-y-3">
            <div className="text-5xl">🔓</div>
            <p className="font-display text-xl font-bold">
              ¡Tienes todos los dígitos!
            </p>
            <p className="text-white/60 text-sm">
              Combínalos en el orden correcto para abrir tu regalo.
            </p>
          </div>
        )}

        {invitados.length === 0 && (
          <p className="text-white/50 text-sm px-1">Cargando invitados…</p>
        )}

        {ordenados.map((inv, i) => (
          <AcertijoCard
            key={inv.id}
            index={i}
            invitado={inv}
            onPick={(elegido) => {
              if (elegido.qrEscaneado) {
                // Ya escaneado: mostrar info sin abrir escáner
                setResultado({
                  kind: "success",
                  payload: {
                    nombre: elegido.nombre,
                    digito: elegido.digitoAsignado ?? "?",
                    foto: elegido.foto ?? null,
                    mensaje: elegido.mensajeFelicitacion ?? null,
                  },
                });
              } else {
                setAcertijoElegido(elegido);
                setScannerActivo(true);
              }
            }}
          />
        ))}
      </section>

      {/* Botón flotante para escaneo libre (sin elegir acertijo, útil de respaldo) */}
      {pendientes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-gradient-to-t from-ink via-ink/95 to-transparent">
          <p className="text-center text-xs text-white/50 mb-2 font-mono tracking-widest">
            ¿YA SABES QUIÉN ES? TOCA SU ACERTIJO ARRIBA
          </p>
        </div>
      )}

      {/* Escáner */}
      {scannerActivo && (
        <QrScanner
          onScan={handleScan}
          onClose={() => {
            setScannerActivo(false);
            setAcertijoElegido(null);
          }}
        />
      )}

      {/* Modal de resultado */}
      {resultado && (
        <ScanResultModal
          kind={resultado.kind}
          payload={resultado.payload}
          onClose={() => {
            setResultado(null);
            setAcertijoElegido(null);
          }}
        />
      )}
    </main>
  );
}
