// Handkurerad begreppsgraf över grundskolans matematik (Lgr22, åk 1–9).
// Varje nod är ett centralt begrepp/moment; prereqs pekar på det som måste
// sitta INNAN begreppet går att lära sig på riktigt. Förenklad men trogen
// kursplanens progression — inspirerad av Math Academys kunskapsgraf.
//
// strand följer kursplanens kunskapsområden:
//   tal = Taluppfattning & tals användning   alg = Algebra
//   geo = Geometri                            sta = Sannolikhet & statistik
//   sam = Samband & förändring                pro = Problemlösning

export const STRANDS = {
  tal: { label: "Taluppfattning & tal", color: "var(--series-blue)" },
  alg: { label: "Algebra", color: "var(--series-violet)" },
  geo: { label: "Geometri", color: "var(--series-green)" },
  sta: { label: "Sannolikhet & statistik", color: "var(--series-yellow)" },
  sam: { label: "Samband & förändring", color: "var(--series-magenta)" },
  pro: { label: "Problemlösning", color: "var(--series-red)" },
};

export const CONCEPTS = [
  // ---------------------------------------------------------- åk 1–3 ----
  { id: "antal", label: "Antal & räkneramsan", strand: "tal", ak: 1, prereqs: [] },
  { id: "siffror", label: "Siffrorna 0–10", strand: "tal", ak: 1, prereqs: ["antal"] },
  { id: "talrad", label: "Talraden 0–100", strand: "tal", ak: 1, prereqs: ["siffror"] },
  { id: "tiokamrater", label: "Tiokamraterna", strand: "tal", ak: 1, prereqs: ["siffror"] },
  { id: "addsub20", label: "Addition & subtraktion 0–20", strand: "tal", ak: 1, prereqs: ["tiokamrater", "talrad"] },
  { id: "positionssystemet", label: "Positionssystemet", strand: "tal", ak: 2, prereqs: ["talrad"] },
  { id: "addsub100", label: "Addition & subtraktion 0–100", strand: "tal", ak: 2, prereqs: ["addsub20", "positionssystemet"] },
  { id: "huvudrakning", label: "Huvudräkningsstrategier", strand: "tal", ak: 2, prereqs: ["addsub20"] },
  { id: "multiplikation", label: "Multiplikationsbegreppet", strand: "tal", ak: 2, prereqs: ["addsub20"] },
  { id: "multtabell", label: "Multiplikationstabellerna", strand: "tal", ak: 3, prereqs: ["multiplikation"] },
  { id: "division", label: "Divisionsbegreppet", strand: "tal", ak: 3, prereqs: ["multiplikation"] },
  { id: "skriftliga", label: "Skriftliga räknemetoder", strand: "tal", ak: 3, prereqs: ["addsub100", "positionssystemet"] },
  { id: "delarhelhet", label: "Del av helhet & del av antal", strand: "tal", ak: 3, prereqs: ["division"] },

  { id: "likhetstecknet", label: "Likhetstecknets innebörd", strand: "alg", ak: 1, prereqs: ["siffror"] },
  { id: "oppnautsagor", label: "Öppna utsagor (_ + 3 = 7)", strand: "alg", ak: 2, prereqs: ["likhetstecknet", "addsub20"] },
  { id: "monster", label: "Mönster & enkla talföljder", strand: "alg", ak: 1, prereqs: ["antal"] },

  { id: "former", label: "Geometriska former", strand: "geo", ak: 1, prereqs: [] },
  { id: "matning", label: "Mätning: längd, massa, volym", strand: "geo", ak: 2, prereqs: ["talrad"] },
  { id: "klockan", label: "Klockan & tid", strand: "geo", ak: 2, prereqs: ["talrad"] },
  { id: "symmetri", label: "Symmetri", strand: "geo", ak: 3, prereqs: ["former"] },
  { id: "omkrets", label: "Omkrets", strand: "geo", ak: 3, prereqs: ["matning", "former"] },

  { id: "tabellerdiagram", label: "Tabeller & stapeldiagram", strand: "sta", ak: 2, prereqs: ["antal"] },
  { id: "slumpforsok", label: "Slump i spel & försök", strand: "sta", ak: 3, prereqs: [] },

  { id: "dubbelthalften", label: "Dubbelt & hälften", strand: "sam", ak: 2, prereqs: ["multiplikation"] },

  { id: "problem13", label: "Problemlösning med konkret material", strand: "pro", ak: 2, prereqs: ["addsub20"] },

  // ---------------------------------------------------------- åk 4–6 ----
  { id: "stortal", label: "Tal till miljoner", strand: "tal", ak: 4, prereqs: ["positionssystemet"] },
  { id: "avrundning", label: "Avrundning & överslag", strand: "tal", ak: 4, prereqs: ["positionssystemet"] },
  { id: "brakbegrepp", label: "Bråkbegreppet", strand: "tal", ak: 4, prereqs: ["delarhelhet"] },
  { id: "decimaltal", label: "Decimaltal", strand: "tal", ak: 4, prereqs: ["positionssystemet", "brakbegrepp"] },
  { id: "divisionstora", label: "Division med större tal", strand: "tal", ak: 4, prereqs: ["division", "multtabell"] },
  { id: "brakjamfor", label: "Jämföra & likvärdiga bråk", strand: "tal", ak: 5, prereqs: ["brakbegrepp"] },
  { id: "decimalrakning", label: "Räkna med decimaltal", strand: "tal", ak: 5, prereqs: ["decimaltal", "skriftliga"] },
  { id: "brakrakning", label: "Räkna med bråk", strand: "tal", ak: 6, prereqs: ["brakjamfor", "addsub100"] },
  { id: "procentbegrepp", label: "Procentbegreppet", strand: "tal", ak: 6, prereqs: ["brakjamfor", "decimaltal"] },
  { id: "negativatal", label: "Negativa tal", strand: "tal", ak: 6, prereqs: ["stortal"] },
  { id: "raknesattens", label: "Räknesättens ordning", strand: "tal", ak: 6, prereqs: ["multtabell", "addsub100"] },

  { id: "variabel", label: "Obekanta tal & symboler", strand: "alg", ak: 4, prereqs: ["oppnautsagor"] },
  { id: "talfoljder46", label: "Talföljder & mönsterformler", strand: "alg", ak: 5, prereqs: ["monster", "multtabell"] },
  { id: "enklaekvationer", label: "Enkla ekvationer", strand: "alg", ak: 5, prereqs: ["variabel"] },
  { id: "uttryck", label: "Algebraiska uttryck", strand: "alg", ak: 6, prereqs: ["variabel", "raknesattens"] },

  { id: "vinklar", label: "Vinklar & gradtal", strand: "geo", ak: 4, prereqs: ["former"] },
  { id: "area", label: "Areabegreppet", strand: "geo", ak: 5, prereqs: ["omkrets", "multiplikation"] },
  { id: "skala", label: "Skala", strand: "geo", ak: 5, prereqs: ["matning", "multtabell"] },
  { id: "volym", label: "Volym & begränsningsyta", strand: "geo", ak: 6, prereqs: ["area"] },

  { id: "medelvarde", label: "Medelvärde, median & typvärde", strand: "sta", ak: 5, prereqs: ["divisionstora", "tabellerdiagram"] },
  { id: "diagram46", label: "Linje- & cirkeldiagram", strand: "sta", ak: 5, prereqs: ["tabellerdiagram", "brakbegrepp"] },
  { id: "sannolikhet46", label: "Sannolikhet som bråk", strand: "sta", ak: 6, prereqs: ["slumpforsok", "brakbegrepp"] },

  { id: "koordinatsystem", label: "Koordinatsystem", strand: "sam", ak: 6, prereqs: ["negativatal"] },
  { id: "proportionalitet", label: "Proportionalitet", strand: "sam", ak: 6, prereqs: ["brakjamfor", "dubbelthalften"] },
  { id: "grafer46", label: "Grafer för samband", strand: "sam", ak: 6, prereqs: ["koordinatsystem", "tabellerdiagram"] },

  { id: "problem46", label: "Flerstegsproblem & strategival", strand: "pro", ak: 5, prereqs: ["problem13", "skriftliga"] },
  { id: "rimlighet", label: "Rimlighetsbedömning", strand: "pro", ak: 5, prereqs: ["avrundning", "problem13"] },

  // ---------------------------------------------------------- åk 7–9 ----
  { id: "negativarakning", label: "Räkna med negativa tal", strand: "tal", ak: 7, prereqs: ["negativatal", "raknesattens"] },
  { id: "procentrakning", label: "Beräkningar med procent", strand: "tal", ak: 7, prereqs: ["procentbegrepp", "decimalrakning"] },
  { id: "potenser", label: "Potenser", strand: "tal", ak: 7, prereqs: ["multtabell", "raknesattens"] },
  { id: "forandringsfaktor", label: "Förändringsfaktor", strand: "tal", ak: 8, prereqs: ["procentrakning"] },
  { id: "kvadratrot", label: "Kvadratrötter", strand: "tal", ak: 8, prereqs: ["potenser"] },
  { id: "tiopotenser", label: "Tiopotenser & grundpotensform", strand: "tal", ak: 8, prereqs: ["potenser", "decimaltal"] },
  { id: "ranta", label: "Ränta, lån & privatekonomi", strand: "tal", ak: 9, prereqs: ["forandringsfaktor"] },
  { id: "rationella", label: "Rationella tal & talmängder", strand: "tal", ak: 9, prereqs: ["negativarakning", "brakrakning"] },

  { id: "forenklauttryck", label: "Förenkla uttryck", strand: "alg", ak: 7, prereqs: ["uttryck", "negativarakning"] },
  { id: "ekvationer79", label: "Ekvationer i flera steg", strand: "alg", ak: 7, prereqs: ["enklaekvationer", "forenklauttryck"] },
  { id: "parenteser", label: "Parenteser & distributiva lagen", strand: "alg", ak: 8, prereqs: ["forenklauttryck"] },
  { id: "monsteralgebra", label: "Generalisera mönster algebraiskt", strand: "alg", ak: 8, prereqs: ["talfoljder46", "uttryck"] },
  { id: "formler", label: "Formler & formelomskrivning", strand: "alg", ak: 8, prereqs: ["ekvationer79"] },

  { id: "cirkeln", label: "Cirkelns omkrets & area", strand: "geo", ak: 7, prereqs: ["area"] },
  { id: "volymkroppar", label: "Volym: cylinder, kon & klot", strand: "geo", ak: 8, prereqs: ["volym", "cirkeln"] },
  { id: "pythagoras", label: "Pythagoras sats", strand: "geo", ak: 8, prereqs: ["kvadratrot", "area"] },
  { id: "likformighet", label: "Likformighet & kongruens", strand: "geo", ak: 9, prereqs: ["skala", "vinklar"] },

  { id: "spridningsmatt", label: "Spridningsmått", strand: "sta", ak: 8, prereqs: ["medelvarde"] },
  { id: "sannolikhet79", label: "Sannolikhet i flera steg", strand: "sta", ak: 8, prereqs: ["sannolikhet46", "brakrakning"] },
  { id: "kombinatorik", label: "Kombinatorik", strand: "sta", ak: 9, prereqs: ["sannolikhet79"] },
  { id: "granskastatistik", label: "Granska statistik & urval", strand: "sta", ak: 9, prereqs: ["medelvarde", "diagram46"] },

  { id: "funktioner", label: "Funktionsbegreppet", strand: "sam", ak: 8, prereqs: ["grafer46", "uttryck"] },
  { id: "linjarafunktioner", label: "Linjära funktioner (y = kx + m)", strand: "sam", ak: 9, prereqs: ["funktioner", "ekvationer79", "proportionalitet"] },
  { id: "grafisktolkning", label: "Grafisk lösning & tolkning", strand: "sam", ak: 9, prereqs: ["linjarafunktioner"] },

  { id: "modeller", label: "Matematiska modeller i vardagen", strand: "pro", ak: 8, prereqs: ["problem46", "procentrakning"] },
  { id: "resonemang", label: "Resonemang & bevisidéer", strand: "pro", ak: 9, prereqs: ["modeller", "parenteser"] },
];

