services/  →  parle à Supabase uniquement
stores/    →  appelle les services, gère l'état
views/     →  appelle les stores uniquement

SW = Service Worker — c'est un fichier JavaScript spécial qui tourne en arrière-plan dans le navigateur, séparé de ton app.
Il a deux rôles dans ton projet :
1. Cache PWA (ce que tu as déjà) — il mémorise les fichiers de l'app pour qu'elle fonctionne hors ligne. C'est les lignes install et fetch que tu as.
2. Push notifications (ce qu'on ajoute) — il reçoit les notifications envoyées par le serveur même quand l'app est fermée, parce qu'il tourne en fond.

src/services/    → code JS importé par ton app (Vite le compile)
public/          → fichiers servis tels quels, accessibles directement par URL

# depuis la branche dev
git add .
git commit -m "Fix push notifications (VAPID + sw + help + responsive)"
git push origin dev

# passer sur main
git checkout main
git pull origin main
git merge dev
git push origin main

## Checklist prod notifications

### 1) Secrets Supabase (Edge Function)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2) Déployer
- Front (Vercel): push sur `main`
- Function:
```bash
supabase functions deploy notifications
```

### 3) Vérifier le Service Worker prod
```bash
curl -s https://micro-defis.vercel.app/sw.js | grep -i "sw-push"
```
Attendu: `importScripts("/sw-push.js")`

### 4) Vérifier le cron auto
```sql
select jobid, jobname, schedule, active
from cron.job
where jobname = 'notifications-rappels';
```
Attendu: `active = true`

### 5) Vérifier l’abonnement user (Apple iOS)
```sql
select
  subscription::jsonb->>'endpoint' as endpoint,
  reminder_time_local,
  timezone,
  updated_at
from public.push_subscriptions
where user_id = 'USER_ID';
```
Attendu iPhone: endpoint `https://web.push.apple.com/...`

### 6) Test immédiat (sans attendre l’heure)
```bash
curl -X POST "https://odnvnewqvotgddgnlkuj.supabase.co/functions/v1/notifications" \
  -H "Authorization: Bearer TON_ANON_JWT" \
  -H "Content-Type: application/json" \
  -d '{"force":true,"user_id":"USER_ID"}'
```
Attendu: `"success":1`

### 7) Si `success:1` mais rien affiché
- Ouvrir l’app installée depuis l’écran d’accueil (iOS)
- Vérifier notifications iOS (lock screen + centre + bannières)
- Vérifier que `updated_at` de `push_subscriptions` bouge après réactivation
- Supprimer/réactiver l’abonnement user si besoin:
```sql
delete from public.push_subscriptions where user_id = 'USER_ID';
```
