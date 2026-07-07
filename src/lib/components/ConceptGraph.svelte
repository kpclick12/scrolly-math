<script module>
  import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceX,
    forceY,
    forceCollide,
  } from "d3-force";
  import {
    CONCEPTS,
    STRANDS,
    CHAIN,
    MISSING_NODE,
    descendantsOf,
    ancestorsOf,
    RIPPLE_ORDER,
    DEPTH,
    MAX_DEPTH,
  } from "../data/concepts.js";

  export const W = 640;
  export const H = 700;

  // Layouten beräknas en gång och delas av alla instanser — grafen ska se
  // exakt likadan ut i varje scrollsteg, bara färgsättningen ändras.
  const STRAND_X = { tal: 0.3, alg: 0.62, geo: 0.84, sta: 0.14, sam: 0.5, pro: 0.72 };
  const yForAk = (ak) => H - 64 - ((ak - 1) / 8) * (H - 130);

  const nodes = CONCEPTS.map((c) => ({
    ...c,
    x: STRAND_X[c.strand] * W + (((c.id.charCodeAt(0) * 7919) % 100) - 50) * 0.6,
    y: yForAk(c.ak),
  }));
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const links = CONCEPTS.flatMap((c) =>
    c.prereqs.map((p) => ({ source: p, target: c.id }))
  );

  forceSimulation(nodes)
    .force("link", forceLink(links).id((d) => d.id).distance(34).strength(0.06))
    .force("charge", forceManyBody().strength(-26))
    .force("x", forceX((d) => STRAND_X[d.strand] * W).strength(0.14))
    .force("y", forceY((d) => yForAk(d.ak)).strength(0.85))
    .force("collide", forceCollide(12))
    .stop()
    .tick(300);

  nodes.forEach((n) => {
    n.x = Math.max(18, Math.min(W - 18, n.x));
    n.y = Math.max(20, Math.min(H - 44, n.y));
  });

  const chainSet = new Set(CHAIN);
  const missingSet = descendantsOf(MISSING_NODE);
  const foundationSet = new Set(
    CONCEPTS.filter((c) => c.strand === "tal" && c.ak <= 3).map((c) => c.id)
  );
  // Sekventiell blå ramp för djup-läget (ljus → mörk = kort → lång förkunskapskedja)
  const DEPTH_RAMP = ["#bfd4e7", "#9cc0dd", "#649ecf", "#2d7fbe", "#0068b2", "#004f88"];
  const depthColor = (id) =>
    DEPTH_RAMP[Math.min(DEPTH_RAMP.length - 1, Math.floor((DEPTH.get(id) / MAX_DEPTH) * DEPTH_RAMP.length))];

  function edgePath(l) {
    const s = typeof l.source === "object" ? l.source : nodeById.get(l.source);
    const t = typeof l.target === "object" ? l.target : nodeById.get(l.target);
    const mx = (s.x + t.x) / 2 + (t.y - s.y) * 0.08;
    const my = (s.y + t.y) / 2 - (t.x - s.x) * 0.08;
    return `M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`;
  }
</script>

