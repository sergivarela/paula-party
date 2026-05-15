// app/sobre/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchUser } from "@/lib/usersApi";

export default function SobrePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(id).then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="font-mono text-xs tracking-widest text-white/40">CARGANDO…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="font-mono text-sm text-white/30">404</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-10 max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-1">
        <p className="font-mono text-[10px] tracking-[0.4em] text-neon-pink">
          UN MENSAJE PARA TI
        </p>
        <h1 className="font-display text-3xl font-bold">
          De parte de {user.nombre} 🎂
        </h1>
      </div>

      {user.foto ? (
        <img
          src={user.foto}
          alt={user.nombre}
          className="w-full rounded-3xl object-contain shadow-deep"
        />
      ) : (
        <div className="w-full aspect-square rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-6xl">
          🎉
        </div>
      )}

      {user.mensajeFelicitacion ? (
        <div className="card border-glow p-6 w-full">
          <p className="font-mono text-[10px] tracking-[0.3em] text-neon-purple mb-3">
            SU MENSAJE
          </p>
          <p className="text-white/90 text-base leading-relaxed">
            {user.mensajeFelicitacion}
          </p>
        </div>
      ) : (
        <div className="card p-6 w-full text-center">
          <p className="text-white/30 italic text-sm">Mensaje pendiente…</p>
        </div>
      )}

      <p className="text-white/20 font-mono text-[10px] tracking-widest text-center">
        ✨ FELIZ CUMPLEAÑOS PAULA ✨
      </p>
    </main>
  );
}
