<script>
  import { fade } from "svelte/transition";
  import Scrolly from "../components/Scrolly.svelte";
  import BarChart from "../components/BarChart.svelte";
  import LineChart from "../components/LineChart.svelte";
  import Heatmap from "../components/Heatmap.svelte";
  import DotWaffle from "../components/DotWaffle.svelte";
  import StackedBars from "../components/StackedBars.svelte";
  import ConceptGraph from "../components/ConceptGraph.svelte";
  import ResearchCards from "../components/ResearchCards.svelte";
  import YrkesValjare from "../components/YrkesValjare.svelte";
  import KlossTorn from "../components/KlossTorn.svelte";

  let { data } = $props();

  let currentStep = $state(0);

  const ov = data.overview;

  // Betygsskalan: F = rött (status), E→A = en blå sekventiell ramp (magnitud).
  const BETYG_COLOR = {
    F: "#a7391d",
    E: "#bfd4e7",
    D: "#9cc0dd",
    C: "#649ecf",
    B: "#2d7fbe",
    A: "#0068b2",
  };
  const BETYG_LIGHT = new Set(["E", "D"]); // ljusa segment ⇒ mörk etikett

  const BETYG_ORDNING = ["A", "B", "C", "D", "E", "F"];

  // Steg 0 — NP-fördelningen åk 9
  const npBars = $derived(
    BETYG_ORDNING.map((b) => ({
      label: b === "F" ? "F — inte godkänt" : b,
      value: data.npFordelning.prov.find((d) => d.betyg === b).andel,
      color: b === "F" ? BETYG_COLOR.F : "var(--series-blue)",
    }))
  );

  // Steg 1 — F-trenden
  const trendSeries = $derived([
    {
      id: "prov",
      label: "F på nationella provet",
      color: "var(--series-red)",
      serie: data.fTrend.map((d) => ({ x: d.ar, y: d.provbetygF })),
    },
    {
      id: "amne",
      label: "F i ämnesbetyg",
      color: "var(--series-blue)",
      serie: data.fTrend.map((d) => ({ x: d.ar, y: d.amnesbetygF })),
    },
  ]);

  // Steg 2 — de 1 004 utan behörighet
  const waffleGroups = $derived([
    {
      count: ov.obehorigaEndastMatte,
      color: "#a7391d",
      label: "saknar godkänt ENBART i matematik",
    },
    {
      count: ov.obehorigaMedFMatte - ov.obehorigaEndastMatte,
      color: "#cc8370",
      label: "saknar matematik + fler ämnen",
    },
    {
      count: ov.obehoriga - ov.obehorigaMedFMatte,
      color: "#9aa7b4",
      label: "obehöriga av andra skäl (godkänt i matematik)",
    },
  ]);

  // Steg 3 — provbetyg × ämnesbetyg
  const matrisRows = BETYG_ORDNING;
  const matrisCols = ["F", "E", "D", "C", "B", "A"];
  const matrisCells = $derived(
    data.betygMatris.map((d) => ({ row: d.provbetyg, col: d.amnesbetyg, value: d.andel }))
  );

  // Steg 11 — kohortens tre kontrollstationer
  const kohortSeries = $derived([
    {
      id: "kohort",
      label: "av årskullen",
      color: "var(--series-red)",
      serie: data.kohort.checkpoints.map((c) => ({
        x: `${c.label} · ${c.ar}`,
        y: c.andel,
      })),
    },
  ]);

  // Steg 12 — åk 9-betyg villkorat på åk 3-resultat
  const villkorade = $derived(data.kohort.villkorade);
  const villkoradeRows = $derived(
    [
      { d: villkorade.underAk3, label: "Under kravnivån på NP i åk 3" },
      { d: villkorade.naddeAk3, label: "Nådde kravnivån i åk 3" },
    ].map(({ d, label }) => ({
      label,
      sublabel: `${d.antal.toLocaleString("sv-SE")} elever`,
      parts: [...d.ak9]
        .sort((a, b) => BETYG_ORDNING.indexOf(b.betyg) - BETYG_ORDNING.indexOf(a.betyg))
        .map((p) => ({
          key: p.betyg,
          value: p.andel,
          color: BETYG_COLOR[p.betyg],
          light: BETYG_LIGHT.has(p.betyg),
        })),
    }))
  );
  const betygLegend = ["F", "E", "D", "C", "B", "A"].map((b) => ({
    key: b,
    color: BETYG_COLOR[b],
  }));

  // Steg 13 — F i nian efter betyget i sexan
  const fEfterAk6Bars = $derived(
    data.kohort.fEfterAk6
      .filter((d) => ["F", "E", "D", "C"].includes(d.betygAk6))
      .map((d) => ({
        label: d.betygAk6 === "F" ? "F i åk 6" : `${d.betygAk6} i åk 6`,
        value: d.andelFAk9,
        color: d.betygAk6 === "F" ? BETYG_COLOR.F : "var(--series-blue)",
      }))
  );

  // Steg 14 — bedömningsstödet i åk 1
  const NIVA_COLOR = { lagre: "#a7391d", mellan: "#9cc0dd", hogre: "#0068b2" };
  const bedomningsRows = $derived(
    data.tidigaSignaler.bedomningsstod.map((d) => ({
      label: d.termin,
      parts: [
        { key: "Lägre nivå — behöver stöd", value: d.lagre, color: NIVA_COLOR.lagre },
        { key: "Mellannivå", value: d.mellan, color: NIVA_COLOR.mellan, light: true },
        { key: "Högre nivå", value: d.hogre, color: NIVA_COLOR.hogre },
      ],
    }))
  );
  const bedomningsLegend = [
    { key: "Lägre nivå — behöver stöd", color: NIVA_COLOR.lagre },
    { key: "Mellannivå", color: NIVA_COLOR.mellan },
    { key: "Högre nivå", color: NIVA_COLOR.hogre },
  ];

  // Steg 15 — NP åk 3 per delprov
  const delprovBars = $derived(
    data.tidigaSignaler.npAk3Delprov.map((d, i) => ({
      label: d.delprov,
      value: d.andel,
      color: i < 2 ? "var(--series-red)" : "var(--series-blue)",
    }))
  );

  // Enda verkliga statistiken på sidan: Riksbankens betalningsundersökning,
  // andel som betalade sitt senaste köp i butik med kontanter.
  const kontantSerie = [
    {
      id: "kontant",
      label: "betalade senaste köpet kontant",
      color: "var(--series-blue)",
      serie: [
        { x: 2010, y: 39 },
        { x: 2012, y: 33 },
        { x: 2014, y: 26 },
        { x: 2016, y: 15 },
        { x: 2018, y: 13 },
        { x: 2020, y: 9 },
        { x: 2022, y: 8 },
      ],
    },
  ];

  const forskningskort = [
    {
      finding:
        "Matematikkunskaper vid skolstart är den starkaste enskilda förutsägelsen för hur det går i skolan senare — starkare än läsning, koncentrationsförmåga eller social förmåga.",
      source:
        "Duncan m.fl. (2007), \"School readiness and later achievement\", Developmental Psychology — sex longitudinella studier, ~36 000 barn.",
    },
    {
      finding:
        "Hur väl en elev förstår bråk och division i mellanstadiet förutsäger algebrakunskaperna fem–sex år senare — även när IQ, läsförmåga och föräldrarnas utbildning räknats bort.",
      source:
        "Siegler m.fl. (2012), \"Early predictors of high school mathematics achievement\", Psychological Science — Storbritannien & USA.",
    },
    {
      finding:
        "Gapet växer av sig självt: elever som börjar starkt i matematik utvecklas dessutom snabbast, medan svaga startpositioner bromsar inlärningen — skillnaderna ökar för varje årskurs.",
      source:
        "Aunola m.fl. (2004), Journal of Educational Psychology — \"Matteuseffekten\" i matematik.",
    },
  ];

  // typ: "data" = våra resultat (röd markering + badge), annars bakgrund.
  const steps = [
    // ------------------------------------------------ Akt 1 · Läget ----
    { kicker: "Läget", headline: "Var fjärde klarar inte provet", typ: "data" },
    { kicker: "Trenden", headline: "Kurvorna pekar åt fel håll", typ: "data" },
    { kicker: "Vad det kostar", headline: "1 004 elever utan behörighet", typ: "data" },
    { kicker: "Prov mot betyg", headline: "Provet och betyget berättar olika saker", typ: "data" },
    // ------------------------------------------- Akt 2 · Vetenskapen ----
    { kicker: "Vetenskapen", headline: "Matematik byggs nedifrån" },
    { kicker: "Kedjan", headline: "Från tårtbitar i trean till räntan på första lånet" },
    { kicker: "Experimentet", headline: "Ta bort en enda byggsten" },
    { kicker: "Forskningen", headline: "Beläggen är entydiga" },
    // ------------------------------- Akt 3 · Svårt — och nödvändigt ----
    { kicker: "Elevernas fråga", headline: "”Varför är matte så svårt?”" },
    { kicker: "Elevernas vardag", headline: "Träningen försvann, avbrotten kom" },
    { kicker: "Elevernas fråga", headline: "”Varför ska jag kunna matte — jag ska ju bli …?”" },
    // ---------------------------------------------- Akt 4 · Kohorten ----
    { kicker: "Kohorten 2019–2025", headline: "Vi följde en hel årskull", typ: "data" },
    { kicker: "Kohorten 2019–2025", headline: "Hålen från trean blev betygen i nian", typ: "data" },
    { kicker: "Kohorten 2019–2025", headline: "Efter sexan är det brant uppför", typ: "data" },
    // ---------------------------------------- Akt 5 · Tidiga signaler ----
    { kicker: "Tidiga signaler", headline: "Signalen syns redan i ettan", typ: "data" },
    { kicker: "Tidiga signaler", headline: "Trean pekar ut var det brister", typ: "data" },
    // ------------------------------------------------ Akt 6 · Slutet ----
    { kicker: "Vägen framåt", headline: "En grund går att laga" },
  ];

  const graphMode = $derived(
    currentStep === 4
      ? "all"
      : currentStep === 5
        ? "chain"
        : currentStep === 6
          ? "missing"
          : currentStep === 16
            ? "all"
            : null
  );
