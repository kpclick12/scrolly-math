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
          : currentStep === 8
            ? "depth"
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
          I våras skrev {ov.arskull.toLocaleString("sv-SE")} niondeklassare det
          nationella provet i matematik. <strong>{String(ov.npAndelAE).replace(".", ",")}&nbsp;%</strong>
          fick A–E. Resten — nästan <strong>var fjärde elev</strong> — klarade
          inte godkänt-gränsen.
        </p>
        <p>
          Inget annat ämne är i närheten. Matematiken är där grundskolans
          resultatkris syns först, tydligast och kostar mest.
        </p>
      {:else if i === 1}
        <p>
          Och det är inte ett enskilt dåligt år. Andelen elever som lämnar
          nian med <strong>F i ämnesbetyget</strong> har stigit i tio år, och
          andelen som fälls på <strong>nationella provet</strong> ligger ännu
          högre — gapet mellan kurvorna har dessutom växt.
        </p>
        <p>
          Håll kvar blicken på det gapet. Vi kommer tillbaka till det om ett
          ögonblick.
        </p>
      {:else if i === 2}
        <p>
          Vad kostar kurvorna i människor? Behörighet till gymnasiets
          yrkesprogram kräver godkänt i svenska, engelska, matematik och fem
          ämnen till. I våras saknade
          <strong>{ov.obehoriga.toLocaleString("sv-SE")} elever</strong> den
          behörigheten.
        </p>
        <p>
          <strong>{ov.obehorigaMedFMatte}</strong> av dem — åtta av tio — saknar
          godkänt i just matematik. Och för en grupp var matten det enda som
          fattades: godkänt i allt annat, men dörren till gymnasiet stängd av
          ett enda ämne.
        </p>
        <div class="callout">
          <span class="callout-num">{ov.obehorigaEndastMatte}</span>
          <span class="callout-label">elever föll på matematiken ensam</span>
        </div>
      {:else if i === 3}
        <p>
          Minns gapet mellan kurvorna? Här är det, elev för elev. Rutnätet visar
          varje kombination av provbetyg och slutbetyg. De flesta ligger på
          diagonalen — provet och betyget säger samma sak.
        </p>
        <p>
          Men titta på de markerade rutorna: av eleverna som fick
          <strong>F på provet</strong> fick
          <strong>{String(ov.npFHojdaTillE).replace(".", ",")}&nbsp;%</strong> ändå godkänt i
          ämnesbetyget. Läraren väger in mer än ett provtillfälle — ofta helt
          rätt. Men det betyder också att slutbetyget kan dölja luckor som
          provet hittade. E:t på pappret fyller inte hålet i grunden.
        </p>
      {:else if i === 4}
        <p>
          För att förstå varför luckorna är så farliga i just matematik måste
          man se ämnet som det ser ut inifrån. Här är grundskolans matematik —
          <strong>78 begrepp från åk 1 till åk 9</strong>, ordnade nedifrån och
          upp. Varje linje betyder <em>"bygger på"</em>.
        </p>
        <p>
          Titta längst ner: antal, talraden, tiokamraterna — det är
          <strong>taluppfattningen</strong>, och av grafens 78 begrepp står
          <strong>57 ovanpå</strong> ettans addition och subtraktion.
          Grunden läggs i lågstadiet, våningarna byggs uppåt — och det är
          inget bygge man kan hoppa över ett moment i och ta igen senare.
          Varje ny sten står på flera gamla samtidigt.
        </p>
      {:else if i === 5}
        <p>
          En enda kedja, följd genom hela skolgången: <em>del av helhet</em> i
          trean blir <em>bråk</em> i fyran, <em>likvärdiga bråk</em> i femman,
          <em>procent</em> i sexan, <em>procenträkning</em> i sjuan,
          <em>förändringsfaktor</em> i åttan — och i nian står den som
          <strong>ränta, lån och privatekonomi</strong>.
        </p>
        <p>
          Tårtbitarna i trean och räntan på första bostadslånet är samma
          kunskap, åtta år senare.
        </p>
      {:else if i === 6}
        <p>
          Så vad händer om en elev är borta, okoncentrerad eller utan stöd de
          veckor i fyran när <strong>bråkbegreppet</strong> gås igenom — och
          ingen upptäcker det?
        </p>
        <p>
          <strong class="rod">20 begrepp</strong> — procent, sannolikhet,
          förändringsfaktor, privatekonomi — står nu på ett fundament som inte
          finns. Skolan går vidare enligt planen. Eleven sitter kvar på varje
          lektion och förstår mindre och mindre, utan att någon ser var det
          egentligen brast.
        </p>
      {:else if i === 7}
        <p>
          Det här är inte en metafor vi valt för att den är vacker — det är
          ett av de mest belagda resultaten i utbildningsforskningen.
        </p>
        <p>
          Tre studier, tre olika länder, samma slutsats: det tidiga avgör
          mest, bråken är gångjärnet mellan aritmetik och algebra, och gap
          som lämnas ifred växer av sig själva. Kumulativitet, mätt.
        </p>
      {:else if i === 8}
        <p>
          Grafen förklarar också något varje lärare hört tusen gånger:
          <em>"jag fattar ingenting, matte är svårt"</em>. I många ämnen kan
          den som halkat efter börja om — ett nytt kapitel i historia kräver
          inte förra kapitlet. I matematik står varje nytt moment överst på en
          kedja av förkunskaper, här upp till <strong>tolv steg lång</strong>.
        </p>
        <p>
          Mörkare färg = längre kedja. Den som bär på ett hål långt ner möter
          allt mörkare moment med samma hål under fötterna — och det som känns
          som <em>"jag är dålig på matte"</em> är oftast
          <strong>"jag saknar ett begrepp från tre årskurser sedan"</strong>.
          Svårt är inte samma sak som obegåvad. Det är oftast bara olagat.
        </p>
      {:else if i === 9}
        <p>
          Två saker i elevernas vardag har samtidigt gjort kedjorna svårare
          att bygga. Den ena är <strong>fokus</strong>: ett resonemang i åtta
          steg måste hållas ihop i arbetsminnet från början till slut — bryts
          tråden vid steg tre finns inget att fästa steg fyra i. Ett ämne som
          byggs i kedjor drabbas hårdare av splittrad uppmärksamhet än något
          annat.
        </p>
        <p>
          Den andra är att <strong>vardagens gratis matteträning
          försvann</strong>. En generation tränade taluppfattning dagligen
          utan att kalla det matte — växel på hundralappen, veckopeng i mynt.
          Kurvan här intill är verklig statistik: på tolv år föll
          kontantköpen från 39 till 8 procent. Talen barn möter är siffror på
          en skärm, inte mängder i handen — klassrummet måste numera stå för
          nästan hela träningen.
        </p>
      {:else if i === 10}
        <p>
          Fyll i vad som helst — svaret blir detsamma. En femtonåring som
          väljer bort matten fattar ett beslut om en framtid hen ännu inte
          kan se. Det är feltänkets kärna: <strong>man vet inte vilka dörrar
          man stänger, för man har inte hunnit upptäcka att de
          finns</strong>. Undersköterskan visste inte att jobbet innehåller
          läkemedelsberäkning. Elektrikern visste inte att Ohms lag är
          algebra. Förrän de stod där.
        </p>
        <p>
          Prova själv i panelen: välj ett drömyrke och se vilken matte som
          gömmer sig i det. Poängen är inte något enskilt exempel — det är
          att <strong>ingen i nian vet vilken av dörrarna hen själv kommer
          vilja öppna om fem år</strong>. Det enda sättet att hålla alla
          öppna är att grunden följer med.
        </p>
      {:else if i === 11}
        <p>
          Om grafen stämmer borde hålen synas i vår egen data — långt innan
          betygen sätts. Så vi följde <strong>årskullen som gick ut nian i
          våras</strong> bakåt: nationella provet i åk 3 våren 2019, åk 6 våren
          2022, åk 9 våren 2025.
        </p>
        <p>
          Andelen som inte når målen växer för varje kontrollstation:
          {String(data.kohort.checkpoints[0].andel).replace(".", ",")}&nbsp;% →
          {String(data.kohort.checkpoints[1].andel).replace(".", ",")}&nbsp;% →
          <strong>{String(data.kohort.checkpoints[2].andel).replace(".", ",")}&nbsp;%</strong>.
          Gapet stängs inte av sig självt. Det växer — precis som
          Matteuseffekten säger.
        </p>
      {:else if i === 12}
        <p>
          Men det starkaste beviset är att följa <strong>samma barn</strong>.
          Dela årskullen i två grupper efter ett enda mått: klarade de
          kravnivån på nationella provet i trean — som nioåringar?
        </p>
        <div class="callout">
          <span class="callout-num">{Math.round(villkorade.fAndelUnder)}&nbsp;%</span>
          <span class="callout-label">av dem som missade trean fick F i nian —
            mot <strong>{Math.round(villkorade.fAndelNadde)}&nbsp;%</strong> av dem som klarade den</span>
        </div>
        <p>
          <strong>Ett prov i årskurs tre förutsäger slutbetyget nästan ett
          decennium i förväg.</strong> Hålen försvann inte. De växte in i
          betygskatalogen.
        </p>
      {:else if i === 13}
        <p>
          Och ju senare ett hål lagas, desto tyngre blir jobbet. Även av dem
          som precis klarade sexan med ett E föll mer än var femte till F i
          nian.
        </p>
        <div class="callout">
          <span class="callout-num">8&nbsp;av&nbsp;10</span>
          <span class="callout-label">med F i sexan fick F även i nian
            ({String(data.kohort.fEfterAk6.find((d) => d.betygAk6 === "F").andelFAk9).replace(".", ",")}&nbsp;%)</span>
        </div>
        <p>
          Högstadiet reparerar alltså sällan mellanstadiets hål — det bygger
          vidare ovanpå dem, i högre tempo och med mer abstraktion. Ska
          grunden lagas behöver det ske tidigare, medan mindre står ovanpå.
        </p>
      {:else if i === 14}
        <p>
          Hur tidigt kan skolan se hålen? Redan <strong>första höstterminen i
          årskurs 1</strong>. Skolverkets obligatoriska bedömningsstöd i
          taluppfattning delar in eleverna i tre nivåer — och flaggar var
          sjätte elev för stöd, flera år innan något betyg sätts.
        </p>
        <p>
          Två saker i bilden förtjänar oro: gruppen på lägre nivå
          <strong>växer för varje år</strong> — och det som mäts är just de
          grundstenar som resten av bygget ska stå på.
        </p>
      {:else if i === 15}
        <p>
          Nationella provet i trean visar inte bara <em>vilka</em> elever som
          behöver hjälp — det visar <em>med vad</em>. I våras föll flest på
          <strong>mönster och talföljder</strong> och
          <strong>skriftliga räknemetoder</strong>: det tidiga algebratänket
          och positionssystemet.
        </p>
        <p>
          Titta tillbaka på grafen: det är precis de stenar som bråk,
          ekvationer och funktioner ska stå på. Var fjärde elev
          ({String(data.tidigaSignaler.npAk3MinstEtt).replace(".", ",")}&nbsp;%) missade minst
          ett delprov — rätt läst är det inte bara ett prov, det är en karta
          över var grunden behöver förstärkas. Sex år innan betyget sätts.
        </p>
      {:else if i === 16}
        <p>
          Det här är den ljusa punkten: <strong>kumulativiteten går åt båda
          hållen</strong>. Samma struktur som gör tidiga hål så dyra gör
          tidiga lagningar ovanligt lönsamma — ett lagat bråkbegrepp i fyran
          bär tjugo begrepp ovanför sig.
        </p>
        <p>
          Och forskningen visar att det fungerar: intensiv, riktad undervisning
          i små grupper på tidiga signaler har bland de största uppmätta
          effekterna i utbildningsforskningen. Signalerna finns — i ettans
          bedömningsstöd, i treans delprov. Frågan är inte var hålen sitter.
          Frågan är vem som lagar dem, och när.
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
