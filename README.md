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

### 1. DNS

Înregistrează un record **A**:

```
v-charge.volta.md  →  195.178.106.107
```

### 2. Repo pe GitHub

```bash
git add .
git commit -m "Initial V CHARGE landing"
git remote add origin git@github.com:USER/v-charge.git
git push -u origin main
```

### 3. Setup pe VPS (o singură dată)

```bash
ssh user@195.178.106.107

sudo mkdir -p /var/www
cd /var/www
sudo git clone git@github.com:USER/v-charge.git v-charge
sudo chown -R $USER:$USER v-charge

sudo cp /var/www/v-charge/deploy/nginx-v-charge.volta.md.conf /etc/nginx/sites-available/v-charge-volta-md
sudo ln -sf /etc/nginx/sites-available/v-charge-volta-md /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d v-charge.volta.md
```

### 4. Update (după fiecare push)

```bash
# local
git push origin main

# pe VPS
cd /var/www/v-charge && ./scripts/deploy-vps.sh
```
