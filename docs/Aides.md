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

Les notifications doivent être automatisées : ne redéploie pas pour un changement de créneau utilisateur, le `cron` lit `reminder_time_local` et `timezone` à chaque minute.

1) **Secrets fonction Edge**
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Vérifie qu’ils sont bien injectés dans la fonction `notifications`.

2) **Déploiements**
   - Front sur `main` (Vercel).
   - Edge function :
     ```bash
     supabase functions deploy notifications --project-ref odnvnewqvotgddgnlkuj
     ```

3) **Env. de test temporaire**
   - Pour activer le bouton “Test notifications” en prod : `VITE_ENABLE_NOTIFICATION_TEST=true`.
   - Tu peux le mettre dans un fichier `.env.production` ou dans les variables d’environnement de déploiement.

4) **Service Worker**
   - `curl -s https://micro-defis.vercel.app/sw.js | grep -i "sw-push"`
   - Attendu : `importScripts("/sw-push.js")`
   - Vérifier que `/sw-push.js` contient les écouteurs `push` + `notificationclick`.

5) **Cron automatique**
   - `http_post` doit être utilisé (pas `net.http_post`).
   - Exemple de recette SQL à exécuter dans Supabase SQL Editor :
     ```sql
     select cron.schedule(
       'notifications-rappels',
       '* * * * *',
       $$
       select http_post(
         url := 'https://odnvnewqvotgddgnlkuj.supabase.co/functions/v1/notifications',
         headers := jsonb_build_object(
           'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
           'Content-Type', 'application/json'
         ),
         body := '{}'::jsonb
       );
       $$
     );
     ```
   - Vérifie ensuite :
     ```sql
     select jobid, jobname, schedule, active from cron.job where jobname = 'notifications-rappels';
     ```

6) **Abonnement utilisateur**
   - `reminder_time_local` et `timezone` doivent être définis et valides (`Europe/Paris`, etc.).
   - Requêtes utiles :
     ```sql
     select
       subscription::jsonb->>'endpoint' as endpoint,
       reminder_time, reminder_time_local, timezone, updated_at
     from public.push_subscriptions
     where user_id = 'USER_ID';
     ```
   - L’endpoint iPhone commence par `https://web.push.apple.com/…`.

7) **Test serveur forcé**
   - Appelle la fonction avec le `service_role_key` (pas `anon`), `force` et `user_id`.
     ```bash
     curl -X POST "https://odnvnewqvotgddgnlkuj.supabase.co/functions/v1/notifications" \
       -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
       -H "Content-Type: application/json" \
       -d '{"force":true,"user_id":"USER_ID"}'
     ```
   - Attendu : `{"ok":true,"success":1,"sent":[...],"version":"notif-v19"}`

8) **Quand le push  passe mais rien n’apparaît**
   - Ouvre l’app (iOS/Android) depuis l’écran d’accueil.
   - Vérifie la permission système + l’état du badge.
   - Supprime/réinscrit l’abonnement si `updated_at` n’évolue pas :
     ```sql
     delete from public.push_subscriptions where user_id = 'USER_ID';
     ```
   - Sur iOS, les notifications disparaissent dans le Centre si tu as refusé à un moment — supprime l’appli, mets-la à jour et réactive.
