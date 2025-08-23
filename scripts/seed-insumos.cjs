/* eslint-disable no-console */
const { faker } = require('@faker-js/faker');
const admin = require('firebase-admin');

const svc = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(svc),
  projectId: process.env.FIREBASE_PROJECT_ID || svc.project_id,
});
const db = admin.firestore();

const COUNT = Number(process.env.COUNT || 500);
const COLLECTION = process.env.COLLECTION || 'insumos_calculos';

const rand = (min, max, d = 0) => Number((Math.random() * (max - min) + min).toFixed(d));
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const produtosSoja = ['Herbicida', 'Fungicida', 'Inseticida', 'Adjuvante'];
const produtosMilho = ['Herbicida', 'Fungicida', 'Inseticida', 'Adubo foliar'];
const produtosCafe = ['Fosfato', 'Boro', 'Quelato de Zn', 'Potássio', 'Cálcio'];

const randomCreatedAt = (days = 90) => {
  const ms = rand(0, days * 24 * 60 * 60 * 1000);
  return admin.firestore.Timestamp.fromDate(new Date(Date.now() - ms));
};

function buildRegistro() {
  const r = Math.random();
  const culture = r < 0.4 ? 'soja' : r < 0.75 ? 'milho' : 'cafe';

  if (culture === 'cafe') {
    const ruas = rand(50, 220);
    const comprimentoRua = rand(40, 200);
    const doseMlM = rand(100, 1200);
    const litros = Number(((ruas * comprimentoRua * doseMlM) / 1000).toFixed(2));
    return {
      culture,
      produto: `${choice(produtosCafe)} ${faker.commerce.productMaterial()}`,
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
    const area = rand(1, 120, 1);
    const dose = rand(0.5, 5.0, 2);
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

(async () => {
  console.log(`Seeding ${COUNT} documentos em "${COLLECTION}"...`);
  const writer = db.bulkWriter();
  for (let i = 0; i < COUNT; i++) {
    writer.create(db.collection(COLLECTION).doc(), buildRegistro());
  }
  await writer.close();
  console.log('OK!');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
