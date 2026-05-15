// scripts/assign-armas.mjs
//
// Reparte las armas aleatoriamente entre los 14 invitados.
// Ejecutar el día de la fiesta, DESPUÉS de haber corrido seed.mjs.
//
// Uso:
//   node scripts/assign-armas.mjs

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

// ---- EDITA ESTA LISTA (una arma por invitado, 14 en total) ----------------

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
  "¡Salud!: Ser el primero en decirle '¡Salud!' justo después de que estornude (tienes que estar atento o provocarlo con algo de pimienta cerca).",
  "El Picor: Que te rasque la espalda o el brazo con la excusa de que 'tienes las manos manchadas' o no llegas.",
  "El Fotógrafo: Convencerle para hacerse un selfie juntos poniendo una cara ridícula (sacando la lengua, bizcos, etc.).",
];

// ---------------------------------------------------------------------------

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const snap = await getDocs(collection(db, "users"));
  const invitados = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.rol === "invitado");

  if (invitados.length !== ARMAS.length) {
    console.error(
      `❌ Hay ${invitados.length} invitados pero ${ARMAS.length} armas. Deben coincidir.`
    );
    process.exit(1);
  }

  const armasmezcladas = shuffle(ARMAS);

  for (let i = 0; i < invitados.length; i++) {
    const inv = invitados[i];
    const arma = armasmezcladas[i];
    await updateDoc(doc(db, "users", inv.id), { arma });
    console.log(`✓ ${inv.nombre.padEnd(20)} → ${arma}`);
  }

  console.log(`\n✅ ${invitados.length} armas repartidas aleatoriamente`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
