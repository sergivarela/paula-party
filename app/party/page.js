// app/party/page.js
"use client";

// Página de carga / enrutador.
// 1. Lee ?user= de la URL (lo hace UserContext) y lo guarda en localStorage.
// 2. Mientras carga muestra un splash.
// 3. Si el usuario es Paula -> /party/paula. Si invitado -> /party/invitado.
// 4. Si no hay ID o no se encuentra -> mensaje claro.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoadingSplash from "@/components/LoadingSplash";

export default function PartyGate() {
  const router = useRouter();
  const { user, loading, error } = useUser();

  useEffect(() => {
    if (loading || !user) return;
    if (user.rol === "paula") router.replace("/party/paula");
    else router.replace("/party/invitado");
  }, [user, loading, router]);

  if (loading) return <LoadingSplash message="Conectando con la fiesta…" />;

  if (error === "missing_id") {
    return (
      <ErrorScreen
        title="Falta tu enlace"
        message="Necesitas el link personal que te dio Paula. Tiene la forma /party?user=tu-id."
      />
    );
  }

  if (error === "not_found" || !user) {
    return (
      <ErrorScreen
        title="No te encontramos"
        message="Ese ID no existe en la fiesta. Revisa el enlace o avisa a Paula."
      />
    );
  }

  // Mientras se ejecuta el redirect, muestra splash
  return <LoadingSplash message="Preparando tu misión…" />;
}

function ErrorScreen({ title, message }) {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="card border-glow max-w-sm w-full p-8 text-center space-y-4">
        <div className="text-4xl">🚫</div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="text-white/60 text-sm">{message}</p>
      </div>
    </main>
  );
}
