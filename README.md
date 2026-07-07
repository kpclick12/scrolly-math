# Hål i grunden — matematiken i grundskolan

Scrollytelling-berättelse i data om matematikresultaten i grundskolan:
varför matematik är ett kumulativt ämne, hur tidiga kunskapshål syns i
ettans bedömningsstöd och treans nationella prov — och hur de sex år
senare blir F i nian och stängda gymnasiedörrar.

Systersida till [scrolly-absence](https://github.com/kpclick12/scrolly-absence)
("Tomma stolar") och byggd i samma stil: Svelte 5 + Vite + D3, sticky
scrollytelling med steg-kort.

## Innehåll

- **Läget** — NP-resultat åk 9, F-trenden 2015–2025, de 1 004 eleverna
  utan gymnasiebehörighet, provbetyg × ämnesbetyg ("snällbetygen").
- **Vetenskapen** — en handkurerad begreppsgraf över Lgr22:s matematik
  (78 begrepp, 115 "bygger på"-beroenden) med scrollstyrda lägen:
  hela bygget, grundstenarna, bråk→ränta-kedjan, "ta bort en byggsten", samt
  forskningsbelägg (Duncan 2007, Siegler 2012, Aunola 2004).
- **Elevernas frågor & vardag** — "varför är matte svårt?"
  (förkunskapskedjornas djup), splittrat fokus mot långa kedjor,
  kontanternas försvinnande (Riksbanken — sidans enda verkliga dataserie)
  och "jag ska bli undersköterska — varför algebra?" med en interaktiv
  panel: musikens kvint (bråket 3:2, animerade vågor), snickarens takstol
  (Pythagoras) och läkemedelsberäkning.
- **Vår data** — en årskull följd från NP åk 3 (2019) till slutbetyg åk 9
  (2025), villkorade utfall och betygströghet efter åk 6.
- **Tidiga signaler** — bedömningsstödet i taluppfattning åk 1 och NP åk 3
  per delprov.

## Data

All resultatdata är **syntetisk testdata**, genererad av
`scripts/generate-data.mjs` (deterministisk seed, elevnivåsimulering med
Matteus-drift) och kalibrerad mot verkliga storleksordningar — bl.a.
~75 % A–E på NP åk 9 och ~1 000 obehöriga varav ~800 utan godkänt i
matematik. Kör om med:

```sh
node scripts/generate-data.mjs
```

Begreppsgrafen är handkurerad i `src/lib/data/concepts.js`.

## Utveckling

```sh
npm install
npm run dev      # dev-server
npm run build    # produktionsbygge till dist/
```
