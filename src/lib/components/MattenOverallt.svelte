<script>
  // "Varför behöver jag matte?" — tre världar, samma kedjor ur grafen.
  // Musik: en ren kvint är frekvensbråket 3:2 (animerade vågor).
  // Bygge: Pythagoras i varje takstol. Vård: läkemedelsberäkning.
  let tab = $state("musik");

  // --- Musikvågor: grundton (2 perioder) mot kvint (3 perioder), samma tid.
  const WW = 480;
  const WAVE_H = 46;
  function wavePath(periods, amp, yMid, phase = 0) {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * WW;
      const y = yMid - amp * Math.sin((i / 240) * periods * 2 * Math.PI + phase);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }
  function sumPath(yMid) {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * WW;
      const t = (i / 240) * 2 * Math.PI;
      const y = yMid - 11 * (Math.sin(2 * t) + Math.sin(3 * t));
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }
</script>

<div class="overallt">
  <div class="tabs" role="tablist" aria-label="Matten i tre världar">
    <button role="tab" aria-selected={tab === "musik"} class:active={tab === "musik"} onclick={() => (tab = "musik")}>Musiken</button>
    <button role="tab" aria-selected={tab === "bygge"} class:active={tab === "bygge"} onclick={() => (tab = "bygge")}>Bygget</button>
    <button role="tab" aria-selected={tab === "vard"} class:active={tab === "vard"} onclick={() => (tab = "vard")}>Vården</button>
  </div>

  <div class="panel">
    {#if tab === "musik"}
      <svg viewBox="0 0 {WW} 210" role="img" aria-label="Två toner i frekvensförhållandet 3:2 bildar en ren kvint">
        <text x="0" y="14" class="wave-label">Grundton — 2 svängningar</text>
        <g class="wave-anim">
          <path d={wavePath(2, 15, 40)} class="wave w1" />
          <path d={wavePath(2, 15, 40, -2 * Math.PI)} transform="translate({WW} 0)" class="wave w1" />
        </g>
        <text x="0" y="82" class="wave-label">Kvinten ovanför — 3 svängningar på samma tid</text>
        <g class="wave-anim">
          <path d={wavePath(3, 15, 108)} class="wave w2" />
          <path d={wavePath(3, 15, 108, -3 * Math.PI)} transform="translate({WW} 0)" class="wave w2" />
        </g>
        <text x="0" y="152" class="wave-label">Tillsammans: mönstret upprepar sig — det hör du som harmoni</text>
        <g class="wave-anim">
          <path d={sumPath(182)} class="wave w3" />
          <path d={sumPath(182)} transform="translate({WW} 0)" class="wave w3" />
        </g>
      </svg>
      <p class="caption">
        En ren kvint — pianots C och G, refrängens tvåklang — är exakt
        <strong>bråket 3:2</strong>. En oktav är 2:1, en kvart 4:3. Musik som
        låter rätt är bråkräkning som hörs. Det visste redan Pythagoras.
      </p>
    {:else if tab === "bygge"}
      <svg viewBox="0 0 480 210" role="img" aria-label="Takstol med Pythagoras sats: 3 i kvadrat plus 1,8 i kvadrat, roten ur ger 3,5 meter">
        <!-- takstol -->
        <polygon points="40,170 440,170 240,60" class="truss" />
        <line x1="240" y1="60" x2="240" y2="170" class="hidden-line" />
        <!-- mått: spännvidd -->
        <line x1="40" y1="192" x2="440" y2="192" class="dim" />
        <line x1="40" y1="186" x2="40" y2="198" class="dim" />
        <line x1="440" y1="186" x2="440" y2="198" class="dim" />
        <text x="240" y="188" class="dim-text" text-anchor="middle">6,0 m</text>
        <!-- mått: resning -->
        <line x1="252" y1="60" x2="252" y2="170" class="dim" />
        <text x="258" y="118" class="dim-text">1,8 m</text>
        <!-- spärren -->
        <text x="120" y="102" class="answer" transform="rotate(-29 120 102)">√(3² + 1,8²) ≈ 3,5 m</text>
      </svg>
      <p class="caption">
        Snickaren som kapar spärrarna till en takstol löser en ekvation med
        <strong>Pythagoras sats</strong> — och läser hela huset i
        <strong>skala 1:50</strong>. Fel i beräkningen syns inte på ritningen.
        Det syns på taket.
      </p>
    {:else}
      <div class="dos">
        <p class="dos-uppgift">
          Ett barn som väger <strong>12 kg</strong> ska ha
          <strong>15 mg/kg</strong> och dygn, fördelat på <strong>3 doser</strong>.
          Lösningen innehåller <strong>40 mg/ml</strong>. Hur mycket drar du upp?
        </p>
        <div class="dos-rakning">
          <span>12 · 15 = 180 mg per dygn</span>
          <span>180 ÷ 3 = 60 mg per dos</span>
          <span class="dos-svar">60 ÷ 40 = <strong>1,5 ml per dos</strong></span>
        </div>
        <p class="caption">
          Undersköterskans läkemedelsberäkning är <strong>proportionalitet,
          bråk och enhetsbyten</strong> — kedjan ur grafen, med ett barns
          hälsa som insats. Provet i läkemedelsberäkning måste ofta klaras
          <em>felfritt</em> för att få ge medicin.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .overallt {
    width: 100%;
    max-width: 520px;
  }
  .tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 14px;
  }
  .tabs button {
    flex: 1;
    padding: 9px 0;
    font-size: 13.5px;
    font-weight: 700;
    font-family: inherit;
    color: var(--text-secondary);
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .tabs button:hover {
    color: var(--text-primary);
  }
  .tabs button.active {
    background: var(--hero-navy);
    border-color: var(--hero-navy);
    color: #ffffff;
  }
  .panel {
    background: var(--surface-1);
    border-radius: 10px;
    padding: 22px 24px;
    box-shadow: 0 2px 12px rgba(22, 40, 58, 0.09);
    min-height: 300px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: hidden;
  }
  .wave-label {
    font-size: 11.5px;
    fill: var(--text-muted);
  }
  .wave {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
  }
  .w1 { stroke: var(--series-blue); }
  .w2 { stroke: var(--series-magenta); }
  .w3 { stroke: var(--series-violet); stroke-width: 2.2; }
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
  .caption {
    margin: 14px 0 0;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }
  .dos-uppgift {
    font-size: 14.5px;
    line-height: 1.55;
    margin: 0 0 14px;
  }
  .dos-rakning {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
    background: var(--page-plane);
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
    font-size: 14px;
    color: var(--text-secondary);
  }
  .dos-svar {
    color: var(--text-primary);
    font-size: 15px;
  }
</style>
