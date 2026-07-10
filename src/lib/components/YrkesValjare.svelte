<script>
  // "Varför ska jag kunna matte — jag ska ju bli …?"
  // Okända okändheter, gjorda upplevbara: välj ett drömyrke och se vilken
  // matematik som gömmer sig i det. Poängen är inte exemplen i sig, utan
  // att man inte kan veta i förväg vilken dörr man själv vill öppna.
  const YRKEN = [
    {
      id: "underskoterska",
      namn: "Undersköterska",
      vag: "Vård- och omsorgsprogrammet",
      visual: "dos",
      punch:
        "Läkemedelsberäkning är proportionalitet, bråk och enhetsbyten — och provet måste ofta klaras felfritt för att få ge medicin.",
    },
    {
      id: "snickare",
      namn: "Snickare",
      vag: "Bygg- och anläggningsprogrammet",
      visual: "takstol",
      punch:
        "Pythagoras i varje takstol och skala 1:50 på varje ritning. Ett räknefel som inte syns på papperet syns desto mer på taket.",
    },
    {
      id: "musiker",
      namn: "Musikproducent",
      vag: "Estetiska programmet",
      visual: "vagor",
      punch:
        "En ren kvint är exakt bråket 3:2, en oktav 2:1. Ackord som låter rätt är bråkräkning som hörs — och BPM, takter och synthar är bara mer matte.",
    },
    {
      id: "elektriker",
      namn: "Elektriker",
      vag: "El- och energiprogrammet",
      rakning: ["Ugnen drar 2 300 W på 230 V.", "I = P ÷ U = 2 300 ÷ 230 = 10 A", "Säkringen är på 10 A — går precis. Eller?"],
      punch:
        "Ohms lag är en formel som måste kunna lösas ut åt alla håll — algebrakedjan. Räknefel i elarbeten kan få allvarliga följder.",
    },
    {
      id: "kock",
      namn: "Kock",
      vag: "Restaurang- och livsmedelsprogrammet",
      rakning: ["Receptet är för 4. Ikväll bokade 26.", "26 ÷ 4 = 6,5 × varje ingrediens", "0,75 dl grädde → 4,875 dl ≈ 4,9 dl"],
      punch: "Varje beställning är proportionalitet med bråk och decimaltal — under tidspress.",
    },
    {
      id: "frisor",
      namn: "Frisör med egen salong",
      vag: "Hantverksprogrammet + F-skatt",
      rakning: ["Klippning 620 kr inkl. 25 % moms.", "620 ÷ 1,25 = 496 kr till dig", "Hyra, försäkring, pension — kvar per klippning?"],
      punch: "Egenföretagarens vardag är procent och förändringsfaktor. Den som inte kan räkna baklänges på momsen sätter fel pris.",
    },
    {
      id: "spelutvecklare",
      namn: "Spelutvecklare",
      vag: "Teknikprogrammet → högskola",
      rakning: ["Spelfiguren står i (12, 3) och ska till (20, 9).", "Riktning: (20−12, 9−3) = (8, 6)", "Avstånd: √(8² + 6²) = 10 rutor"],
      punch: "All spelgrafik är koordinatsystem, vektorer och Pythagoras — kedjorna högst upp i grafen, körda 60 gånger i sekunden.",
    },
    {
      id: "influencer",
      namn: "Influencer",
      vag: "Eget företag från dag ett",
      rakning: ["120 000 visningar · 45 kr CPM", "120 000 ÷ 1 000 × 45 = 5 400 kr", "− 30 % skatt → 3 780 kr. Värt klippet?"],
      punch: "CPM, engagemang i procent, skatt och moms — den som inte kan räkna själv får svårt att granska sina egna avtal.",
    },
    {
      id: "polis",
      namn: "Polis",
      vag: "Gymnasieexamen → polisutbildning (högskola)",
      rakning: ["Rattfylla: 0,2 promille = 0,2 g alkohol", "per 1 000 g blod — promille är", "tiondels procent. Bevisföring är statistik."],
      punch: "Antagningen kräver full gymnasieexamen — och yrket kräver promille, hastighetsanalys och statistik i vardagen.",
    },
    {
      id: "sjukskoterska",
      namn: "Sjuksköterska",
      vag: "Högskola — kräver Matematik 2",
      rakning: ["Dropp: 1 000 ml på 8 timmar.", "1 000 ÷ 8 = 125 ml/h", "Droppräknare: 125 × 20 ÷ 60 ≈ 42 droppar/min"],
      punch: "Här räcker inte nians matematik: högskolans sjuksköterskeutbildning kräver dessutom gymnasiekursen Matematik 2.",
    },
    {
      id: "pilot",
      namn: "Pilot",
      vag: "Gymnasieexamen → trafikflygarutbildning",
      rakning: ["Bränsle: 2 400 kg/h i 3,2 h + 45 min reserv", "2 400 × 3,2 + 2 400 × 0,75", "= 7 680 + 1 800 = 9 480 kg"],
      punch: "Vind som vektorer, bränsle som proportionalitet, inflygning som trigonometri — antagningsproven är fulla av matte.",
    },
    {
      id: "malare",
      namn: "Målare",
      vag: "Bygg- och anläggningsprogrammet, måleri",
      rakning: ["Rum: 4 × 5 m, höjd 2,4 m, två varv", "Väggyta: 2 · (4+5) · 2,4 = 43,2 m²", "43,2 × 2 ÷ 8 m²/liter = 10,8 → 11 liter"],
      punch: "Area, omkrets och åtgång per kvadratmeter — den som räknar fel får åka och köpa mer färg. På egen tid.",
    },
  ];

  let valtId = $state("underskoterska");
  const valt = $derived(YRKEN.find((y) => y.id === valtId));

  // --- Musikvågor (samma matematik som i grafen: bråket 3:2) ---
  const WW = 480;
  function wavePath(periods, amp, yMid) {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * WW;
      const y = yMid - amp * Math.sin((i / 240) * periods * 2 * Math.PI);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }
  function sumPath(yMid) {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * WW;
      const t = (i / 240) * 2 * Math.PI;
      const y = yMid - 9 * (Math.sin(2 * t) + Math.sin(3 * t));
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }
</script>

