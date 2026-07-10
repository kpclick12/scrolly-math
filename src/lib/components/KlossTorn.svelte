<script module>
  // Två klossbräden, samma bitar i samma ordning — enda skillnaden är att
  // det högra lämnar ett hål tidigt. Fyllda rader försvinner (momentet är
  // automatiserat och arbetsminnet frigörs); rader med hål blir aldrig
  // klara, och golvet stiger. Ett kontrollerat experiment, inte ett spel.
  const W = 8;
  const ROWS = 9;

  // [bredd, kolumn] — vänster fyller raderna; höger har EN tidig felplacering.
  const DROPS_L = [[3,0],[3,3],[2,6],[2,0],[3,2],[3,5],[3,1],[2,5],[1,0],[1,7],[1,4],[2,3],[3,0],[2,5],[1,7],[3,1],[1,0],[2,4],[2,6],[3,4],[2,0],[1,7],[1,2],[1,3]];
  const DROPS_R = DROPS_L.map((d, i) => (i === 1 ? [3, 4] : d));

  function simulate(drops) {
    let heights = Array(W).fill(0);
    let cells = [];
    let cleared = 0;
    const frames = [];

    const snap = (nya = []) => {
      const filled = new Set(cells.map((c) => `${c.x},${c.y}`));
      const holes = [];
      for (let x = 0; x < W; x++)
        for (let y = 0; y < heights[x]; y++)
          if (!filled.has(`${x},${y}`)) holes.push({ x, y });
      frames.push({
        cells: cells.map((c) => ({ ...c, ny: nya.some((n) => n.x === c.x && n.y === c.y) })),
        holes,
        cleared,
      });
    };

    snap();
    let pieceNr = 0;
    for (const [w, c] of drops) {
      const y = Math.max(...heights.slice(c, c + w));
      const nr = pieceNr++;
      const nya = [];
      for (let x = c; x < c + w; x++) {
        nya.push({ x, y, p: nr });
        heights[x] = y + 1;
      }
      cells = cells.concat(nya.map((n) => ({ x: n.x, y: n.y, p: n.p })));
      snap(nya);

      // fulla rader försvinner
      const perRow = {};
      cells.forEach((cl) => (perRow[cl.y] = (perRow[cl.y] || 0) + 1));
      const fulla = Object.keys(perRow).filter((y) => perRow[y] === W).map(Number).sort((a, b) => b - a);
      if (fulla.length) {
        for (const fy of fulla) {
          cells = cells.filter((cl) => cl.y !== fy).map((cl) => (cl.y > fy ? { ...cl, y: cl.y - 1 } : cl));
        }
        cleared += fulla.length;
        heights = Array(W).fill(0);
        cells.forEach((cl) => (heights[cl.x] = Math.max(heights[cl.x], cl.y + 1)));
        snap();
      }
    }
    return frames;
  }

  const FRAMES_L = simulate(DROPS_L);
  const FRAMES_R = simulate(DROPS_R);
  const N_FRAMES = Math.max(FRAMES_L.length, FRAMES_R.length);

  const CELL = 20;
  const GAP = 2;
  const BW = W * CELL;
  const BH = ROWS * CELL;
  // Samma färgspråk som begreppsgrafen: klossarna är moment ur kursplanens
  // områden. Problemlösningens röda utgår här — rött är reserverat för hålen.
  const OMRADEN = [
    { farg: "var(--series-blue)", label: "Taluppfattning & tal" },
    { farg: "var(--series-violet)", label: "Algebra" },
    { farg: "var(--series-green)", label: "Geometri" },
    { farg: "var(--series-yellow)", label: "Sannolikhet & statistik" },
    { farg: "var(--series-magenta)", label: "Samband & förändring" },
  ];
  const FARGER = OMRADEN.map((o) => o.farg);
</script>

<script>
  import { onMount } from "svelte";

  let frame = $state(0);
  onMount(() => {
    const t = setInterval(() => {
      frame = frame >= N_FRAMES + 3 ? 0 : frame + 1; // liten paus på sluttavlan
    }, 620);
    return () => clearInterval(t);
  });

  const fL = $derived(FRAMES_L[Math.min(frame, FRAMES_L.length - 1)]);
  const fR = $derived(FRAMES_R[Math.min(frame, FRAMES_R.length - 1)]);
