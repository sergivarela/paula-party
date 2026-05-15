// app/admin/page.js
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, writeBatch, updateDoc, getDocsFromServer } from "firebase/firestore";
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
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Redimensiona y comprime la imagen a base64 (máx 400px, calidad 0.75)
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AdminPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [invitados, setInvitados] = useState([]);
  const [tab, setTab] = useState("juego"); // "juego" | "fotos"

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("key") === SECRET_KEY) setAutorizado(true);
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    getDocs(collection(db, "users")).then((snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.rol === "invitado" || u.rol === "especial")
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setInvitados(lista);
    });
  }, [autorizado]);

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
      const inv = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.rol === "invitado");

      if (inv.length !== ARMAS.length) {
        setResultado({ tipo: "err", msg: `❌ ${inv.length} invitados pero ${ARMAS.length} armas` });
        return;
      }
      const mezcladas = shuffle(ARMAS);
      const batch = writeBatch(db);
      inv.forEach((u, i) => batch.update(doc(db, "users", u.id), { arma: mezcladas[i] }));
      await batch.commit();
      setResultado({ tipo: "ok", msg: `✅ ${inv.length} armas repartidas` });
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
      // Forzamos lectura fresca del servidor para no depender de la caché local
      const snap = await getDocsFromServer(collection(db, "users"));
      const inv = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.rol === "invitado");

      if (inv.length === 0) {
        setResultado({ tipo: "err", msg: "❌ No se encontraron invitados" });
        return;
      }

      const batch = writeBatch(db);
      inv.forEach((u) => batch.update(doc(db, "users", u.id), {
        vidas: 3, estado: "vivo", arma: null, qrEscaneado: false,
      }));
      await batch.commit();

      // Actualizamos también el estado local para que el panel refleje el reset
      setInvitados((prev) => prev.map((u) => ({ ...u, vidas: 3, estado: "vivo", arma: null, qrEscaneado: false })));
      setResultado({ tipo: "ok", msg: `✅ Juego reiniciado — ${inv.length} jugadores a 3 vidas` });
    } catch (e) {
      setResultado({ tipo: "err", msg: `❌ ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh px-5 py-8 max-w-md mx-auto pb-12 space-y-6">
      <header>
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-purple">PANEL · ADMIN</p>
        <h1 className="font-display text-3xl font-bold mt-2">Control de la fiesta</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("juego")}
          className={`flex-1 py-3 rounded-xl font-display font-semibold text-sm transition ${
            tab === "juego" ? "bg-neon-purple text-white" : "bg-white/10 text-white/60"
          }`}
        >
          🎮 Juego
        </button>
        <button
          onClick={() => setTab("fotos")}
          className={`flex-1 py-3 rounded-xl font-display font-semibold text-sm transition ${
            tab === "fotos" ? "bg-neon-purple text-white" : "bg-white/10 text-white/60"
          }`}
        >
          📸 Fotos y mensajes
        </button>
      </div>

      {tab === "juego" && (
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
                <button onClick={() => setConfirmReset(false)} className="btn-ghost flex-1">Cancelar</button>
                <button onClick={reiniciarJuego} className="flex-1 btn-neon-pink">Sí, reiniciar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "fotos" && (
        <FotosPanel invitados={invitados} setInvitados={setInvitados} />
      )}

      {loading && (
        <p className="text-center font-mono text-xs tracking-widest text-white/50">PROCESANDO…</p>
      )}

      {resultado && tab === "juego" && (
        <p className={`text-center font-mono text-sm ${resultado.tipo === "ok" ? "text-neon-lime" : "text-red-400"}`}>
          {resultado.msg}
        </p>
      )}
    </main>
  );
}

function FotosPanel({ invitados, setInvitados }) {
  const [guardando, setGuardando] = useState(null); // id del invitado que se está guardando

  async function handleFoto(invitado, file) {
    if (!file) return;
    setGuardando(invitado.id);
    try {
      const base64 = await resizeImage(file);
      await updateDoc(doc(db, "users", invitado.id), { foto: base64 });
      setInvitados((prev) =>
        prev.map((u) => (u.id === invitado.id ? { ...u, foto: base64 } : u))
      );
    } finally {
      setGuardando(null);
    }
  }

  async function handleMensaje(invitado, mensaje) {
    await updateDoc(doc(db, "users", invitado.id), { mensajeFelicitacion: mensaje });
    setInvitados((prev) =>
      prev.map((u) => (u.id === invitado.id ? { ...u, mensajeFelicitacion: mensaje } : u))
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-white/50 text-sm">
        Sube la foto y el mensaje de cada invitado. Paula los verá al escanear su QR.
      </p>
      {invitados.map((inv) => (
        <div key={inv.id} className="card p-4 space-y-3">
          <div className="flex items-center gap-3">
            {inv.foto ? (
              <img src={inv.foto} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl">👤</div>
            )}
            <div>
              <p className="font-display font-semibold">{inv.nombre}</p>
              <p className="text-xs text-white/40 font-mono">
                {inv.foto ? "✓ foto" : "sin foto"} · {inv.mensajeFelicitacion ? "✓ mensaje" : "sin mensaje"}
              </p>
            </div>
          </div>

          <label className="block">
            <span className="text-xs text-white/50 uppercase tracking-widest">Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFoto(inv, e.target.files[0])}
              className="mt-1 block w-full text-sm text-white/60
                file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                file:bg-white/10 file:text-white file:font-display file:text-sm
                file:active:scale-95 file:transition"
            />
            {guardando === inv.id && (
              <p className="text-xs text-neon-cyan mt-1 font-mono">Subiendo…</p>
            )}
          </label>

          <label className="block">
            <span className="text-xs text-white/50 uppercase tracking-widest">Mensaje de felicitación</span>
            <textarea
              defaultValue={inv.mensajeFelicitacion || ""}
              onBlur={(e) => handleMensaje(inv, e.target.value)}
              rows={2}
              placeholder="Escribe el mensaje que verá Paula al encontrarle…"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2
                         text-sm text-white placeholder:text-white/30 resize-none focus:outline-none
                         focus:border-neon-purple/50"
            />
          </label>
        </div>
      ))}
    </div>
  );
}