<div class="valjare">
  <p class="fraga">Välj ditt drömyrke:</p>
  <div class="chips" role="tablist" aria-label="Drömyrken">
    {#each YRKEN as y}
      <button
        role="tab"
        aria-selected={valtId === y.id}
        class:active={valtId === y.id}
        onclick={() => (valtId = y.id)}
      >{y.namn}</button>
    {/each}
  </div>

  <div class="panel">
    <p class="vag">{valt.namn} · <span>{valt.vag}</span></p>

    {#if valt.visual === "vagor"}
      <svg viewBox="0 0 {WW} 156" role="img" aria-label="Två toner i förhållandet 3:2 bildar en ren kvint">
        <text x="0" y="12" class="wave-label">Grundton — 2 svängningar</text>
        <g class="wave-anim"><path d={wavePath(2, 12, 32)} class="wave w1" /><path d={wavePath(2, 12, 32)} transform="translate({WW} 0)" class="wave w1" /></g>
        <text x="0" y="66" class="wave-label">Kvinten — 3 svängningar på samma tid</text>
        <g class="wave-anim"><path d={wavePath(3, 12, 86)} class="wave w2" /><path d={wavePath(3, 12, 86)} transform="translate({WW} 0)" class="wave w2" /></g>
        <text x="0" y="118" class="wave-label">Tillsammans: harmoni — bråket 3:2</text>
        <g class="wave-anim"><path d={sumPath(140)} class="wave w3" /><path d={sumPath(140)} transform="translate({WW} 0)" class="wave w3" /></g>
      </svg>
    {:else if valt.visual === "takstol"}
      <svg viewBox="0 0 480 168" role="img" aria-label="Takstol: roten ur 3 i kvadrat plus 1,8 i kvadrat är ungefär 3,5 meter">
        <polygon points="40,128 440,128 240,32" class="truss" />
        <line x1="240" y1="32" x2="240" y2="128" class="hidden-line" />
        <line x1="40" y1="148" x2="440" y2="148" class="dim" />
        <line x1="40" y1="142" x2="40" y2="154" class="dim" />
        <line x1="440" y1="142" x2="440" y2="154" class="dim" />
        <text x="240" y="144" class="dim-text" text-anchor="middle">6,0 m</text>
        <line x1="252" y1="32" x2="252" y2="128" class="dim" />
        <text x="258" y="84" class="dim-text">1,8 m</text>
        <text x="112" y="72" class="answer" transform="rotate(-26 112 72)">√(3² + 1,8²) ≈ 3,5 m</text>
      </svg>
    {:else if valt.visual === "dos"}
      <div class="rakning">
        <span>Barn 12 kg · 15 mg/kg och dygn · 3 doser · lösning 40 mg/ml</span>
        <span>12 · 15 = 180 mg/dygn → 180 ÷ 3 = 60 mg/dos</span>
        <span class="svar">60 ÷ 40 = <strong>1,5 ml per dos</strong> — fel här är fel dos till ett barn</span>
      </div>
    {:else}
      <div class="rakning">
        {#each valt.rakning as rad, i}
          <span class:svar={i === valt.rakning.length - 1}>{rad}</span>
        {/each}
      </div>
    {/if}

    <p class="punch">{valt.punch}</p>
  </div>

  <p class="summering">
    <strong class="noll">11 av 12</strong> kräver godkänt i matematik för att
    ens komma in. Det tolfte — influencern — slipper kravet men räknar för sin
    inkomst varje dag.
  </p>
</div>

<style>
  .valjare {
    width: 100%;
    max-width: 520px;
  }
  .fraga {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin: 0 0 10px;
  }
  .chips {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }
  .chips button {
    padding: 7px 4px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    color: var(--text-secondary);
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    line-height: 1.25;
  }
  .chips button:hover {
    color: var(--text-primary);
    border-color: var(--text-muted);
  }
  .chips button.active {
    background: var(--hero-navy);
    border-color: var(--hero-navy);
    color: #ffffff;
  }
  .panel {
    background: var(--surface-1);
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 2px 12px rgba(22, 40, 58, 0.09);
    min-height: 240px;
  }
  .vag {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: var(--series-blue);
    margin: 0 0 12px;
  }
  .vag span {
    color: var(--text-muted);
    font-weight: 600;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: hidden;
  }
  .wave-label {
    font-size: 11px;
    fill: var(--text-muted);
  }
  .wave {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
  }
  .w1 { stroke: var(--series-blue); }
  .w2 { stroke: var(--series-magenta); }
  .w3 { stroke: var(--series-violet); }
  .wave-anim {
    animation: wave-slide 6s linear infinite;
  }
  @keyframes wave-slide {
    from { transform: translateX(0); }
    to { transform: translateX(-480px); }
  }
  .truss {
    fill: none;
    stroke: var(--series-blue);
    stroke-width: 2.5;
    stroke-linejoin: round;
  }
  .hidden-line {
    stroke: var(--baseline);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
  }
  .dim {
    stroke: var(--text-muted);
    stroke-width: 1;
  }
  .dim-text {
    font-size: 12px;
    fill: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
  .answer {
    font-size: 14px;
    font-weight: 700;
    fill: var(--series-red);
    font-variant-numeric: tabular-nums;
  }
  .rakning {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 12px 16px;
    background: var(--page-plane);
    border-radius: 6px;
    font-size: 13.5px;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
  .rakning .svar {
    color: var(--text-primary);
    font-weight: 600;
  }
  .punch {
    margin: 12px 0 0;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }
  .summering {
    margin: 12px 0 0;
    font-size: 13.5px;
    color: var(--text-secondary);
  }
  .noll {
    color: var(--series-red);
  }
  @media (max-width: 860px) {
    .chips {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
