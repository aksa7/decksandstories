UŽDUOTIS: Sugeneruok šios savaitės Decks&Stories newsletter HTML iš
šablono templates/newsletter-weekly.html.

=== ŠIOS SAVAITĖS TURINYS ===

INTERNATIONAL MIX
DJ nick: [ĮRAŠYK]
YouTube linkas: [ĮRAŠYK]
Trumpas aprašymas (kas jis, iš kur, koks vaibas): [ĮRAŠYK]

STUDIO SESSION
(jei nebuvo šią savaitę, parašyk "NĖRA" ir Cursor ištrins visą bloką)
DJ nick: [ĮRAŠYK arba NĖRA]
YouTube linkas: [ĮRAŠYK]
Trumpas aprašymas: [ĮRAŠYK]

PICK A QUESTION
Instagram posto linkas: [ĮRAŠYK]

PAPILDOMOS NAUJIENOS
(nebūtina, jei nėra — palik tuščią)
[ĮRAŠYK arba palik tuščią]

=== INSTRUKCIJOS CURSOR'UI (nekeisti kas savaitę) ===

1. Atidaryk templates/newsletter-weekly.html, NEKEISK jo tiesiogiai —
   sukurk kopiją į output/newsletter-{YYYY-MM-DD}.html (šios savaitės
   penktadienio data), ir dirbk su ta kopija.

2. Užpildyk placeholder'ius aukščiau pateikta informacija:
   - {{MIX_TITLE}} → sukurk trumpą, patrauklų pavadinimą iš DJ nick +
     aprašymo (pvz. "International Mix: [Nick] — [vibe žodis]"), NE
     tiesiog nukopijuok visą aprašymą į antraštę
   - {{MIX_URL}} — PAKEISK ABI VIETAS FAILE (thumbnail nuoroda IR
     "Watch" mygtukas — jos abi turi tą patį placeholder'į)
   - {{MIX_THUMB}} → ištrauk YouTube video ID iš linko ir sudėk į
     https://img.youtube.com/vi/{ID}/maxresdefault.jpg
   - Tą patį pakartok SESSION_* laukams. Jei DJ nick = "NĖRA" arba
     tuščias, IŠTRINK visą HTML komentaro bloką nuo
     <!-- 4. Studio Session --> iki jo uždarančio </tr>, prieš
     <!-- 5. Pick a Question --> — nepalik tuščių ar pusiau užpildytų
     laukų.
   - {{IG_URL}} → įrašyk pateiktą Instagram linką
   - {{WEEK_INTRO}} → parašyk 1-2 sakinius natūralia, šilta kalba
     "This week" bloke. STRIKTI TAISYKLĖ: joks tekstas šiame faile
     (WEEK_INTRO ar bet kur kitur) negali turėti ilgųjų brūkšnių (—),
     posakių "dive into", "unleash", "elevate", "in the world of",
     per daug taisyklingos/simetriškos sakinio struktūros, ar bet ko,
     kas skamba kaip akivaizdžiai AI sugeneruotas tekstas. Rašyk taip,
     kaip žmogus rašytų draugams žinutę — trumpai, konkrečiai, be
     perteklinio patoso. Jei yra papildomų naujienų aukščiau, natūraliai
     jas įpink į šį intro arba pridėk kaip papildomą sakinį po pagrindinio.
   - {{{RESEND_UNSUBSCRIBE_URL}}} (trys riestiniai skliaustai) — ŠITO
     NIEKADA NELIESK, palik lygiai tokį, koks yra šablone.

3. Kai baigsi, patikrink visą failą: paieška per "{{" po redagavimo
   turi rasti TIK likusį {{{RESEND_UNSUBSCRIBE_URL}}} ir nieko daugiau.
   Jei liko bet koks kitas {{...}} placeholder — tai bug'as, sutvarkyk
   prieš baigdamas.

4. Parodyk man PILNĄ galutinio HTML failo turinį atsakyme (ne tik
   diff'ą) — man reikia jį iš karto nukopijuoti tiesiai į Resend HTML
   code editor.