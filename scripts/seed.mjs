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
  { id: "sergio",         nombre: "Sergio",         digitoAsignado: "1", acertijoParaPaula: null },
  { id: "andrea-cobas",  nombre: "Andrea Cobas",   digitoAsignado: "2", acertijoParaPaula: null },
  { id: "andrea-romay",  nombre: "Andrea Romay",   digitoAsignado: "3", acertijoParaPaula: "Tu referente oficial de 'pelear' te esta esperando!!!" },
  { id: "carlota",        nombre: "Carlota",        digitoAsignado: "4", acertijoParaPaula: "Una raxo de tapo y otra de huevos con patatas" },
  { id: "carmen",         nombre: "Carmen",         digitoAsignado: "5", acertijoParaPaula: null },
  { id: "celia-perez",   nombre: "Celia Pérez",    digitoAsignado: "6", acertijoParaPaula: "Entre todos aquí, solo tú y yo lo sabemos: los espaguetis no existen… salvo cuando nos vemos" },
  { id: "boub",           nombre: "Boub",           digitoAsignado: "7", acertijoParaPaula: null },
  { id: "javi-cunado",   nombre: "Javi Cuñado",    digitoAsignado: "9", acertijoParaPaula: "Taxista de homicidios" },
  { id: "jorge-de-pedro",nombre: "Jorge De Pedro", digitoAsignado: "0", acertijoParaPaula: null },
  { id: "jorge-gestal",  nombre: "Jorge Gestal",   digitoAsignado: "1", acertijoParaPaula: "No creo que quieras volver a montar en mi coche" },
  { id: "miguel-romero", nombre: "Miguel Romero",  digitoAsignado: "2", acertijoParaPaula: "Cuanto más primo más me arrimo" },
  { id: "xavi-vina",     nombre: "Xavi Viña",      digitoAsignado: "3", acertijoParaPaula: "¿Cobicha? Estamos en un examen y suena JA JA JA SANCHEEEEZ" },
  { id: "la-yaiza",      nombre: "La Yaiza",       digitoAsignado: "4", acertijoParaPaula: "\"Vi que Jorge se sacaba fotos con él, dije ostia ostia un famoso, y ya sabía quien era, y le tiré una foto pero ni se pimpló de quien yo era\" (las iniciales del protagonista de la historia son R.M.)" },
].map((u) => ({
  ...u,
  rol: "invitado",
  vidas: 3,
  estado: "vivo",
  objetivoId: null,
  arma: null,
  foto: null,
  mensajeFelicitacion: null,
  qrEscaneado: false,
}));

// --------------------------------------------------------------------------

// IDs eliminados en alguna revisión — se borran de Firestore si existen
const BORRAR = [
  "amigo08", "amigo01", "amigo02", "amigo03", "amigo04", "amigo05",
  "amigo06", "amigo07", "amigo09", "amigo10", "amigo11", "amigo12",
  "amigo13", "amigo14",
];

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