<script>
  // mode: "all" | "foundation" | "chain" | "missing" | "depth" | "explore"
  // I explore-läget är noderna klickbara; valt begrepp lyser med sina
  // förkunskaper, och allt som bygger på det får röda ringar.
  let { mode = "all", title = "", selected = null, onSelect = null } = $props();

  const exploreAncestors = $derived(
    mode === "explore" && selected ? ancestorsOf(selected) : null
  );
  const exploreDescendants = $derived(
    mode === "explore" && selected ? descendantsOf(selected) : null
  );

  const isOn = (id) => {
    if (mode === "foundation") return foundationSet.has(id);
    if (mode === "chain") return chainSet.has(id);
    if (mode === "explore" && selected)
      return id === selected || exploreAncestors.has(id) || exploreDescendants.has(id);
    return true;
  };
  const isBroken = (id) =>
    (mode === "missing" && missingSet.has(id)) ||
    (mode === "explore" && selected != null && exploreDescendants.has(id));
  const isRemoved = (id) => mode === "missing" && id === MISSING_NODE;
  const isSelected = (id) => mode === "explore" && id === selected;

  function edgeState(l) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (mode === "chain")
      return chainSet.has(s) && chainSet.has(t) ? "hi" : "off";
    if (mode === "foundation")
      return foundationSet.has(s) && foundationSet.has(t)
        ? "hi"
        : foundationSet.has(s)
          ? "half"
          : "off";
    if (mode === "missing")
      return s === MISSING_NODE || missingSet.has(s) ? "broken" : "dim";
    if (mode === "explore" && selected) {
      const anc = (id) => id === selected || exploreAncestors.has(id);
      if (anc(s) && anc(t)) return "hi";
      if (s === selected || exploreDescendants.has(s)) return "broken";
      return "off";
    }
    return "dim";
  }

  const fillFor = (n) => {
    if (isSelected(n.id)) return STRANDS[n.strand].color;
    if (isRemoved(n.id)) return "var(--surface-1)";
    if (isBroken(n.id)) return "var(--gridline)";
    if (mode === "depth") return depthColor(n.id);
    return STRANDS[n.strand].color;
  };

  // Skadan sprider sig uppåt nivå för nivå i missa-läget.
  const rippleDelay = (id) =>
    mode === "missing" && missingSet.has(id)
      ? (RIPPLE_ORDER.get(id) ?? 1) * 130
      : 0;

  // Etiketter: bara där de bär berättelsen — aldrig alla 78.
  const labelled = $derived(
    mode === "chain"
      ? CHAIN
      : mode === "missing"
        ? [MISSING_NODE, "procentbegrepp", "ranta", "sannolikhet79", "linjarafunktioner"]
        : mode === "foundation"
          ? ["antal", "positionssystemet", "delarhelhet"]
          : mode === "explore" && selected
            ? [selected]
            : []
  );
  const labelSet = $derived(new Set(labelled));

  const AK_TICKS = [1, 3, 5, 7, 9];
</script>

