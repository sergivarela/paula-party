"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// La app vive en /party?user=ID. Redirigimos desde la raíz.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? window.localStorage.getItem("paula-party:userId")
      : null;
    router.replace(stored ? `/party?user=${stored}` : "/party");
  }, [router]);
  return null;
}
