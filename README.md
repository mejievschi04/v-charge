# V CHARGE — landing

Pagină statică pentru promovarea aplicației mobile **V CHARGE** (încărcare EV).

**URL producție:** `https://v-charge.volta.md/`

## Local

```bash
npx --yes serve .
# sau: python3 -m http.server 8080
```

Deschide `http://localhost:3000`.

## Pagini

- `index.html` — landing download
- `termeni.html` — termeni și condiții
- `confidentialitate.html` — politica de confidențialitate

## Linkuri magazine

Editează `config.js` când ai URL-urile reale:

```js
window.VOLTA_EV_PROMO = {
  iosStoreUrl: '#download',
  androidStoreUrl: '#download',
};
```

## Deploy pe VPS (`v-charge.volta.md`)

VPS: `195.178.106.107` · site static (Nginx) · update prin `git pull`.

Repo: https://github.com/mejievschi04/v-charge.git

Comenzile concrete pentru setup pe VPS sunt în `DEPLOY-VPS.local.md` (local, gitignored).
