<script>
  // Illustration (inte mätdata): en genomgång i åtta steg kräver
  // sammanhängande fokus — splittrad uppmärksamhet börjar om från steg 1.
  const W = 560;
  const ROW_H = 64;
  const BAR_Y = 26;
  const BAR_H = 22;
  const STEPS = 8;

  // Splittrat fokus: block om 2–4 "steg" med avbrott emellan.
  const blocks = [
    { start: 0, len: 3 },
    { start: 3.7, len: 2.2 },
    { start: 6.6, len: 1.4 },
  ];
  const unit = W / STEPS;
</script>

<figure class="fokus">
  <figcaption class="title">
    Att följa ett resonemang i åtta steg — med helt och med splittrat fokus
  </figcaption>
  <svg viewBox="0 0 {W} {ROW_H * 2 + 26}" role="img"
    aria-label="Illustration: sammanhängande fokus når steg åtta, splittrat fokus börjar om från steg ett vid varje avbrott">
    <!-- Sammanhängande -->
    <text x="0" y="14" class="row-label">Sammanhängande fokus</text>
    <rect x="0" y={BAR_Y} width={W} height={BAR_H} rx="5" class="bar-whole" />
    {#each Array.from({ length: STEPS }) as _, s}
      <text
        x={s * unit + unit / 2}
        y={BAR_Y + BAR_H / 2}
        class="step-num light"
        text-anchor="middle"
        dominant-baseline="central"
      >{s + 1}</text>
      {#if s > 0}
        <line x1={s * unit} y1={BAR_Y + 3} x2={s * unit} y2={BAR_Y + BAR_H - 3} class="step-sep" />
      {/if}
    {/each}
    <text x={W} y={BAR_Y + BAR_H + 16} class="verdict ok" text-anchor="end">framme vid steg 8 — det hänger ihop</text>

    <!-- Splittrat -->
    <text x="0" y={ROW_H + 14} class="row-label">Splittrat fokus</text>
    {#each blocks as b, bi}
      <rect
        x={b.start * unit}
        y={ROW_H + BAR_Y}
        width={b.len * unit}
        height={BAR_H}
        rx="5"
        class="bar-split"
      />
      {#each Array.from({ length: Math.floor(b.len) }) as _, s}
        <text
          x={b.start * unit + s * unit + unit / 2}
          y={ROW_H + BAR_Y + BAR_H / 2}
          class="step-num"
          text-anchor="middle"
          dominant-baseline="central"
        >{s + 1}</text>
      {/each}
      {#if bi < blocks.length - 1}
        {@const gapX = (b.start + b.len) * unit}
        {@const gapW = (blocks[bi + 1].start - b.start - b.len) * unit}
        <text x={gapX + gapW / 2} y={ROW_H + BAR_Y + BAR_H / 2} class="gap-mark" text-anchor="middle" dominant-baseline="central">✕</text>
        <text x={gapX + gapW / 2} y={ROW_H + BAR_Y - 7} class="gap-label" text-anchor="middle">avbrott</text>
      {/if}
    {/each}
    <text x={W} y={ROW_H + BAR_Y + BAR_H + 16} class="verdict bad" text-anchor="end">börjar om från steg 1 — kommer aldrig till steg 4</text>
  </svg>
  <p class="note">Illustration av arbetsminnets villkor — inte mätdata.</p>
</figure>

<style>
  .fokus {
    margin: 0;
    width: 100%;
    max-width: 560px;
  }
  .title {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 14px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .row-label {
    font-size: 12.5px;
    font-weight: 700;
    fill: var(--text-primary);
  }
  .bar-whole {
    fill: var(--series-blue);
  }
  .bar-split {
    fill: var(--series-red);
  }
  .step-sep {
    stroke: rgba(255, 255, 255, 0.45);
    stroke-width: 1;
  }
  .step-num {
    font-size: 11px;
    font-weight: 700;
    fill: rgba(255, 255, 255, 0.95);
    font-variant-numeric: tabular-nums;
  }
  .gap-mark {
    font-size: 12px;
    font-weight: 700;
    fill: var(--series-red);
  }
  .gap-label {
    font-size: 10px;
    fill: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .verdict {
    font-size: 12px;
    font-weight: 600;
  }
  .verdict.ok {
    fill: var(--series-blue);
  }
  .verdict.bad {
    fill: var(--series-red);
  }
  .note {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-muted);
  }
</style>
