# Delivery Horizon

Delivery Horizon è una dashboard logistica per stimare l’arrivo della merce dal fornitore, pianificare la consegna al cliente e verificare la fattibilità della data richiesta. Il riepilogo e il calendario si aggiornano mentre modifichi i parametri.

[English guide](#english-guide)

## Come vengono calcolate le date

- **Lead Time Fornitore**. Il planner aggiunge alla data dell’ordine il numero di settimane indicato. Una settimana corrisponde a sette giorni di calendario. Se la data risultante cade in un giorno escluso, il planner la sposta al primo giorno disponibile.
- **Gap Days**. Alla data stimata di arrivo della merce il planner aggiunge sette giorni di calendario e applica di nuovo le esclusioni. Se le due stime cadono in mesi diversi, riparte dal primo giorno disponibile del mese di consegna per riallineare le date di fatturazione.
- **Richiesta cliente**. Il planner accetta una data richiesta con un anticipo massimo di sette giorni rispetto alla stima. Se cade in un giorno escluso, la sposta in avanti e ricalcola l’arrivo del fornitore a partire da sette giorni prima della consegna. Se l’anticipo supera la soglia, evidenzia la richiesta come incompatibile e mantiene le stime.

## Funzionalità

- Calendario interattivo di 12 mesi a partire dal mese corrente, espandibile a 24 mesi.
- Riepilogo con date evidenziate nel calendario, accessibili dalle relative schede.
- Festività nazionali italiane escluse per impostazione predefinita, con Pasquetta calcolata per ogni anno e San Francesco d’Assisi dal 2026. [Legge 8 ottobre 2025, n. 151](https://www.normattiva.it/eli/id/2025/10/10/25G00153/ORIGINAL)
- Chiusure aziendali con intervalli inclusivi, salvate nel browser tramite `localStorage`.
- Avvisi per richieste incompatibili, date spostate e fatturazione su mesi diversi.
- Interfaccia in italiano e inglese. Il browser salva la lingua selezionata e la ripristina alla visita successiva.

## Guida rapida

1. Scarica la repository e apri `index.html` nel browser. Per usare un server locale, se hai Python esegui `python -m http.server 8000` dalla cartella del progetto e apri [Delivery Horizon in locale](http://localhost:8000/).
2. Scegli **Italiano** o **English** nel selettore **Lingua**. L’interfaccia parte in italiano e il cambio è immediato.
3. Imposta la data dell’ordine, il lead time in settimane e, se disponibile, la data richiesta dal cliente. Fai doppio clic su un giorno del calendario per assegnarlo all’ordine o alla richiesta.
4. Deseleziona **Salta le festività nazionali italiane** per includere le festività infrasettimanali tra i giorni lavorativi. Il calcolo esclude sempre sabato, domenica e chiusure aziendali.
5. Usa **Pianifica Chiusure Aziendali** per registrare ferie, chiusure e festività locali. I nomi inseriti vengono visualizzati così come li hai scritti.

I tre file dell’app vanno mantenuti nella stessa cartella. Il progetto usa HTML, CSS e JavaScript senza passaggi di build. Outfit, Font Awesome e Toastify vengono caricati da CDN. Per pubblicarlo su GitHub Pages, usa come sorgente la radice del branch che contiene `index.html`.

## English guide

Delivery Horizon estimates supplier arrivals and customer deliveries and checks whether a requested delivery date is feasible. The calendar starts with 12 months and can expand to 24.

- **Supplier lead time** adds the selected number of calendar weeks to the order date, then moves the estimate forward to the next working day.
- **Gap Days** add seven calendar days to the supplier estimate before applying the working-day rules again. When the estimates fall in different months, the planner recalculates from the first available day in the delivery month to align billing.
- **Requested delivery** can be up to seven calendar days earlier than the estimate. The planner moves an accepted date to the next working day when needed and recalculates the supplier estimate. Earlier requests trigger a warning.

Open `index.html` and select **English** in the sidebar. The language updates immediately and is saved in your browser. Enter an order date, supplier lead time and an optional requested delivery date. Double-click a calendar date to use it in the plan.

The planner excludes weekends and company closures. **Skip Italian public holidays** is enabled by default. Use **Manage Company Closures** to record company breaks or local holidays. Closure names and the language preference are stored in the browser.

Keep `index.html`, `style.css` and `app.js` together. No build step is required. To publish with GitHub Pages, use the branch root containing `index.html` as the source.