</script>

<figure class="klosstorn">
  <figcaption class="title">
    Samma klossar, samma ordning — enda skillnaden är ett hål tidigt
  </figcaption>
  <div class="boards">
    {#each [{ f: fL, rubrik: "Utan hål", not: "klara rader försvinner — momentet är automatiserat" }, { f: fR, rubrik: "Ett hål i fyran", not: "raderna med hål blir aldrig klara — golvet stiger", hal: true }] as b}
      <div class="board-wrap">
        <p class="board-rubrik" class:rod={b.hal}>{b.rubrik}</p>
        <svg viewBox="-1 -1 {BW + 2} {BH + 2}" role="img" aria-label="{b.rubrik}: {b.not}">
          <rect x="-1" y="-1" width={BW + 2} height={BH + 2} class="ram" />
          {#each b.f.cells as c (c.p + "-" + c.x)}
            <rect
              x={c.x * CELL + GAP / 2}
              y={(ROWS - 1 - c.y) * CELL + GAP / 2}
              width={CELL - GAP}
              height={CELL - GAP}
              rx="2.5"
              class="kloss"
              class:ny={c.ny}
              fill={FARGER[c.p % FARGER.length]}
            />
          {/each}
          {#each b.f.holes as h}
            <rect
              x={h.x * CELL + 2.5}
              y={(ROWS - 1 - h.y) * CELL + 2.5}
              width={CELL - 5}
              height={CELL - 5}
              rx="2.5"
              class="hal"
            />
          {/each}
        </svg>
        <p class="rakna">
          Klara rader: <strong class:rod={b.hal}>{b.f.cleared}</strong>
          {#if b.hal && b.f.holes.length}
            · hål kvar: <strong class="rod">{b.f.holes.length}</strong>
          {/if}
        </p>
        <p class="board-not">{b.not}</p>
      </div>
    {/each}
  </div>
  <div class="legend">
    {#each OMRADEN as o}
      <span class="legend-item"><span class="swatch" style="background:{o.farg}"></span>{o.label}</span>
    {/each}
    <span class="legend-item"><span class="swatch swatch-hal"></span>hål — missat moment</span>
  </div>
  <p class="note">
    Klossarna är moment ur kursplanens områden, med samma färger som i
    begreppsgrafen. Hålet går inte att fylla i efterhand utan att först
    lyfta bort allt som byggts ovanpå. Bilden är en illustration, inte ett
    spel.
  </p>
</figure>

<style>
  .klosstorn {
    margin: 0;
    width: 100%;
    max-width: 520px;
  }
  .title {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 14px;
  }
  .boards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }
  .board-rubrik {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 6px;
  }
  .board-rubrik.rod {
    color: var(--series-red);
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .ram {
    fill: var(--surface-1);
    stroke: var(--baseline);
    stroke-width: 1;
    rx: 4;
  }
  .kloss {
    transition: y 0.25s ease;
  }
  .kloss.ny {
    animation: kloss-in 0.45s cubic-bezier(0.3, 0.9, 0.4, 1.05) backwards;
  }
  @keyframes kloss-in {
    from {
      transform: translateY(-40px);
      opacity: 0.4;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .hal {
    fill: none;
    stroke: var(--series-red);
    stroke-width: 1.8;
    stroke-dasharray: 3 3;
  }
  .rakna {
    margin: 8px 0 2px;
    font-size: 12.5px;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
  .rakna strong {
    color: var(--text-primary);
  }
  .rakna .rod,
  .rod {
    color: var(--series-red);
  }
  .board-not {
    font-size: 11.5px;
    line-height: 1.45;
    color: var(--text-muted);
    margin: 0;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 14px;
    margin-top: 14px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    color: var(--text-secondary);
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .swatch-hal {
    background: transparent;
    outline: 1.8px dashed var(--series-red);
    outline-offset: -1px;
  }
  .note {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-muted);
  }
</style>
