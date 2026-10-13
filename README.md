# Reality Architecture · sito vetrina

Sito statico di Marco Gentile (Reality Architecture, DE ABUNDANTIA S.R.L.).
HTML + un solo CSS (`style.css`) + un piccolo JS (`main.js`), nessun framework, nessun cookie, nessuno script di terze parti.
I font (Lora e Poppins, da Google Fonts) sono ospitati nella cartella `fonts/`: il sito non contatta server esterni.

- Anteprima: https://bboygentile-png.github.io/ra-sito/
- Pubblicazione: GitHub Pages dal branch `main`, cartella `/`

## Struttura

| File | Cosa contiene |
|---|---|
| `index.html` | tutte le sezioni: hero, ti suona familiare, il metodo, chi è Marco, storie vere, per chi è, il percorso, risorse, domande, contatti, footer |
| `style.css` | stile unico (palette viola e oro del brand, font, animazioni, versione mobile, `prefers-reduced-motion`) |
| `main.js` | menu mobile, comparsa degli elementi (IntersectionObserver), parallax leggero, header allo scroll |
| `img/` | immagini d'atmosfera generate con ChatGPT (`hero`, `metodo`, `percorso`, `finale`), foto di Marco (`marco-*`), immagine di anteprima social (`og.jpg`) |
| `404.html` | sull'anteprima: pagina «non trovata». Sul dominio `realityarchitecture.it`: rimanda ogni percorso sconosciuto a `www.realityarchitecture.it/<percorso>` (come fa oggi il repo `realityarchitecture-redirect`) |
| `privacy/`, `cookie/`, `test-allineamento/`, … | piccole pagine che rimandano subito alla stessa pagina su `www` (rispondono 200, utile per anteprime dei link) |

Link delle risorse (tutti con `utm_source=sito&utm_medium=organico&utm_campaign=sito&utm_content=<voce>`):
quiz `…/test-allineamento` · 7 giorni (9€) `…/7-giorni-allinearti` · libro `…/lo-specchio` · La Mappa `…/la-mappa-corso-completo` · candidatura `…/candidatura`.

Regole del testo: voce in `mate/docs/brand.md` del repo principale; testimonianze solo da `mate/docs/testimonianze.md` (nome di battesimo, testo invariato, «Risultati personali, non garantiti» sotto soldi e salute).

## Situazione oggi (13/10/2026)

- **`realityarchitecture.it`** (dominio nudo): DNS con i 4 record A di GitHub Pages (185.199.108-111.153). Lo serve il repo **`bboygentile-png/realityarchitecture-redirect`** (file `CNAME` = `realityarchitecture.it`): `/` rimanda al quiz, ogni altro percorso a `www.realityarchitecture.it/<percorso>`.
- **`www.realityarchitecture.it`**: punta a Systeme (pagine del funnel). La radice `/` oggi dà 404.

## Proposta

1. Il sito vive su **`https://realityarchitecture.it/`** (questo repo).
2. Il `404.html` di questo repo conserva il comportamento di oggi: ogni percorso che non è del sito (es. `/test-allineamento`, `/privacy`, `/qualsiasi-cosa`) prosegue su `https://www.realityarchitecture.it/<percorso>`, con query string e `#`.
3. In Systeme la **homepage di `www`** rimanda al sito, così anche `www.realityarchitecture.it/` smette di dare 404.

Cosa cambia per chi arriva: chi scrive `realityarchitecture.it` vede il sito (con il quiz come azione principale) invece di finire direttamente nel quiz. Tutti i link con un percorso (`/test-allineamento`, `/lo-specchio`, `/candidatura`, …) continuano a funzionare come oggi. Le ads e il link in bio usano già `www`: non cambiano.

## Passaggio al dominio (lo fa Marco, o Claude solo dopo il suo «procedi»)

