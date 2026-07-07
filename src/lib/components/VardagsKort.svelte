<script>
  // "Varför behöver jag algebra?" — ett verkligt räkneexempel ur ett yrke,
  // plus små kort som visar matten i andra vardagar.
</script>

<div class="vardagskort">
  <article class="huvudkort">
    <p class="yrke">Undersköterska · läkemedelsberäkning</p>
    <p class="uppgift">
      Ett barn som väger <strong>12 kg</strong> ska ha
      <strong>15 mg läkemedel per kg</strong> och dygn, fördelat på
      <strong>3 doser</strong>. Lösningen innehåller <strong>40 mg/ml</strong>.
    </p>
    <div class="rakning">
      <span class="ekv">12 · 15 = 180 mg/dygn</span>
      <span class="ekv">180 ÷ 3 = 60 mg/dos</span>
      <span class="ekv resultat">60 ÷ 40 = <strong>1,5 ml per dos</strong></span>
    </div>
    <p class="poang">
      Fyra räknesätt, proportionalitet och enhetsbyten — bråk- och
      procentkedjan ur grafen. Räknar man fel här får ett barn fel dos.
    </p>
  </article>

  <div class="smakort">
    <article>
      <p class="yrke">Snickare</p>
      <p>Skala 1:50, materialåtgång, vinklar — geometrikedjan.</p>
    </article>
    <article>
      <p class="yrke">Elektriker</p>
      <p>Ohms lag är en formel att lösa ut ur — algebrakedjan.</p>
    </article>
    <article>
      <p class="yrke">Din privatekonomi</p>
      <p>Ränta, avbetalning, "50 % extra" — procentkedjan.</p>
    </article>
  </div>
</div>

<style>
  .vardagskort {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .huvudkort {
    background: var(--surface-1);
    border-radius: 8px;
    padding: 20px 22px;
    box-shadow: 0 2px 12px rgba(22, 40, 58, 0.09);
    border-top: 4px solid var(--series-blue);
    animation: kort-in 0.5s ease backwards;
  }
  .yrke {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    color: var(--series-blue);
    margin: 0 0 10px;
  }
  .uppgift {
    font-size: 14.5px;
    line-height: 1.55;
    margin: 0 0 14px;
  }
  .rakning {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
    background: var(--page-plane);
    border-radius: 6px;
    margin-bottom: 14px;
  }
  .ekv {
    font-variant-numeric: tabular-nums;
    font-size: 14px;
    color: var(--text-secondary);
  }
  .ekv.resultat {
    color: var(--text-primary);
    font-size: 15px;
  }
  .poang {
    font-size: 13px;
    line-height: 1.55;
    color: var(--text-muted);
    margin: 0;
  }
  .smakort {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .smakort article {
    background: var(--surface-1);
    border-radius: 6px;
    padding: 12px 14px;
    box-shadow: 0 1px 6px rgba(22, 40, 58, 0.06);
    animation: kort-in 0.5s ease backwards;
  }
  .smakort article:nth-child(1) { animation-delay: 150ms; }
  .smakort article:nth-child(2) { animation-delay: 260ms; }
  .smakort article:nth-child(3) { animation-delay: 370ms; }
  .smakort .yrke {
    margin-bottom: 6px;
    font-size: 11px;
  }
  .smakort p:not(.yrke) {
    font-size: 12.5px;
    line-height: 1.5;
    margin: 0;
    color: var(--text-secondary);
  }
  @keyframes kort-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (max-width: 860px) {
    .smakort {
      grid-template-columns: 1fr;
    }
  }
</style>