</script>

<Scrolly onStepChange={(i) => (currentStep = i)}>
  {#snippet visual()}
    <div class="visual-stack">
      <!-- Grafen ligger kvar monterad över grafstegen (utanför {#key}) så att
           färgsättningen tonar mjukt mellan lägena istället för att ritas om. -->
      {#if graphMode}
        <div class="graph-wrap" transition:fade={{ duration: 250 }}>
          <ConceptGraph mode={graphMode} />
        </div>
      {/if}
      {#key currentStep}
        <div class="visual-frame" in:fade={{ duration: 250 }}>
          {#if currentStep === 0}
            <BarChart
              data={npBars}
              title="Provbetyg, nationella provet i matematik åk 9, våren 2025"
              maxValue={30}
            />
          {:else if currentStep === 1}
            <LineChart
              series={trendSeries}
              title="Andel elever med F i matematik åk 9, 2015–2025"
              note="Nationella proven ställdes in 2020–2021 (pandemin)."
            />
          {:else if currentStep === 2}
            <DotWaffle
              groups={waffleGroups}
              caption="Varje prick är en elev som våren 2025 lämnade åk 9 utan behörighet till gymnasiets yrkesprogram."
            />
          {:else if currentStep === 3}
            <Heatmap
              rows={matrisRows}
              cols={matrisCols}
              data={matrisCells}
              title="Andel av eleverna per kombination av provbetyg och ämnesbetyg, åk 9 våren 2025"
              rowTitle="Provbetyg (NP)"
              colTitle="Ämnesbetyg"
              lowLabel="Få elever"
              highLabel="Många"
              showValues={true}
              highlight={["F__E", "F__D"]}
            />
          {:else if currentStep === 7}
            <ResearchCards cards={forskningskort} />
          {:else if currentStep === 8}
            <KlossTorn />
          {:else if currentStep === 9}
            <LineChart
              series={kontantSerie}
              unit="%"
              labelAll={true}
              title="Andel som betalade sitt senaste köp i butik med kontanter (Riksbanken)"
              note="Verklig statistik: Riksbankens betalningsundersökningar 2010–2022."
            />
          {:else if currentStep === 10}
            <YrkesValjare />
          {:else if currentStep === 11}
            <LineChart
              series={kohortSeries}
              unit="%"
              labelAll={true}
              title="Samma årskull vid tre kontrollstationer: andel under kravnivån/med F på nationella provet"
            />
          {:else if currentStep === 12}
            <StackedBars
              rows={villkoradeRows}
              legend={betygLegend}
              title="Ämnesbetyg i matematik åk 9 (våren 2025), efter resultat på nationella provet i åk 3 (2019)"
            />
          {:else if currentStep === 13}
            <BarChart
              data={fEfterAk6Bars}
              title="Andel som fick F i åk 9, efter ämnesbetyg i åk 6 — samma årskull"
              maxValue={100}
            />
          {:else if currentStep === 14}
            <StackedBars
              rows={bedomningsRows}
              legend={bedomningsLegend}
              title="Bedömningsstödet i taluppfattning, hösten åk 1 — andel elever per nivå"
            />
          {:else if currentStep === 15}
            <BarChart
              data={delprovBars}
              title="Nationella provet åk 3 (våren 2025): andel elever som inte nådde kravnivån, per delprov"
              maxValue={30}
            />
          {/if}
        </div>
      {/key}
    </div>
  {/snippet}

  {#each steps as step, i}
    <section class="scrolly-step" class:is-data={step.typ === "data"} data-index={i}>
      <p class="kicker">
        {#if step.typ === "data"}<span class="typ-badge">Våra resultat</span>{/if}
        {step.kicker}
      </p>
      <h2>{step.headline}</h2>
      {#if i === 0}
        <p>
          I våras skrev {ov.arskull.toLocaleString("sv-SE")} elever i årskurs 9
          det nationella provet i matematik.
          <strong>{String(ov.npAndelAE).replace(".", ",")}&nbsp;%</strong> fick
          provbetyget A–E. Nästan <strong>var fjärde elev</strong> nådde
          alltså inte godkänd nivå.
        </p>
        <p>
          Inget annat ämne ligger i närheten av de nivåerna. Matematiken är
          det ämne där flest elever inte når målen, och där konsekvenserna
          för den enskilda eleven blir störst.
        </p>
      {:else if i === 1}
        <p>
          Resultatet är inte en tillfällighet för ett enskilt år. Andelen
          elever som lämnar årskurs 9 med <strong>F i ämnesbetyget</strong>
          har ökat under tio års tid, och andelen som inte klarar det
          <strong>nationella provet</strong> är ännu högre. Skillnaden mellan
          de två kurvorna har dessutom blivit större.
        </p>
        <p>
          Vad den skillnaden består i återkommer vi till längre ner.
        </p>
      {:else if i === 2}
        <p>
          Bakom kurvorna finns enskilda elever. För behörighet till gymnasiets
          yrkesprogram krävs godkänt betyg i svenska, engelska och matematik
          samt i minst fem andra ämnen. I våras saknade
          <strong>{ov.obehoriga.toLocaleString("sv-SE")} elever</strong> den
          behörigheten.
        </p>
        <p>
          <strong>{ov.obehorigaMedFMatte}</strong> av dem, ungefär åtta av
          tio, saknade godkänt betyg i just matematik. För en mindre grupp
          var matematiken det enda ämne som fattades: de hade godkänt i allt
          annat.
        </p>
        <div class="callout">
          <span class="callout-num">{ov.obehorigaEndastMatte}</span>
          <span class="callout-label">elever saknade behörighet enbart på grund av matematiken</span>
        </div>
      {:else if i === 3}
        <p>
          Diagrammet visar samma elever fördelade efter både provbetyg och
          slutbetyg. De flesta ligger på diagonalen, där provet och betyget
          ger samma bild.
        </p>
        <p>
          De markerade rutorna visar något annat: av eleverna som fick
          <strong>F på provet</strong> fick
          <strong>{String(ov.npFHojdaTillE).replace(".", ",")}&nbsp;%</strong> ändå godkänt
          slutbetyg. Läraren ska väga in mer underlag än ett enskilt
          provtillfälle, och det är ofta rimligt. Men det innebär också att
          slutbetyget kan dölja kunskapsluckor som provet visar. Ett godkänt
          betyg fyller inte luckan i sig.
        </p>
      {:else if i === 4}
        <p>
          För att förstå varför luckor får så stora följder i just matematik
          behöver man se hur ämnet är uppbyggt. Bilden visar grundskolans
          matematik som <strong>78 begrepp från årskurs 1 till 9</strong>,
          ordnade nedifrån och upp. Varje linje betyder <em>"bygger på"</em>.
        </p>
        <p>
          Längst ner finns antal, talraden och tiokamraterna, det som kallas
          <strong>taluppfattning</strong>. <strong>57 av grafens 78
          begrepp</strong> bygger, direkt eller indirekt, på den addition och
          subtraktion som lärs in i årskurs 1. Grunden läggs i lågstadiet,
          och varje senare moment förutsätter att flera tidigare finns på
          plats.
        </p>
      {:else if i === 5}
        <p>
          Bilden följer en enda kedja genom skolgången: <em>del av helhet</em>
          i årskurs 3 blir <em>bråk</em> i fyran, <em>likvärdiga bråk</em> i
          femman, <em>procent</em> i sexan, <em>procenträkning</em> i sjuan
          och <em>förändringsfaktor</em> i åttan. I nian handlar samma kedja
          om <strong>ränta, lån och privatekonomi</strong>.
        </p>
        <p>
          Tårtbitarna i trean och räntan på det första bostadslånet är samma
          kunskap, i olika stadier, med åtta år emellan.
        </p>
      {:else if i === 6}
        <p>
          Vad händer då om en elev är frånvarande, okoncentrerad eller utan
          stöd under de veckor i årskurs 4 när <strong>bråkbegreppet</strong>
          införs, och ingen upptäcker det?
        </p>
        <p>
          <strong class="rod">20 begrepp</strong>, bland annat procent,
          sannolikhet, förändringsfaktor och privatekonomi, bygger vidare på
          det momentet. Undervisningen går vidare enligt planeringen, medan
          eleven förstår allt mindre av det som följer. Utan rätt underlag är
          det svårt för skolan att se var den ursprungliga luckan finns.
        </p>
      {:else if i === 7}
        <p>
          Att matematiken är uppbyggd på det här sättet är inte en bild vi
          valt själva. Det hör till de mest belagda resultaten i
          utbildningsforskningen.
        </p>
        <p>
          Tre studier från olika länder pekar åt samma håll: tidiga
          matematikkunskaper har stor betydelse för senare resultat,
          förståelsen av bråk är avgörande för övergången till algebra, och
          skillnader som inte åtgärdas tenderar att växa över tid.
        </p>
      {:else if i === 8}
        <p>
          Bilden med de två tornen illustrerar något många lärare känner
          igen: elever som upplever att matematiken plötsligt blivit
          obegriplig. Båda tornen får <strong>samma klossar i samma
          ordning</strong>. Till vänster blir raderna kompletta och
          försvinner; momenten är befästa och arbetsminnet frigörs för nästa
          steg. Till höger lämnades ett enda hål i årskurs 4.
        </p>
        <p>
          Raderna ovanför hålet blir aldrig kompletta, och nya luckor
          uppstår ovanpå den första. Eleven arbetar hårdare men får sämre
          resultat, trots att uppgifterna är desamma. Det som upplevs som
          <em>"jag är dålig på matte"</em> handlar ofta om
          <strong>ett begrepp som saknas sedan flera årskurser
          tillbaka</strong> — en lucka som går att åtgärda, inte en brist på
          begåvning.
        </p>
      {:else if i === 9}
        <p>
          Två förändringar i elevernas vardag har samtidigt gjort kedjorna
          svårare att bygga. Den första gäller
          <strong>koncentration</strong>. Ett resonemang i flera steg måste
          hållas samman i arbetsminnet från början till slut. Bryts
          uppmärksamheten mitt i behöver eleven börja om, och ett ämne som
          bygger på långa kedjor påverkas mer än andra.
        </p>
        <p>
          Den andra gäller <strong>vardagens träning</strong>. Tidigare
          generationer övade taluppfattning dagligen utan att tänka på det,
          bland annat med kontanter och växelpengar. Diagrammet bygger på
          verklig statistik från Riksbanken: på tolv år minskade andelen
          kontantköp från 39 till 8 procent. Barn möter i dag oftare tal som
          siffror på en skärm än som mängder i handen, och skolan får därmed
          stå för en större del av träningen.
        </p>
      {:else if i === 10}
        <p>
          Frågan förtjänar ett ärligt svar, oavsett vilket yrke man sätter
          in i den. En femtonåring som väljer bort matematiken fattar ett
          beslut om en framtid som ännu inte går att överblicka:
          <strong>man vet inte vilka vägar man stänger, eftersom man ännu
          inte har upptäckt att de finns</strong>. Få blivande
          undersköterskor vet att yrket kräver läkemedelsberäkning, och få
          blivande elektriker att Ohms lag är algebra.
        </p>
        <p>
          Panelen intill visar tolv vanliga yrkesval och den matematik som
          ingår i dem. Ingen elev i årskurs 9 vet säkert vilket av dem som
          blir aktuellt om fem år. Godkänd matematik är det som håller
          alternativen öppna.
        </p>
      {:else if i === 11}
        <p>
          Om grafen stämmer bör luckorna synas i resultaten långt innan
          betygen sätts. Vi följde därför <strong>årskullen som gick ut
          årskurs 9 i våras</strong> bakåt i tiden: nationella provet i
          årskurs 3 våren 2019, i årskurs 6 våren 2022 och i årskurs 9 våren
          2025.
        </p>
        <p>
          Andelen elever som inte når kravnivån ökar vid varje mättillfälle:
          {String(data.kohort.checkpoints[0].andel).replace(".", ",")}&nbsp;%,
          {String(data.kohort.checkpoints[1].andel).replace(".", ",")}&nbsp;% och till sist
          <strong>{String(data.kohort.checkpoints[2].andel).replace(".", ",")}&nbsp;%</strong>.
          Skillnaderna jämnas inte ut under skolgången utan förstärks. Det
          är samma mönster som forskningen beskriver.
        </p>
      {:else if i === 12}
        <p>
          Tydligast blir bilden när man följer <strong>samma elever</strong>.
          Vi delade årskullen i två grupper utifrån ett enda mått: om de
          nådde kravnivån på det nationella provet i årskurs 3.
        </p>
        <div class="callout">
          <span class="callout-num">{Math.round(villkorade.fAndelUnder)}&nbsp;%</span>
          <span class="callout-label">av dem som inte nådde kravnivån i trean fick F i nian
            — mot <strong>{Math.round(villkorade.fAndelNadde)}&nbsp;%</strong> av dem som nådde den</span>
        </div>
        <p>
          <strong>Ett prov i årskurs 3 ger alltså en stark indikation på
          slutbetyget sex år senare.</strong> Luckorna försvann inte under
          mellantiden.
        </p>
      {:else if i === 13}
        <p>
          Ju senare en lucka åtgärdas, desto svårare blir det. Även bland
          elever som klarade årskurs 6 med betyget E fick mer än var femte F
          i årskurs 9.
        </p>
        <div class="callout">
          <span class="callout-num">8&nbsp;av&nbsp;10</span>
          <span class="callout-label">med F i sexan fick F även i nian
            ({String(data.kohort.fEfterAk6.find((d) => d.betygAk6 === "F").andelFAk9).replace(".", ",")}&nbsp;%)</span>
        </div>
        <p>
          Högstadiet reparerar sällan mellanstadiets luckor. Undervisningen
          bygger vidare i högre tempo och med mer abstrakta moment. Ska
          grunden åtgärdas behöver det ske tidigare, medan färre moment
          hunnit byggas ovanpå.
        </p>
      {:else if i === 14}
        <p>
          Hur tidigt kan skolan se luckorna? Redan under
          <strong>första höstterminen i årskurs 1</strong>. Skolverkets
          obligatoriska bedömningsstöd i taluppfattning delar in eleverna i
          tre nivåer och visar vilka som behöver stöd, flera år innan några
          betyg sätts.
        </p>
        <p>
          Två saker i bilden är oroande: gruppen på den lägre nivån
          <strong>har vuxit för varje år</strong>, och det som mäts är just
          de grundläggande färdigheter som resten av matematiken bygger på.
        </p>
      {:else if i === 15}
        <p>
          Det nationella provet i årskurs 3 visar inte bara <em>vilka</em>
          elever som behöver stöd, utan också <em>inom vilka områden</em>. I
          våras var det flest som inte nådde kravnivån i
          <strong>mönster och talföljder</strong> samt
          <strong>skriftliga räknemetoder</strong>, det vill säga det tidiga
          algebratänkandet och positionssystemet.
        </p>
        <p>
          Det är samma områden som bråk, ekvationer och funktioner senare
          bygger på. Var fjärde elev
          ({String(data.tidigaSignaler.npAk3MinstEtt).replace(".", ",")}&nbsp;%) nådde inte
          kravnivån i minst ett delprov. Rätt använt är provet en karta över
          var grunden behöver förstärkas, sex år innan betyget sätts.
        </p>
      {:else if i === 16}
        <p>
          Sambandet går åt båda hållen. Samma uppbyggnad som gör tidiga
          luckor kostsamma gör <strong>tidiga insatser
          verkningsfulla</strong>: ett åtgärdat bråkbegrepp i årskurs 4 bär
          de tjugo begrepp som bygger på det.
        </p>
        <p>
          Forskningen visar också att det fungerar. Intensiv, riktad
          undervisning i liten grupp utifrån tidiga signaler hör till de
          insatser som har störst uppmätt effekt. Underlagen finns redan, i
          ettans bedömningsstöd och i treans delprov. Frågan är hur de
          används, och när.
        </p>
      {/if}
    </section>
  {/each}
</Scrolly>

<style>
  .visual-stack {
    position: relative;
    width: 100%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .visual-frame {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .graph-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  :global(.scrolly-step) {
    background: var(--surface-1);
    border-left: 6px solid var(--hero-navy);
    padding: 28px 32px;
    box-shadow: 0 2px 10px rgba(22, 40, 58, 0.08);
  }
  /* Stegen som visar våra egna resultat — berättelsens ryggrad — markeras
     rött; bakgrunds- och forskningssteg behåller marinblått. */
  :global(.scrolly-step.is-data) {
    border-left-color: var(--series-red);
  }
  .typ-badge {
    display: inline-block;
    background: var(--series-red);
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    border-radius: 3px;
    margin-right: 8px;
    transform: translateY(-1px);
  }
  :global(.scrolly-step > *) {
    opacity: 0.35;
    transition: opacity 0.3s ease;
  }
  :global(.scrolly-step.is-active > *) {
    opacity: 1;
  }
  :global(.scrolly-step) .kicker {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--series-blue);
    margin: 0 0 8px;
    font-weight: 700;
  }
  :global(.scrolly-step) h2 {
    font-family: var(--serif);
    margin: 0 0 14px;
    font-size: 24px;
    line-height: 1.2;
  }
  :global(.scrolly-step) p {
    margin: 0 0 12px;
    font-size: 15px;
    line-height: 1.6;
  }
  :global(.scrolly-step) p:last-child {
    margin-bottom: 0;
  }
  .rod {
    color: var(--series-red);
  }
  /* Utropssiffran — nyckeltalen ska inte kunna gömma sig i brödtexten. */
  .callout {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 14px 0 12px;
    padding: 12px 16px;
    background: var(--page-plane);
    border-radius: 6px;
  }
  .callout-num {
    font-family: var(--serif);
    font-size: 34px;
    font-weight: 700;
    color: var(--series-red);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    line-height: 1;
  }
  .callout-label {
    font-size: 13px;
    line-height: 1.45;
    color: var(--text-secondary);
  }
</style>
