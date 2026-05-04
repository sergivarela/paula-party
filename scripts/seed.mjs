// scripts/seed.mjs
//
// Crea/sobreescribe los 15 documentos en la colección `users` con la
// estructura que pediste. Edita los campos en MAYÚSCULAS antes de ejecutar.
//
// Uso (una sola vez, antes de la fiesta):
//   1. Asegúrate de tener .env.local relleno
//   2. node scripts/seed.mjs
//
// Importa la config Firebase a través del propio cliente del proyecto.

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";

config({ path: ".env.local" });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

// ---- EDITA ESTOS DATOS ----------------------------------------------------

const paula = {
  id: "paula",
  nombre: "Paula",
  rol: "paula",
  vidas: 0,            // Paula no juega al asesino
  estado: "vivo",
  objetivoId: null,
  arma: null,
  acertijoParaPaula: null,
  digitoAsignado: null,
  qrEscaneado: false,
};

const invitados = [
  { id: "amigo01", nombre: "Sergio",        digitoAsignado: "1" },
  { id: "amigo02", nombre: "Andrea Cobas",  digitoAsignado: "2" },
  { id: "amigo03", nombre: "Andrea Romay",  digitoAsignado: "3" },
  { id: "amigo04", nombre: "Carlota",       digitoAsignado: "4" },
  { id: "amigo05", nombre: "Carmen",        digitoAsignado: "5" },
  { id: "amigo06", nombre: "Celia Pérez",   digitoAsignado: "6" },
  { id: "amigo07", nombre: "Boub",          digitoAsignado: "7" },
  { id: "amigo09", nombre: "Javi Cuñado",   digitoAsignado: "9" },
  { id: "amigo10", nombre: "Jorge De Pedro",digitoAsignado: "0" },
  { id: "amigo11", nombre: "Jorge Gestal",  digitoAsignado: "1" },
  { id: "amigo12", nombre: "Miguel Romero", digitoAsignado: "2" },
  { id: "amigo13", nombre: "Xavi Viña",     digitoAsignado: "3" },
  { id: "amigo14", nombre: "La Yaiza",      digitoAsignado: "4" },
].map((u) => ({
  ...u,
  rol: "invitado",
  vidas: 3,
  estado: "vivo",
  objetivoId: null,
  arma: null,
  acertijoParaPaula: "ACERTIJO_QUE_DESCRIBE_A_ESTE_AMIGO",
  qrEscaneado: false,
}));

// --------------------------------------------------------------------------

// IDs eliminados en alguna revisión — se borran de Firestore si existen
const BORRAR = ["amigo08"];

async function main() {
  for (const id of BORRAR) {
    await deleteDoc(doc(db, "users", id));
    console.log("🗑", id);
  }

  const all = [paula, ...invitados];
  for (const u of all) {
    await setDoc(doc(db, "users", u.id), u);
    console.log("✓", u.id, "—", u.nombre);
  }
  console.log(`\n✅ Creados ${all.length} documentos en /users`);
  console.log("\nLinks personales:");
  for (const u of all) {
    console.log(`  ${u.nombre.padEnd(20)}  /party?user=${u.id}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