// Kedjan berättelsen följer: från "del av helhet" i trean hela vägen till
// räntan på första lägenhetslånet.
export const CHAIN = [
  "delarhelhet",
  "brakbegrepp",
  "brakjamfor",
  "brakrakning",
  "procentbegrepp",
  "procentrakning",
  "forandringsfaktor",
  "ranta",
];

// Noden som "tas bort" i missa-ett-begrepp-scenariot.
export const MISSING_NODE = "brakbegrepp";

const byId = new Map(CONCEPTS.map((c) => [c.id, c]));

// Alla begrepp som (direkt eller indirekt) bygger på `id`.
export function descendantsOf(id) {
  const out = new Set();
  let frontier = [id];
  while (frontier.length) {
    const next = [];
    for (const c of CONCEPTS) {
      if (out.has(c.id)) continue;
      if (c.prereqs.some((p) => p === id || out.has(p) || frontier.includes(p))) {
        if (c.id !== id) {
          out.add(c.id);
          next.push(c.id);
        }
      }
    }
    if (!next.length) break;
    frontier = next;
  }
  return out;
}

// Alla förkunskaper som (direkt eller indirekt) krävs för `id`.
export function ancestorsOf(id) {
  const out = new Set();
  const stack = [id];
  while (stack.length) {
    const c = byId.get(stack.pop());
    for (const p of c.prereqs) {
      if (!out.has(p)) {
        out.add(p);
        stack.push(p);
      }
    }
  }
  return out;
}

