<script>
  import { appData as data } from "./lib/data/load.js";
  import Story from "./lib/story/Story.svelte";
  import ExploreWeave from "./lib/components/ExploreWeave.svelte";

  const ov = data.overview;

  // Bakgrundsmotiv i heron: ett bygge av begrepp — noder och beroenden — där
  // en handfull noder är släckta med röd ring: hålen i grunden, synliga redan
  // innan berättelsen börjat.
  const MOTIF_N = 90;
  const motif = (() => {
    let seed = 314159;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const nodes = Array.from({ length: MOTIF_N }, (_, i) => ({
      x: 40 + rand() * 920,
      y: 40 + rand() * 560,
      hole: false,
      i,
    }));
    // trådar till 2 nära grannar
    const edges = [];
    nodes.forEach((n) => {
      const near = nodes
        .filter((m) => m !== n)
        .map((m) => [Math.hypot(m.x - n.x, m.y - n.y), m])
        .sort((a, b) => a[0] - b[0])
        .slice(0, 2);
      near.forEach(([, m]) => {
        if (n.i < m.i) edges.push([n, m]);
      });
    });
    // ~var sjunde nod är ett hål — som andelen F i nian
    nodes.forEach((n) => (n.hole = rand() < 0.14));
    return { nodes, edges };
  })();

  const fmt = (x) => x.toLocaleString("sv-SE");
  const dec = (x) => String(x).replace(".", ",");

  const statRow = [
    {
      value: `${dec(ov.npAndelAE)} %`,
      label: "av niorna fick A–E på nationella provet i matematik, våren 2025",
    },
    {
      value: fmt(ov.antalF),
      label: "elever lämnade nian med F i matematik",
    },
    {
      value: fmt(ov.obehoriga),
      label: "elever saknade behörighet till gymnasiets yrkesprogram",
    },
    {
      value: fmt(ov.obehorigaEndastMatte),
      label: "av dem föll på ett enda ämne: matematiken",
      accent: true,
    },
  ];
</script>

