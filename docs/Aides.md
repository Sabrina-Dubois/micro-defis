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