// Nivåordning för "skadan sprider sig"-animationen: hur många steg uppströms
// ett begrepp ligger från det borttagna.
export const RIPPLE_ORDER = (() => {
  const dependents = new Map(CONCEPTS.map((c) => [c.id, []]));
  CONCEPTS.forEach((c) => c.prereqs.forEach((p) => dependents.get(p).push(c.id)));
  const order = new Map();
  let frontier = [MISSING_NODE];
  let lvl = 0;
  while (frontier.length) {
    const next = [];
    for (const id of frontier) {
      for (const d of dependents.get(id)) {
        if (!order.has(d) && d !== MISSING_NODE) {
          order.set(d, lvl + 1);
          next.push(d);
        }
      }
    }
    frontier = next;
    lvl++;
  }
  return order;
})();

// Längsta förkunskapskedjan fram till varje begrepp (djup i grafen).
export const DEPTH = (() => {
  const depth = new Map();
  function d(id) {
    if (depth.has(id)) return depth.get(id);
    const c = byId.get(id);
    const v = c.prereqs.length ? 1 + Math.max(...c.prereqs.map(d)) : 0;
    depth.set(id, v);
    return v;
  }
  CONCEPTS.forEach((c) => d(c.id));
  return depth;
})();

export const MAX_DEPTH = Math.max(...DEPTH.values());
