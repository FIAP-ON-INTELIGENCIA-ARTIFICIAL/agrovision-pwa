/* eslint-disable no-console */
import { faker } from '@faker-js/faker';
import * as admin from 'firebase-admin';

type Registro = {
  culture: 'soja' | 'milho' | 'cafe';
  produto: string;
  area: number | null;
  dose: number | null;
  ruas: number | null;
  comprimentoRua: number | null;
  doseMlM: number | null;
  litros: number;
  details: string;
  createdAt: admin.firestore.Timestamp;
};

const COUNT = Number(process.env.COUNT || process.argv[2] || 500);
const COLLECTION = process.env.COLLECTION || 'insumos_calculos'; // troque se quiser

// --- Inicializa Admin ---
const svc = require('../serviceAccountKey.json'); // NÃO COMMITAR
admin.initializeApp({
  credential: admin.credential.cert(svc),
  projectId: process.env.FIREBASE_PROJECT_ID || svc.project_id,
});
const db = admin.firestore();

const rand = (min: number, max: number, decimals = 0) => {
  const n = Math.random() * (max - min) + min;
  return Number(n.toFixed(decimals));
};
const choice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const produtosSoja = ['Herbicida', 'Fungicida', 'Inseticida', 'Adjuvante'];
const produtosMilho = ['Herbicida', 'Fungicida', 'Inseticida', 'Adubo foliar'];
const produtosCafe = ['Fosfato', 'Boro', 'Quelato de Zn', 'Potássio', 'Cálcio'];

function randomCreatedAt(daysBack = 90) {
  const ms = rand(0, daysBack * 24 * 60 * 60 * 1000);
  const d = new Date(Date.now() - ms);
  return admin.firestore.Timestamp.fromDate(d);
}

function buildRegistro(): Registro {
  // Distribuição aproximada: 40% soja, 35% milho, 25% café
  const r = Math.random();
  let culture: Registro['culture'];
  if (r < 0.4) culture = 'soja';
  else if (r < 0.75) culture = 'milho';
  else culture = 'cafe';

  if (culture === 'cafe') {
    const ruas = rand(50, 220, 0);
    const comprimentoRua = rand(40, 200, 0); // metros
    const doseMlM = rand(100, 1200, 0); // mL/m
    const litros = Number(((ruas * comprimentoRua * doseMlM) / 1000).toFixed(2));
    return {
      culture,
      produto: choice(produtosCafe) + ' ' + faker.commerce.productMaterial(),
      area: null,
      dose: null,
      ruas,
      comprimentoRua,
      doseMlM,
      litros,
      details: `${ruas} ruas × ${comprimentoRua}m × ${doseMlM} mL/m ÷ 1000`,
      createdAt: randomCreatedAt(),
    };
  } else {
    const area = rand(1, 120, 1); // ha
    const dose = rand(0.5, 5.0, 2); // L/ha
    const litros = Number((area * dose).toFixed(2));
    const produto =
      (culture === 'soja' ? choice(produtosSoja) : choice(produtosMilho)) +
      ' ' +
      faker.commerce.productAdjective();
    return {
      culture,
      produto,
      area,
      dose,
      ruas: null,
      comprimentoRua: null,
      doseMlM: null,
      litros,
      details: `${area} ha × ${dose} L/ha`,
      createdAt: randomCreatedAt(),
    };
  }
}

async function main() {
  console.log(`Seeding ${COUNT} docs em "${COLLECTION}"...`);
  const writer = db.bulkWriter();
  let i = 0;
  for (i = 0; i < COUNT; i++) {
    const docRef = db.collection(COLLECTION).doc();
    writer.create(docRef, buildRegistro());
  }
  await writer.close();
  console.log(`OK! Inseridos ${COUNT} documentos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