<header class="hero">
  <svg
    class="hero-motif"
    viewBox="0 0 1000 640"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {#each motif.edges as [a, b]}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        class="motif-edge"
        class:broken={a.hole || b.hole}
      />
    {/each}
    {#each motif.nodes as n}
      <circle
        cx={n.x}
        cy={n.y}
        r={n.hole ? 6.5 : 5}
        class="motif-node"
        class:hole={n.hole}
        style={n.hole ? `animation-delay: ${(n.i * 137) % 3000}ms` : undefined}
      />
    {/each}
  </svg>
  <div class="hero-inner">
    <p class="eyebrow">Göteborgs Stad · Grundskoleförvaltningen</p>
    <h1>
      <span class="hero-line1">Hål</span>
      <span class="hero-line2">i grunden</span>
    </h1>
    <p class="subtitle">
      Var fjärde elev i årskurs 9 klarade inte det nationella provet i
      matematik i våras, och {fmt(ov.obehoriga)} elever lämnade grundskolan
      utan behörighet till gymnasiet. Matematik byggs nedifrån: varje nytt
      moment förutsätter det förra. Det här är en genomgång i data av var
      grunden brister, hur tidigt luckorna syns och varför de går att
      åtgärda. Läsåret {ov.lasar}.
    </p>
    <p class="data-note">Data: syntetisk testdata (ej verkliga elevuppgifter).</p>
    <p class="scroll-hint">Scrolla<span class="scroll-tick">|</span></p>
  </div>
</header>

<section class="statrow" aria-label="Läget i korthet">
  <div class="statrow-inner">
    {#each statRow as s}
      <div class="stat" class:accent={s.accent}>
        <span class="stat-value">{s.value}</span>
        <span class="stat-label">{s.label}</span>
      </div>
    {/each}
  </div>
</section>

<main>
  <Story {data} />
</main>

<ExploreWeave />

<section class="atgarder" aria-label="Vad kan var och en göra">
  <div class="atgarder-inner">
    <p class="atgarder-kicker">Samma data, tre uppdrag</p>
    <h2>Vem lagar grunden?</h2>
    <div class="atgarder-grid">
      <article>
        <h3>Politiker &amp; förvaltning</h3>
        <p>
          Prioritera resurser till de tidiga årskurserna, där varje insats
          får störst effekt. Använd andelen elever på lägre nivå i ettans
          bedömningsstöd och resultaten på treans delprov som
          styrinformation, inte enbart slutbetygen i årskurs 9.
        </p>
      </article>
      <article>
        <h3>Rektorer &amp; lärare</h3>
        <p>
          Låt varje delprov under kravnivån i årskurs 3 följas av en konkret
          insats. Intensiv, riktad undervisning i liten grupp utifrån
          utpekade begrepp hör till de insatser som har störst uppmätt
          effekt i utbildningsforskningen.
        </p>
      </article>
      <article>
        <h3>Vårdnadshavare</h3>
        <p>
          Fråga vilket område klassen arbetar med och be skolan visa var
          ditt barn står i ettans och treans avstämningar. En lucka som
          åtgärdas i årskurs 4 kräver en liten insats. Samma lucka i årskurs
          9 kan avgöra gymnasievalet.
        </p>
      </article>
    </div>
  </div>
</section>

<section class="epilog">
  <div class="epilog-inner">
    <p class="epilog-kicker">Ett enda ämne</p>
    <h2>
      {fmt(ov.obehorigaEndastMatte)} elever var godkända i allt — utom
      matematik.
    </h2>
    <p class="epilog-text">
      För dem avgjordes gymnasievalet av ett enda ämne. Luckorna syntes
      redan i ettans bedömningsstöd och i treans nationella prov, sex år
      innan betygen sattes. En lucka i grunden försvinner inte av sig själv,
      och för varje årskurs byggs mer ovanpå den. Men den går att åtgärda,
      och ingenstans är det enklare än i början.
    </p>
  </div>
</section>

<section class="sources" aria-label="Om datat och källorna">
  <div class="sources-inner">
    <h2>Om datat och källorna</h2>
    <ul>
      <li>
        Alla resultatsiffror på den här sidan är <strong>syntetisk
        testdata</strong> (en simulerad årskull om {fmt(ov.arskull)} elever),
        framtagen för att utveckla berättelsen — inte verklig betygsstatistik.
        Nivåerna är kalibrerade mot storleksordningar i nationell statistik.
      </li>
      <li>
        Måtten speglar de verkliga: ämnesbetyg och provbetyg (nationella
        prov) i matematik åk 6 och åk 9, nationella provets kravnivåer i åk 3
        samt Skolverkets obligatoriska bedömningsstöd i taluppfattning i åk 1.
      </li>
      <li>
        Begreppsgrafen är en förenklad, handkurerad tolkning av det centrala
        innehållet i <strong>Lgr22:s kursplan i matematik</strong> (78 begrepp,
        115 beroenden), inspirerad av Math Academys kunskapsgraf.
      </li>
      <li>
        Duncan m.fl. (2007), School readiness and later achievement,
        <em>Developmental Psychology</em>, 43(6) —
        <a href="https://doi.org/10.1037/0012-1649.43.6.1428" target="_blank" rel="noopener noreferrer">doi:10.1037/0012-1649.43.6.1428</a>.
      </li>
      <li>
        Siegler m.fl. (2012), Early predictors of high school mathematics
        achievement, <em>Psychological Science</em>, 23(7) —
        <a href="https://doi.org/10.1177/0956797612440101" target="_blank" rel="noopener noreferrer">doi:10.1177/0956797612440101</a>.
      </li>
      <li>
        Aunola m.fl. (2004), Developmental dynamics of math performance from
        preschool to grade 2, <em>Journal of Educational Psychology</em>, 96(4) —
        <a href="https://doi.org/10.1037/0022-0663.96.4.699" target="_blank" rel="noopener noreferrer">doi:10.1037/0022-0663.96.4.699</a>.
      </li>
      <li>
        Sambanden i kohortavsnittet är korrelationer i testdata och säger inte
        vad som orsakar vad — men de är konstruerade för att likna de mönster
        forskningen ovan beskriver.
      </li>
      <li>
        Kontantstatistiken är sidans enda verkliga dataserie:
        <a href="https://www.riksbank.se/sv/betalningar--kontanter/sa-betalar-svenskarna/" target="_blank" rel="noopener noreferrer">Riksbankens
        betalningsundersökningar</a> — andel som betalade sitt senaste köp i
        butik med kontanter, 2010–2022 (avrundade värden).
      </li>
      <li>
        Avsnittet om fokus och vardagsräknande är resonemang, inte mätdata.
      </li>
    </ul>
  </div>
</section>

<footer>
  <p>
    Resultatdatan på den här sidan är syntetisk testdata, genererad för att
    illustrera koncept och layout — inte verkliga elevuppgifter. Undantaget
    är Riksbankens kontantstatistik, som är verklig.
  </p>
</footer>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
  }
  .hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: center;
    background:
      radial-gradient(120% 90% at 80% 10%, var(--hero-navy) 0%, var(--hero-navy-deep) 100%);
    color: #ffffff;
    overflow: hidden;
  }
  .hero-motif {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* håll motivet ur vägen för rubriken — synligt mest i kanterna */
    -webkit-mask-image: radial-gradient(ellipse 75% 65% at 44% 46%, transparent 0%, transparent 36%, #000 78%);
    mask-image: radial-gradient(ellipse 75% 65% at 44% 46%, transparent 0%, transparent 36%, #000 78%);
  }
  .motif-edge {
    stroke: rgba(255, 255, 255, 0.07);
    stroke-width: 1;
  }
  .motif-edge.broken {
    stroke: rgba(255, 205, 55, 0.14);
    stroke-dasharray: 4 4;
  }
  .motif-node {
    fill: rgba(255, 255, 255, 0.08);
  }
  .motif-node.hole {
    fill: transparent;
    stroke: rgba(255, 205, 55, 0.45);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
    animation: hole-pulse 3.2s ease-in-out infinite;
  }
  @keyframes hole-pulse {
    0%, 100% { stroke-opacity: 0.55; }
    50% { stroke-opacity: 1; }
  }
  .hero-inner {
    position: relative;
    max-width: 700px;
    margin: 0 auto;
    padding: 48px 32px;
    width: 100%;
  }
  .eyebrow {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--hero-gold);
    font-weight: 600;
    margin: 0 0 28px;
  }
  h1 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: clamp(56px, 11vw, 110px);
    line-height: 1.02;
    margin: 0 0 32px;
    letter-spacing: -0.01em;
    color: #ffffff;
  }
  .hero-line1 {
    display: block;
  }
  .hero-line2 {
    display: block;
    font-style: italic;
    color: var(--hero-lightblue);
  }
  .subtitle {
    font-size: 19px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.92);
    max-width: 560px;
    margin: 0 0 20px;
  }
  .data-note {
    font-size: 14px;
    color: var(--hero-gold);
    margin: 0 0 64px;
  }
  .scroll-hint {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.55);
    text-align: center;
    margin: 0;
  }
  .scroll-tick {
    display: block;
    margin-top: 6px;
    animation: bob 2s ease-in-out infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(6px); opacity: 1; }
  }

  /* Läget i korthet — för den som skummar: chefer, politiker, press. */
  .statrow {
    background: var(--surface-1);
    border-bottom: 1px solid var(--border);
  }
  .statrow-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 34px 32px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-value {
    font-family: var(--serif);
    font-size: clamp(28px, 3.4vw, 40px);
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .stat.accent .stat-value {
    color: var(--series-red);
  }
  .stat-label {
    font-size: 13px;
    line-height: 1.45;
    color: var(--text-muted);
  }
  @media (max-width: 860px) {
    .statrow-inner {
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
      padding: 26px 20px;
    }
  }

  /* Vem lagar grunden — tre uppdrag, samma data. */
  .atgarder {
    background: var(--surface-1);
    border-top: 1px solid var(--border);
  }
  .atgarder-inner {
    max-width: 1000px;
    margin: 0 auto;
    padding: 72px 32px;
  }
  .atgarder-kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--series-blue);
    font-weight: 700;
    margin: 0 0 12px;
    text-align: center;
  }
  .atgarder h2 {
    font-family: var(--serif);
    font-size: clamp(26px, 4vw, 36px);
    text-align: center;
    margin: 0 0 40px;
  }
  .atgarder-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .atgarder-grid article {
    background: var(--page-plane);
    border-radius: 8px;
    padding: 24px 26px;
    border-top: 4px solid var(--hero-navy);
  }
  .atgarder-grid h3 {
    font-size: 16px;
    margin: 0 0 10px;
  }
  .atgarder-grid p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }
  @media (max-width: 860px) {
    .atgarder-grid {
      grid-template-columns: 1fr;
    }
    .atgarder-inner {
      padding: 52px 20px;
    }
  }

  .epilog {
    background: radial-gradient(120% 90% at 20% 10%, var(--hero-navy) 0%, var(--hero-navy-deep) 100%);
    color: #ffffff;
    padding: 110px 32px;
    text-align: center;
  }
  .epilog-inner {
    max-width: 640px;
    margin: 0 auto;
  }
  .epilog-kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--hero-gold);
    font-weight: 600;
    margin: 0 0 20px;
  }
  .epilog h2 {
    font-family: var(--serif);
    font-size: clamp(30px, 5vw, 46px);
    line-height: 1.15;
    color: #ffffff;
    margin: 0 0 24px;
  }
  .epilog-text {
    font-size: 16px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }
  .sources {
    background: var(--surface-1);
    border-top: 1px solid var(--border);
  }
  .sources-inner {
    max-width: 640px;
    margin: 0 auto;
    padding: 48px 24px;
  }
  .sources h2 {
    font-family: var(--serif);
    font-size: 18px;
    margin: 0 0 16px;
    color: var(--text-primary);
  }
  .sources ul {
    margin: 0;
    padding-left: 20px;
  }
  .sources li {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .sources li:last-child {
    margin-bottom: 0;
  }
  .sources a {
    color: var(--series-blue);
  }
  footer {
    padding: 40px 24px 80px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    border-top: 1px solid var(--border);
    margin-top: 0;
  }
</style>
