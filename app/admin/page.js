// app/admin/page.js
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SECRET_KEY = "12DE@gosto";

const ARMAS = [
  "El Clásico: Ofrecerle un vaso de agua (o cualquier bebida) y conseguir que dé un trago.",
  "El 'Sostén esto': Lograr que sostenga un objeto tuyo (móvil, llaves, chaqueta) durante al menos 5 segundos.",
  "Cambio de look: Conseguir que se ponga una prenda o accesorio tuyo (unas gafas, un gorro, un anillo) para ver 'cómo le queda'.",
  "El Relojero: Preguntarle la hora y conseguir que mire su móvil o reloj para decírtela exactamente.",
  "El Sordete: Hablarle muy bajito para lograr que te responda específicamente con la palabra: '¿Qué?'.",
  "Palabra Prohibida: Sacar el tema del trabajo o el cansancio para que diga la palabra: 'Cansado' o 'Cansada'.",
  "El Melómano: Empezar a cantar o tararear una canción muy famosa y lograr que la otra persona la continúe o cante contigo.",
  "El Colega: Dejarle la mano levantada para chocar los cinco de forma exagerada y lograr que te la choque.",
  "El Reflejo: Bostezar de forma muy evidente mientras le hablas y conseguir que te devuelva el bostezo por contagio.",
  "¡Salud!: Ser el primero en decirle '¡Salud!' justo después de que estornude.",
  "El Picor: Que te rasque la espalda o el brazo con la excusa de que 'tienes las manos manchadas' o no llegas.",
  "El Fotógrafo: Convencerle para hacerse un selfie juntos poniendo una cara ridícula (sacando la lengua, bizcos, etc.).",
  "El Cotilla: Lograr que te enseñe voluntariamente una foto de su galería del móvil (de su mascota, un viaje, etc.).",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AdminPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("key") === SECRET_KEY) setAutorizado(true);
  }, []);

  if (!autorizado) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-white/30 font-mono text-sm">403</p>
      </main>
    );
  }

  async function repartirArmas() {
    setLoading(true);
    setResultado(null);
    try {
      const snap = await getDocs(collection(db, "users"));
      const invitados = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.rol === "invitado");

      if (invitados.length !== ARMAS.length) {
        setResultado({ tipo: "err", msg: `❌ ${invitados.length} invitados pero ${ARMAS.length} armas` });
        return;
      }

      const mezcladas = shuffle(ARMAS);
      const batch = writeBatch(db);
      invitados.forEach((inv, i) => {
        batch.update(doc(db, "users", inv.id), { arma: mezcladas[i] });
      });
      await batch.commit();
      setResultado({ tipo: "ok", msg: `✅ ${invitados.length} armas repartidas` });
    } catch (e) {
      setResultado({ tipo: "err", msg: `❌ ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  async function reiniciarJuego() {
    setLoading(true);
    setResultado(null);
    setConfirmReset(false);
    try {
      const snap = await getDocs(collection(db, "users"));
      const invitados = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.rol === "invitado");

      const batch = writeBatch(db);
      invitados.forEach((inv) => {
        batch.update(doc(db, "users", inv.id), {
          vidas: 3,
          estado: "vivo",
          arma: null,
          qrEscaneado: false,
        });
      });
      await batch.commit();
      setResultado({ tipo: "ok", msg: `✅ Juego reiniciado — ${invitados.length} jugadores a 3 vidas` });
    } catch (e) {
      setResultado({ tipo: "err", msg: `❌ ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh px-5 py-8 max-w-md mx-auto space-y-6">
      <header>
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-purple">
          PANEL · ADMIN
        </p>
        <h1 className="font-display text-3xl font-bold mt-2">Control de la fiesta</h1>
      </header>

      <div className="space-y-4">
        <button
          onClick={repartirArmas}
          disabled={loading}
          className="w-full px-6 py-6 rounded-2xl font-display font-bold text-lg
                     bg-neon-lime text-ink active:scale-[.98] transition
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🎲 Repartir armas aleatoriamente
        </button>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={loading}
            className="w-full px-6 py-6 rounded-2xl font-display font-bold text-lg
                       bg-white/10 border border-white/20 text-white active:scale-[.98] transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🔄 Reiniciar juego
          </button>
        ) : (
          <div className="card border-glow p-5 space-y-3">
            <p className="text-center font-display font-semibold">¿Reiniciar todo?</p>
            <p className="text-white/50 text-sm text-center">
              Vuelve a todos a 3 vidas y borra las armas asignadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={reiniciarJuego}
                className="flex-1 btn-neon-pink"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center font-mono text-xs tracking-widest text-white/50">
          PROCESANDO…
        </p>
      )}

      {resultado && (
        <p className={`text-center font-mono text-sm ${
          resultado.tipo === "ok" ? "text-neon-lime" : "text-red-400"
        }`}>
          {resultado.msg}
        </p>
      )}
    </main>
  );
}
