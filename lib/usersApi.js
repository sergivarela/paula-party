// lib/usersApi.js
// Toda la interacción con Firestore vive aquí, así los componentes se mantienen limpios.

import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const USERS = "users";

/**
 * Lee un usuario una sola vez. Devuelve null si no existe.
 */
export async function fetchUser(id) {
  if (!id) return null;
  const snap = await getDoc(doc(db, USERS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Suscripción en tiempo real al documento de un usuario.
 * Llama a onChange con el usuario actualizado (o null si no existe).
 * Devuelve la función de unsubscribe.
 */
export function subscribeToUser(id, onChange) {
  if (!id) return () => {};
  return onSnapshot(doc(db, USERS, id), (snap) => {
    onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/**
 * Resta una vida al objetivo. Si llega a 0 lo marca como fantasma.
 * Usa increment(-1) para evitar condiciones de carrera entre invitados.
 *
 * Devuelve { ok, vidasRestantes, fantasma } para feedback inmediato.
 */
export async function eliminarObjetivo(objetivoId) {
  if (!objetivoId) return { ok: false, error: "Sin objetivo" };

  const ref = doc(db, USERS, objetivoId);

  // Primero leemos las vidas actuales para saber si tras restar quedará en 0.
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, error: "Objetivo no encontrado" };

  const vidasActuales = snap.data().vidas ?? 0;
  if (vidasActuales <= 0) {
    return { ok: false, error: "Ya es fantasma", vidasRestantes: 0, fantasma: true };
  }

  const nuevasVidas = vidasActuales - 1;
  const seraFantasma = nuevasVidas <= 0;

  await updateDoc(ref, {
    vidas: increment(-1),
    estado: seraFantasma ? "fantasma" : "vivo",
    ultimaEliminacion: serverTimestamp(),
  });

  return { ok: true, vidasRestantes: nuevasVidas, fantasma: seraFantasma };
}

/**
 * Marca el QR de un invitado como escaneado por Paula.
 * (Cuando Paula escanea correctamente, ese acertijo desaparece de su lista.)
 */
export async function marcarQrEscaneado(invitadoId) {
  if (!invitadoId) return;
  await updateDoc(doc(db, USERS, invitadoId), {
    qrEscaneado: true,
    escaneadoEn: serverTimestamp(),
  });
}

/**
 * Devuelve todos los invitados (sin Paula). Útil para que Paula vea la lista
 * de acertijos en su dashboard.
 */
export async function fetchInvitados() {
  const snap = await getDocs(collection(db, USERS));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.rol === "invitado");
}

/**
 * Suscripción a todos los invitados — necesaria para que el dashboard de Paula
 * se actualice cuando un invitado se convierte en fantasma o cuando otro
 * dispositivo marca un QR como escaneado.
 */
export function subscribeToInvitados(onChange) {
  return onSnapshot(collection(db, USERS), (snap) => {
    const invitados = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.rol === "invitado");
    onChange(invitados);
  });
}
