// app/party/invitado/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useUser } from "@/context/UserContext";
import { eliminarObjetivo, fetchInvitados } from "@/lib/usersApi";
import LoadingSplash from "@/components/LoadingSplash";
import Hearts from "@/components/Hearts";
import MissionCard from "@/components/MissionCard";
import GhostOverlay from "@/components/GhostOverlay";

export default function InvitadoDashboard() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [feedback, setFeedback] = useState(null);
  const [eligiendoVictima, setEligiendoVictima] = useState(false);
  const [victimas, setVictimas] = useState([]);
  const [cargandoVictimas, setCargandoVictimas] = useState(false);
  const [victimaElegida, setVictimaElegida] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && user && user.rol === "paula") {
      router.replace("/party/paula");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(t);
  }, [feedback]);

  if (loading || !user) return <LoadingSplash message="Cargando tu misión…" />;

  const esFantasma = user.estado === "fantasma" || (user.vidas ?? 0) <= 0;

  async function abrirSelector() {
    setEligiendoVictima(true);
    setCargandoVictimas(true);
    try {
      const todos = await fetchInvitados();
      const vivos = todos
        .filter(
          (u) =>
            u.id !== user.id &&
            u.estado !== "fantasma" &&
            (u.vidas ?? 0) > 0
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setVictimas(vivos);
    } finally {
      setCargandoVictimas(false);
    }
  }

  function elegirVictima(v) {
    setVictimaElegida(v);
    setEligiendoVictima(false);
    setConfirmando(true);
  }

  async function handleEliminar() {
    if (!victimaElegida || enviando) return;
    setEnviando(true);
    try {
      const res = await eliminarObjetivo(victimaElegida.id);
      if (res.ok) {
        setFeedback({
          tipo: "ok",
          msg: res.fantasma
            ? `💀 ¡${victimaElegida.nombre} ahora es FANTASMA!`
            : `✅ ¡Gran trabajo! Una vida menos`,
        });
      } else {
        setFeedback({
          tipo: "warn",
          msg:
            res.error === "Ya es fantasma"
              ? `${victimaElegida.nombre} ya era un fantasma.`
              : res.error || "No se pudo registrar la eliminación.",
        });
      }
    } catch (e) {
      setFeedback({ tipo: "warn", msg: "Error de red. Reintenta." });
    } finally {
      setEnviando(false);
      setConfirmando(false);
      setVictimaElegida(null);
    }
  }

  return (
    <main className="min-h-dvh px-5 py-8 max-w-md mx-auto pb-12 space-y-6">
      {/* Cabecera */}
      <header>
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-cyan">
          MODO · ASESINO
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight mt-2">
          {user.nombre}
        </h1>
        <div className="mt-2">
          <Hearts vidas={user.vidas ?? 0} total={3} size="text-3xl" />
        </div>
        <p className="text-white/55 mt-2 text-sm">
          Tienes <span className="text-white font-semibold">{user.vidas ?? 0}</span>{" "}
          {user.vidas === 1 ? "vida" : "vidas"}. Cumple tu reto sin que se den
          cuenta.
        </p>
      </header>

      {/* Tu QR */}
      <section className="card p-6 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-pink">
          TU QR · ENSÉÑASELO A PAULA
        </p>
        <div className="mt-5 mx-auto w-fit p-4 bg-white rounded-2xl shadow-deep">
          <QRCode
            value={user.id}
            size={208}
            bgColor="#ffffff"
            fgColor="#08070d"
            level="M"
          />
        </div>
      </section>

      {/* Tu Arma */}
      <MissionCard arma={user.arma} />

      {/* Botón de eliminación */}
      <section>
        <button
          onClick={abrirSelector}
          disabled={esFantasma}
          className="w-full px-6 py-7 rounded-3xl font-display font-black text-xl uppercase tracking-wider
                     bg-neon-pink text-white shadow-neon active:scale-[.98] transition
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🎯 Eliminar a alguien
        </button>
      </section>

      {/* Modal de confirmación */}
      {confirmando && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
          <div className="card border-glow p-7 w-full max-w-sm space-y-4 text-center">
            <div className="text-4xl">🎯</div>
            <p className="font-display text-xl font-bold">
              ¿Eliminar a{" "}
              <span className="text-neon-pink">{victimaElegida?.nombre}</span>?
            </p>
            <p className="text-white/55 text-sm">
              Esto le resta una vida. No hay marcha atrás.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setConfirmando(false); setVictimaElegida(null); }}
                disabled={enviando}
                className="btn-ghost flex-1 text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={enviando}
                className="flex-1 btn-neon-pink text-base"
              >
                {enviando ? "Enviando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de feedback */}
      {feedback && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-30 px-4 py-3 rounded-2xl text-sm font-display
            border backdrop-blur-md max-w-[90%] text-center
            ${
              feedback.tipo === "ok"
                ? "bg-neon-lime/15 border-neon-lime/40 text-neon-lime"
                : "bg-amber-500/15 border-amber-400/40 text-amber-200"
            }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Selector de víctima */}
      {eligiendoVictima && (
        <VictimaSelector
          victimas={victimas}
          cargando={cargandoVictimas}
          onPick={elegirVictima}
          onClose={() => setEligiendoVictima(false)}
        />
      )}

      {/* Estado fantasma */}
      {esFantasma && <GhostOverlay nombre={user.nombre} userId={user.id} />}
    </main>
  );
}

function VictimaSelector({ victimas, cargando, onPick, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ backgroundColor: "#08070d", backgroundImage: "none" }}>
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-neon-pink">
            SELECCIONA
          </p>
          <h2 className="font-display text-2xl font-bold mt-1">
            ¿A quién eliminas?
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/15 active:scale-95"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {cargando && (
          <p className="text-center text-white/50 font-mono text-xs tracking-widest py-10">
            CARGANDO JUGADORES…
          </p>
        )}
        {!cargando && victimas.length === 0 && (
          <p className="text-center text-white/50 text-sm py-10">
            No hay jugadores vivos. ¡Todos son fantasmas!
          </p>
        )}
        {victimas.map((v) => (
          <button
            key={v.id}
            onClick={() => onPick(v)}
            className="w-full text-left card p-4 active:scale-[.98] transition flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-neon-pink/15 border border-neon-pink/30 flex items-center justify-center text-lg">
              🎯
            </div>
            <p className="font-display font-semibold text-white">{v.nombre}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