<figure class="conceptgraph">
  {#if title}<figcaption class="title">{title}</figcaption>{/if}
  <svg viewBox="0 0 {W} {H}" role="img" aria-label={title || "Begreppsgraf över grundskolans matematik"}>
    {#each AK_TICKS as ak}
      <text x="6" y={yForAk(ak)} class="ak-tick" dominant-baseline="middle">åk {ak}</text>
    {/each}

    {#each links as l}
      {@const s = typeof l.source === "object" ? l.source.id : l.source}
      <path
        d={edgePath(l)}
        class="edge {edgeState(l)}"
        style="transition-delay: {rippleDelay(s)}ms"
      />
    {/each}

    {#each nodes as n (n.id)}
      <circle
        cx={n.x}
        cy={n.y}
        r={isRemoved(n.id) || isSelected(n.id) ? 9 : chainSet.has(n.id) && mode === "chain" ? 8 : 6}
        class="node"
        class:off={!isOn(n.id)}
        class:broken={isBroken(n.id)}
        class:removed={isRemoved(n.id)}
        class:selected={isSelected(n.id)}
        class:clickable={mode === "explore"}
        style="fill: {fillFor(n)}; transition-delay: {rippleDelay(n.id)}ms"
        role={mode === "explore" ? "button" : undefined}
        tabindex={mode === "explore" ? 0 : undefined}
        aria-label={mode === "explore" ? n.label : undefined}
        onclick={mode === "explore" ? () => onSelect?.(n.id) : undefined}
        onkeydown={mode === "explore"
          ? (e) => (e.key === "Enter" || e.key === " ") && onSelect?.(n.id)
          : undefined}
      >
        <title>{n.label} · åk {n.ak} · {STRANDS[n.strand].label}</title>
      </circle>
      {#if isRemoved(n.id)}
        <text x={n.x} y={n.y} class="cross" text-anchor="middle" dominant-baseline="central">✕</text>
      {/if}
    {/each}

    {#each labelled as id, i}
      {@const n = nodeById.get(id)}
      {@const flip = n.x > W * 0.72}
      <!-- Grannar på samma årskurs-nivå kolliderar annars — växla sida uppåt/nedåt -->
      {@const dy = i % 2 === 0 ? -1 : 13}
      <text
        x={n.x + (flip ? -12 : 12)}
        y={n.y + dy}
        class="node-label"
        class:removed-label={isRemoved(id)}
        text-anchor={flip ? "end" : "start"}
        dominant-baseline="middle"
        style="animation-delay: {i * 120}ms"
      >{n.label}</text>
    {/each}
  </svg>

  {#if mode === "depth"}
    <div class="legend">
      <span class="legend-note">Färg = längd på förkunskapskedjan:</span>
      {#each DEPTH_RAMP as c}<span class="swatch" style="background:{c}"></span>{/each}
      <span class="legend-note">kort → lång (upp till {MAX_DEPTH} steg)</span>
    </div>
  {:else if mode === "missing"}
    <div class="legend">
      <span class="swatch removed-swatch">✕</span>
      <span class="legend-note">missat begrepp</span>
      <span class="swatch" style="background: var(--gridline); outline: 2px solid var(--series-red); outline-offset: -2px;"></span>
      <span class="legend-note">{missingSet.size} begrepp som bygger på det</span>
    </div>
  {:else}
    <div class="legend">
      {#each Object.entries(STRANDS) as [key, s]}
        <span class="legend-item" class:muted={mode === "foundation" && key !== "tal"}>
          <span class="swatch" style="background:{s.color}"></span>{s.label}
        </span>
      {/each}
    </div>
  {/if}
</figure>

<style>
  .conceptgraph {
    margin: 0;
    width: 100%;
    max-width: 560px;
  }
  .title {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  svg {
    width: 100%;
    height: auto;
    max-height: 74svh;
    display: block;
  }
  .ak-tick {
    font-size: 11px;
    fill: var(--text-muted);
  }
  .edge {
    fill: none;
    stroke: var(--baseline);
    stroke-width: 1;
    stroke-opacity: 0.5;
    transition: stroke 0.45s ease, stroke-opacity 0.45s ease, stroke-width 0.45s ease;
  }
  .edge.off {
    stroke-opacity: 0.12;
  }
  .edge.half {
    stroke-opacity: 0.35;
  }
  .edge.hi {
    stroke: var(--text-secondary);
    stroke-width: 1.8;
    stroke-opacity: 0.9;
  }
  .edge.broken {
    stroke: var(--series-red);
    stroke-opacity: 0.55;
    stroke-dasharray: 4 3;
  }
  .edge.dim {
    stroke-opacity: 0.25;
  }
  .node {
    stroke: var(--surface-1);
    stroke-width: 1.5;
    transition: fill 0.45s ease, opacity 0.45s ease, r 0.45s ease;
  }
  .node.off {
    opacity: 0.16;
  }
  .node.broken {
    stroke: var(--series-red);
    stroke-width: 2;
  }
  .node.removed {
    stroke: var(--series-red);
    stroke-width: 2.5;
    stroke-dasharray: 3 3;
  }
  .node.selected {
    stroke: var(--text-primary);
    stroke-width: 2.5;
  }
  .node.clickable {
    cursor: pointer;
  }
  .node.clickable:hover {
    stroke: var(--text-primary);
    stroke-width: 2;
  }
  .cross {
    font-size: 10px;
    font-weight: 700;
    fill: var(--series-red);
    pointer-events: none;
  }
  .node-label {
    font-size: 12px;
    font-weight: 600;
    fill: var(--text-primary);
    paint-order: stroke;
    stroke: var(--page-plane);
    stroke-width: 3.5;
    stroke-linejoin: round;
    animation: label-in 0.4s ease backwards;
  }
  .removed-label {
    fill: var(--series-red);
  }
  @keyframes label-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    margin-top: 10px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
    transition: opacity 0.4s ease;
  }
  .legend-item.muted {
    opacity: 0.35;
  }
  .swatch {
    display: inline-block;
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  .removed-swatch {
    background: var(--surface-1);
    color: var(--series-red);
    font-size: 9px;
    font-weight: 700;
    line-height: 11px;
    text-align: center;
    outline: 2px dashed var(--series-red);
    outline-offset: -1px;
    border-radius: 50%;
  }
  .legend-note {
    font-size: 12px;
    color: var(--text-secondary);
  }
  @media (max-width: 860px) {
    .legend-item, .legend-note {
      font-size: 11px;
    }
  }
</style>
