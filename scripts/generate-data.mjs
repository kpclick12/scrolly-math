// Genererar syntetisk testdata för "Hålen i väven".
// Kör:  node scripts/generate-data.mjs
//
// Allt är påhittat men kalibrerat mot de verkliga storleksordningarna:
//   · ~75 % A–E på nationella provet i matematik åk 9 (vt 2025)
//   · ~1 000 elever utan behörighet till yrkesprogram
//   · ~800 av dem saknar A–E i matematik, ~300 saknar ENBART matematik
// Kohorten simuleras på elevnivå (latent förmåga med Matteus-drift) så att
// villkorade utfall — "av de som missade kravnivån i trean fick X % F i nian"
// — är internt konsistenta, inte handsatta var för sig.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- slump ----
let seed = 20250607;
function rand() {
  // mulberry32 — deterministiskt, gott nog för testdata
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function randn() {
  // Box–Muller
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}
const pct = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

// ------------------------------------------------------------- kohorten ----
// Årskullen som gick ut nian våren 2025: NP åk 3 vt 2019 → NP/betyg åk 6
// vt 2022 → NP + slutbetyg åk 9 vt 2025.
const N = 5804;

const students = Array.from({ length: N }, () => {
  const theta3 = randn(); // "förmåga" i åk 3
  // Matteus-effekt: gapet växer — den som ligger lågt driver nedåt.
  const theta6 = 1.18 * theta3 + 0.55 * randn();
  const theta9 = 1.18 * theta6 + 0.55 * randn();
  return { theta3, theta6, theta9 };
});

// Rangbaserade trösklar ger exakta marginaler (andelar) med bibehållen
// korrelation från den latenta kedjan.
function assignByQuantile(arr, keyScore, cuts, keyOut, labels) {
  const order = arr.map((s, i) => [keyScore(s), i]).sort((a, b) => a[0] - b[0]);
  order.forEach(([, idx], rank) => {
    const q = (rank + 0.5) / arr.length;
    let k = 0;
    while (k < cuts.length && q > cuts[k]) k++;
    arr[idx][keyOut] = labels[k];
  });
}

const BETYG = ["F", "E", "D", "C", "B", "A"];

// Åk 3, NP vt 2019: 15,2 % under kravnivån totalt; 29 % missade minst ett delprov.
const UNDER_AK3 = 0.152;
assignByQuantile(
  students,
  (s) => s.theta3 + 0.45 * randn(),
  [UNDER_AK3],
  "ak3",
  ["under", "nadde"]
);

// Åk 6 vt 2022 — provbetyg (NP) och ämnesbetyg.
// NP är hårdare; ämnesbetyget lyfter elever nära gränsen ("snällbetyg").
const NP6_F = 0.184;
const AMNE6 = { F: 0.092, E: 0.278, D: 0.224, C: 0.196, B: 0.128, A: 0.082 };
assignByQuantile(students, (s) => s.theta6 + 0.5 * randn(), [NP6_F], "np6", ["F", "EA"]);
{
  const cuts = [];
  let acc = 0;
  for (const b of BETYG.slice(0, -1)) { acc += AMNE6[b]; cuts.push(acc); }
  assignByQuantile(students, (s) => s.theta6 + 0.32 * randn() + (s.np6 === "F" ? 0.18 : 0), cuts, "amne6", BETYG);
}

// Åk 9 vt 2025.
// NP: 24,5 % F (=> 75,5 % A–E). Ämnesbetyg: 13,7 % F (≈ 800 elever).
const NP9 = { F: 0.245, E: 0.262, D: 0.204, C: 0.156, B: 0.086, A: 0.047 };
const AMNE9 = { F: 0.1371, E: 0.268, D: 0.219, C: 0.189, B: 0.121, A: 0.0659 };
{
  const cuts = [];
  let acc = 0;
  for (const b of BETYG.slice(0, -1)) { acc += NP9[b]; cuts.push(acc); }
  assignByQuantile(students, (s) => s.theta9 + 0.42 * randn(), cuts, "np9", BETYG);
}
{
  const cuts = [];
  let acc = 0;
  for (const b of BETYG.slice(0, -1)) { acc += AMNE9[b]; cuts.push(acc); }
  // Ämnesbetyget följer förmågan men läraren väger in mer än ett provtillfälle
  // — och lyfter hellre än fäller nära gränsen.
  assignByQuantile(students, (s) => s.theta9 + 0.26 * randn() + 0.12, cuts, "amne9", BETYG);
}

// Behörighet till yrkesprogram: godkänt i sv/en/ma + 5 ämnen till.
// F i matematik ⇒ obehörig. Därutöver är en grupp obehörig av andra skäl —
// svag i matte är ofta svag även i andra ämnen (korrelerat med theta9).
const fMatte = students.filter((s) => s.amne9 === "F");
const ejFMatte = students.filter((s) => s.amne9 !== "F");
const OBEHORIGA_MAL = 1004;
const ovrigaObehoriga = OBEHORIGA_MAL - fMatte.length;
ejFMatte
  .map((s) => [s.theta9 + 0.8 * randn(), s])
  .sort((a, b) => a[0] - b[0])
  .forEach(([, s], i) => (s.obehorigAnnat = i < ovrigaObehoriga));
// Av dem med F i matte: har de även F i annat behörighetsämne?
const ENDAST_MATTE_MAL = 302;
fMatte
  .map((s) => [s.theta9 + 0.8 * randn(), s])
  .sort((a, b) => b[0] - a[0])
  .forEach(([, s], i) => (s.endastMatte = i < ENDAST_MATTE_MAL));

// ------------------------------------------------------------ aggregat ----
const antalF = fMatte.length;
const obehoriga = antalF + ovrigaObehoriga;
const endastMatte = fMatte.filter((s) => s.endastMatte).length;

const share = (grupp, pred) => pct((grupp.filter(pred).length / grupp.length) * 100);

const under3 = students.filter((s) => s.ak3 === "under");
const nadde3 = students.filter((s) => s.ak3 === "nadde");

const fordelning = (grupp, key) =>
  BETYG.map((b) => ({ betyg: b, andel: share(grupp, (s) => s[key] === b) }));

// Provbetyg × ämnesbetyg-matrisen (andel av alla elever per cell)
const matris = [];
for (const p of BETYG) {
  for (const a of BETYG) {
    matris.push({
      provbetyg: p,
      amnesbetyg: a,
      andel: pct((students.filter((s) => s.np9 === p && s.amne9 === a).length / N) * 100),
    });
  }
}
const npFHojda = share(students.filter((s) => s.np9 === "F"), (s) => s.amne9 !== "F");

// F i åk 9 efter betyg i åk 6 — "få tar sig tillbaka"
const fEfterAk6 = BETYG.map((b) => {
  const grupp = students.filter((s) => s.amne6 === b);
  return { betygAk6: b, andelFAk9: grupp.length ? share(grupp, (s) => s.amne9 === "F") : 0, antal: grupp.length };
});

const overview = {
  lasar: "2024/25",
  arskull: N,
  npAndelAE: pct(100 - NP9.F * 100),
  npAndelF: pct(NP9.F * 100),
  amnesbetygFProcent: share(students, (s) => s.amne9 === "F"),
  antalF,
  obehoriga,
  obehorigaMedFMatte: antalF,
  obehorigaEndastMatte: endastMatte,
  npFHojdaTillE: npFHojda,
};

const kohort = {
  beskrivning: "Årskullen som gick ut åk 9 våren 2025",
  checkpoints: [
    { label: "Åk 3", ar: 2019, matt: "NP: under kravnivån", andel: pct(UNDER_AK3 * 100) },
    { label: "Åk 6", ar: 2022, matt: "NP: provbetyg F", andel: pct(NP6_F * 100) },
    { label: "Åk 9", ar: 2025, matt: "NP: provbetyg F", andel: pct(NP9.F * 100) },
  ],
  villkorade: {
    underAk3: { grupp: "Under kravnivån i åk 3", antal: under3.length, ak9: fordelning(under3, "amne9") },
    naddeAk3: { grupp: "Nådde kravnivån i åk 3", antal: nadde3.length, ak9: fordelning(nadde3, "amne9") },
    fAndelUnder: share(under3, (s) => s.amne9 === "F"),
    fAndelNadde: share(nadde3, (s) => s.amne9 === "F"),
  },
  fEfterAk6,
};

// F-trend åk 9, 2015–2025. NP ställdes in 2020 och 2021 (pandemin).
const fTrend = [];
const amneStart = 10.6, amneEnd = overview.amnesbetygFProcent;
const npStart = 17.8, npEnd = overview.npAndelF;
for (let ar = 2015; ar <= 2025; ar++) {
  const t = (ar - 2015) / 10;
  const wobble = () => (rand() - 0.5) * 0.7;
  const amne = ar === 2025 ? amneEnd : pct(amneStart + (amneEnd - amneStart) * t ** 1.35 + wobble());
  const np = ar === 2020 || ar === 2021 ? null : ar === 2025 ? npEnd : pct(npStart + (npEnd - npStart) * t ** 1.2 + wobble());
  fTrend.push({ ar, amnesbetygF: amne, provbetygF: np });
}

// Tidiga signaler.
// Bedömningsstöd taluppfattning åk 1 (obligatoriskt underlag, tre höstar).
const bedomningsstod = [
  { termin: "HT 2023", lagre: 14.8, mellan: 24.6, hogre: 60.6 },
  { termin: "HT 2024", lagre: 16.1, mellan: 24.9, hogre: 59.0 },
  { termin: "HT 2025", lagre: 17.3, mellan: 25.4, hogre: 57.3 },
];
// NP åk 3 vt 2025, andel som EJ nådde kravnivån per delprov.
const npAk3Delprov = [
  { delprov: "Mönster och talföljder", andel: 24.1 },
  { delprov: "Skriftliga räknemetoder", andel: 21.7 },
  { delprov: "Huvudräkning", andel: 18.9 },
  { delprov: "Problemlösning", andel: 17.2 },
  { delprov: "Tid och proportion", andel: 14.6 },
  { delprov: "Geometri och mätning", andel: 11.8 },
  { delprov: "Statistik", andel: 9.4 },
];
const tidigaSignaler = {
  bedomningsstod,
  npAk3Delprov,
  npAk3MinstEtt: 28.7,
  npAk3Ar: 2025,
};

const npFordelning = {
  prov: fordelning(students, "np9"),
  amne: fordelning(students, "amne9"),
};

// ----------------------------------------------------------------- skriv ----
const files = {
  "overview.json": overview,
  "fTrend.json": fTrend,
  "npFordelning.json": npFordelning,
  "betygMatris.json": matris,
  "kohort.json": kohort,
  "tidigaSignaler.json": tidigaSignaler,
};
for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(OUT, name), JSON.stringify(data, null, 2) + "\n");
}

// ------------------------------------------------------------- kontroll ----
console.log("Elever i årskullen:", N);
console.log("NP åk 9 A–E:", overview.npAndelAE + "%", "| F:", overview.npAndelF + "%");
console.log("Ämnesbetyg F:", overview.amnesbetygFProcent + "%", `(${antalF} elever)`);
console.log("Obehöriga:", obehoriga, "| varav F i matte:", antalF, "| endast matte:", endastMatte);
console.log("F i åk 9 om under kravnivån åk 3:", kohort.villkorade.fAndelUnder + "%",
  "| om nådde:", kohort.villkorade.fAndelNadde + "%");
console.log("F åk 9 efter betyg åk 6:", fEfterAk6.map((d) => `${d.betygAk6}:${d.andelFAk9}%`).join(" "));
console.log("Andel av NP-F som fick E+ i ämnesbetyg:", npFHojda + "%");
