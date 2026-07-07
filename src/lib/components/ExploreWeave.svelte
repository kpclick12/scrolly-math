<script>
  import ConceptGraph from "./ConceptGraph.svelte";
  import {
    CONCEPTS,
    STRANDS,
    descendantsOf,
    ancestorsOf,
    DEPTH,
  } from "../data/concepts.js";

  let selected = $state("brakbegrepp");

  const byId = new Map(CONCEPTS.map((c) => [c.id, c]));
  const concept = $derived(byId.get(selected));
  const nDesc = $derived(descendantsOf(selected).size);
  const nAnc = $derived(ancestorsOf(selected).size);
  const prereqLabels = $derived(concept.prereqs.map((p) => byId.get(p).label));
</script>

<section class="explore" aria-label="Utforska väven">
  <div class="explore-inner">
    <p class="explore-kicker">Utforska själv</p>
    <h2>Dra i en tråd</h2>
    <p class="explore-intro">
      Klicka på ett begrepp i väven. Blått är vad det står på — rött är allt
      som står på det.
    </p>
    <div class="explore-layout">
      <div class="explore-graph">
        <ConceptGraph mode="explore" {selected} onSelect={(id) => (selected = id)} />
      </div>
      <aside class="explore-panel">
        <p class="panel-strand" style="color: {STRANDS[concept.strand].color}">
          {STRANDS[concept.strand].label} · åk {concept.ak}
        </p>
        <h3>{concept.label}</h3>
        {#if prereqLabels.length}
          <p class="panel-row">
            <strong>Står direkt på:</strong>
            {prereqLabels.join(" · ")}
          </p>
        {:else}
          <p class="panel-row"><strong>Ett av vävens ankare</strong> — inga förkunskaper.</p>
        {/if}
        <div class="panel-stats">
          <div>
            <span class="panel-num">{nAnc}</span>
            <span class="panel-num-label">begrepp som det står på, totalt</span>
          </div>
          <div>
            <span class="panel-num rod">{nDesc}</span>
            <span class="panel-num-label">begrepp som står på det — och vacklar om det missas</span>
          </div>
          <div>
            <span class="panel-num">{DEPTH.get(selected)}</span>
            <span class="panel-num-label">steg lång är förkunskapskedjan hit</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

<style>
  .explore {
    background: var(--page-plane);
    border-top: 1px solid var(--border);
  }
  .explore-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 72px 32px 84px;
  }
  .explore-kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--series-blue);
    font-weight: 700;
    margin: 0 0 12px;
    text-align: center;
  }
  .explore h2 {
    font-family: var(--serif);
    font-size: clamp(26px, 4vw, 36px);
    text-align: center;
    margin: 0 0 10px;
  }
  .explore-intro {
    text-align: center;
    font-size: 15px;
    color: var(--text-secondary);
    max-width: 460px;
    margin: 0 auto 40px;
  }
  .explore-layout {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 40px;
    align-items: center;
  }
  .explore-graph {
    display: flex;
    justify-content: center;
  }
  .explore-panel {
    background: var(--surface-1);
    border-radius: 10px;
    padding: 26px 28px;
    box-shadow: 0 2px 14px rgba(22, 40, 58, 0.08);
    align-self: start;
    position: sticky;
    top: 24px;
  }
  .panel-strand {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    margin: 0 0 8px;
  }
  .explore-panel h3 {
    font-family: var(--serif);
    font-size: 24px;
    margin: 0 0 14px;
    line-height: 1.2;
  }
  .panel-row {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0 0 18px;
  }
  .panel-row strong {
    color: var(--text-primary);
  }
  .panel-stats {
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-top: 1px solid var(--border);
    padding-top: 18px;
  }
  .panel-stats > div {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .panel-num {
    font-family: var(--serif);
    font-size: 30px;
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    min-width: 48px;
    text-align: right;
  }
  .panel-num.rod {
    color: var(--series-red);
  }
  .panel-num-label {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.4;
  }
  @media (max-width: 860px) {
    .explore-layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .explore-panel {
      position: static;
    }
    .explore-inner {
      padding: 52px 20px 60px;
    }
  }
</style>