Meglio farlo la sera, quando c'è poco traffico. Tempo: 10-15 minuti, più l'attesa del certificato HTTPS (di solito pochi minuti, a volte fino a un'ora). **DNS e Aruba non si toccano**: i record A puntano già a GitHub Pages.

1. **Liberare il dominio dal vecchio repo** (un dominio può stare su un solo repo Pages):
   ```bash
   # togli il dominio personalizzato dalle impostazioni Pages del vecchio repo
   echo '{"cname":null}' | gh api -X PUT repos/bboygentile-png/realityarchitecture-redirect/pages --input -
   # togli anche il file CNAME, così non si ricollega da solo
   gh api -X DELETE repos/bboygentile-png/realityarchitecture-redirect/contents/CNAME \
     -f message='Dominio spostato sul sito ra-sito' \
     -f sha="$(gh api repos/bboygentile-png/realityarchitecture-redirect/contents/CNAME --jq .sha)"
   ```
   Il vecchio repo resta com'è (copia di sicurezza): per tornare indietro basta rifare i passi al contrario.

2. **Collegare il dominio a questo repo**:
   ```bash
   cd ra-sito
   echo 'realityarchitecture.it' > CNAME
   git add CNAME && git commit -m 'Dominio realityarchitecture.it' && git push
   gh api -X PUT repos/bboygentile-png/ra-sito/pages -f cname='realityarchitecture.it'
   ```

3. **Attendere il certificato e forzare HTTPS** (ripetere finché non risponde senza errori):
   ```bash
   gh api repos/bboygentile-png/ra-sito/pages --jq '{cname,status,https_certificate}'
   gh api -X PUT repos/bboygentile-png/ra-sito/pages -F https_enforced=true
   ```

4. **Verifiche** (tutte devono passare):
   ```bash
   curl -sI https://realityarchitecture.it/ | head -1                       # 200, è il sito
   curl -s https://realityarchitecture.it/ | grep -o '<title>[^<]*'         # titolo del sito
   curl -sI https://realityarchitecture.it/test-allineamento | head -1      # 200 (pagina che rimanda a www)
   curl -sI https://realityarchitecture.it/pagina-a-caso | head -1          # 404 di GitHub, il JS rimanda a www/pagina-a-caso
   curl -sI https://bboygentile-png.github.io/ra-sito/ | grep -i location   # rimanda a realityarchitecture.it
   ```
   Poi da telefono: aprire `realityarchitecture.it`, `realityarchitecture.it/test-allineamento?r=prova` (deve arrivare al quiz con `?r=prova`) e `realityarchitecture.it/privacy`.

5. **Homepage di `www` in Systeme** (facoltativo ma consigliato): creare una pagina con un solo blocco Raw HTML
   ```html
   <script>location.replace('https://realityarchitecture.it/')</script>
   <meta http-equiv="refresh" content="0;url=https://realityarchitecture.it/">
   <a href="https://realityarchitecture.it/">Vai al sito</a>
   ```
   e impostarla come pagina principale del dominio `www.realityarchitecture.it` (Impostazioni → Domini personalizzati in Systeme, oppure il passo del funnel senza percorso). Se Systeme non permette una homepage di dominio, `www.realityarchitecture.it/` resta 404 come oggi: impatto basso, nessuno ci arriva dalle ads.

6. **Dopo il passaggio**: in `index.html` si possono spostare `og:image` e `logo` da `bboygentile-png.github.io/ra-sito/...` a `https://realityarchitecture.it/...` (funzionano comunque anche così, GitHub rimanda in automatico). Inviare `https://realityarchitecture.it/sitemap.xml` in Google Search Console se è in uso.

### Tornare indietro
Togliere `CNAME` da questo repo e il dominio dalle sue impostazioni Pages, poi rimettere `CNAME` e dominio su `realityarchitecture-redirect` (stessi comandi, invertiti).

## Aggiornare il sito

Modificare i file e fare push su `main`: GitHub Pages pubblica da solo in circa un minuto.
Immagini: JPG qualità ~75 + WebP (`cwebp -q 72`), larghezza massima 1536 px.
