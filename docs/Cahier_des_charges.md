# 🔥 Cahier des charges — MicroDéfis (V1.1)

> - **Version** : V1.1 (PWA) — consolidé Mars 2026
> - **Stack cible** : Vue.js + Supabase (Auth + DB)
> - **Objectif** : Défi quotidien + flamme + historique calendrier + classement social + partage + Premium
> - **Note** : Sur PWA iOS, les notifications push nécessitent l'ajout à l'écran d'accueil (support partiel selon iOS).

---

## 🟠 Décisions figées

- 🔥 **Streak Shield Premium** : protège la flamme 1 fois/mois si jour manqué (reset à 1 pour les gratuits)
- ✨ **Générer** : limité à **5 générations/jour** pour les Premium
- 🗑️ **Suppression de compte** : incluse en **V1** (RGPD + App Store Apple)
- 🌍 **Langues** : Français + Anglais (V1)
- 📅 **Fuseau horaire** : date locale du téléphone (YYYY-MM-DD) pour le streak — timestamps UTC en base

---

## Vision produit

MicroDéfis est une application (PWA) qui propose **un défi par jour**, permet de le valider, de faire grandir une **flamme (streak)**, de visualiser sa progression dans un **calendrier**, de se mesurer aux autres via un **classement social**, et de partager ses résultats.

---

## Infos projet

- **Nom** : MicroDéfis
- **Plateforme** : Mobile iOS + Android (PWA)
- **Langue** : FR + EN
- **Monétisation** : Abonnement Premium (Stripe)
- **Rôles** : Utilisateur / Administrateur

---

## 🎯 1) Contexte & Objectifs

### Problème
Les gens manquent de constance pour tenir des habitudes et se motiver au quotidien.

### Objectifs produit
- ✅ Proposer un défi **chaque jour** (tirage aléatoire par utilisateur)
- 🔥 Créer une boucle d'engagement (streak / flamme)
- 📚 Donner une preuve de progression (historique + stats)
- 📅 Progression lisible (calendrier + historique)
- 🏆 Stimuler la compétition via le classement social
- 📣 Partage simple (réseaux)
- 💎 Monétisation via Premium

### KPIs
- % d'utilisateurs qui valident un défi dans les 24h après inscription
- Rétention J+1 / J+7
- Streak moyen / meilleure flamme
- Taux de conversion Premium
- Taux d'abonnement push notifications

---

## 👥 2) Rôles

### 🙋 Utilisateur (PWA)
- S'inscrire / se connecter / réinitialiser mot de passe / supprimer son compte
- Voir et valider le défi du jour
- Consulter sa flamme, son historique, son calendrier
- Voir le classement global et hebdomadaire
- Partager ses résultats
- Paramétrer thème, langue, notifications
- Acheter Premium et utiliser la feature "Générer"

### 🧑‍💻 Administrateur (Back-office `/admin`)
- CRUD défis (titre, description, catégorie, difficulté, durée, actif/archivé)
- Dashboard KPI : inscrits, premium, actifs/inactifs, push, activité récente
- Feed d'activité temps réel

---

## 📦 3) Périmètre (scope)

### ✅ Inclus V1

- 🔐 Auth Supabase (email + mot de passe + reset + suppression compte)
- 👤 Profil utilisateur
- 🎯 Défi du jour (tirage aléatoire catalogue)
- ✅ Validation (1x/jour)
- 🔥 Flamme (streak) + Streak Shield Premium
- 📅 Historique + vue calendrier (✅/❌/⏳)
- 🏆 Classement social (Global + Ligue hebdo)
- 📣 Partage natif (Web Share API)
- 🔔 Push notifications v2 (anti-spam, FR/EN, 3 types)
- ⚙️ Paramètres : notifications, thème, langue
- 💎 Premium (Stripe) : checkout + webhook sécurisé + Streak Shield + Générer
- 🛠️ Dashboard admin (KPIs + CRUD défis)
- 📱 Navigation swipe entre écrans principaux

### 🔜 V1.1

- 📊 Stats avancées (graphiques, régularité, meilleurs mois)
- 🌓 Thèmes premium supplémentaires

---

## 🧭 4) Parcours principal (UX)

1. 🔐 Connexion / inscription
2. 🎯 Écran "Défi du jour"
3. 💪 Réaliser le défi (hors app)
4. ✅ Valider → animation de succès
5. 🔥 Flamme augmente (Streak Shield si Premium et oubli)
6. 📅 Calendrier / historique mis à jour
7. 🏆 Classement mis à jour (XP + bonus difficulté/rapidité/flamme)
8. 📣 Partage (optionnel)

---

## 🧱 5) Fonctionnalités

### 🔐 5.1 Authentification & compte

**Fonctions**
- Inscription / connexion / déconnexion (email + mot de passe, Supabase Auth)
- Reset mot de passe par email
- Suppression de compte : toutes les données liées supprimées (RGPD + App Store Apple)
- Session persistante multi-device

**Règles**
- Données persistées et récupérables sur tous les devices
- Suppression irréversible avec confirmation (double modal)

---

### 👤 5.2 Profil

**Champs**
- Pseudo (obligatoire), avatar (sélecteur), date d'inscription
- Résumé stats : flamme actuelle, meilleure flamme, total réussis
- Badge 👑 Premium si `is_premium = true`

**Actions**
- Modifier pseudo / avatar
- Accès paramètres
- Déconnexion

---

### 🎯 5.3 Défi du jour

**Affichage**
- Titre, description, catégorie, difficulté, durée
- Statut : "À faire" / "Fait ✅"

**Règles**
- Tirage aléatoire par utilisateur depuis le catalogue (`challenges` actifs)
- Un seul défi par jour — même défi affiché si l'app est rouverte le même jour
- Gestion du "jour" : date locale du téléphone (YYYY-MM-DD)

---

### ✅ 5.4 Validation du défi

**Fonctions**
- Bouton "Défi réalisé" → animation + feedback visuel
- Mise à jour `last_active` + déclenchement recalcul streak

**Règles**
- 1 validation max par jour
- Si déjà validé : bouton désactivé + statut "Validé ✅"

---

### 🔥 5.5 Flamme (streak)

**Fonctions**
- Streak +1 si validation aujourd'hui + validé hier
- Reset à 1 si jour manqué (utilisateur gratuit)
- **Streak Shield (Premium)** : protège la flamme 1 fois/mois si jour manqué
  - Shield réinitialisé au 1er du mois
  - Stocké dans `shield_used_at` (user_preferences)
- Message "Protège ta flamme avec Premium" affiché au user gratuit qui perd sa flamme

**Cas limites**
- Changement de fuseau / heure : V1 suit la date locale du téléphone

---

### 📚 5.6 Historique + Calendrier

- Vue mensuelle : ✅ validé / ❌ non validé / ⏳ aujourd'hui pas encore validé
- Navigation mois précédent / suivant
- Tap sur un jour → modal : titre + description + statut
- Si pas de `daily_draw` ce jour : "Aucun défi attribué ce jour"

---

### 🏆 5.7 Classement social *(ajouté en cours de projet)*

**Modes**
- `Global` : classement sur l'historique complet
- `Ligue hebdo` : scope semaine courante (Europe/Paris), reset hebdomadaire

**Affichage**
- Podium top 3 avec distinction visuelle
- Liste complète des classés
- Indicateur : "Encore X XP pour passer devant [pseudo]"

**Scoring XP non linéaire**
- Points de base par completion
- Bonus rapidité (heure de completion dans la journée)
- Bonus difficulté (niveau du défi)
- Bonus flamme globale
- Calculé via RPC Supabase : `get_leaderboard(p_limit, p_scope)`

**Migrations**
- `20260302223000_add_leaderboard_rpc.sql`
- `20260302231500_update_leaderboard_scope.sql`
- `20260302235959_update_leaderboard_scoring_final.sql`

---

### 📣 5.8 Partage réseaux

- Web Share API : "J'ai réussi le défi du jour ! Flamme : X 🔥 #MicroDéfis"
- Fallback : copie dans le presse-papier si API indisponible
- Accessible depuis l'écran résultat + optionnellement depuis le profil

---

### 🔔 5.9 Notifications push v2 *(évoluées en cours de projet)*

**Types**
- `daily_reminder` : rappel quotidien à l'heure choisie
- `streak_risk` : alerte si la flamme est en danger
- `23h_reminder` : dernier rappel si non validé en fin de journée

**Fonctionnement**
- Messages dynamiques FR/EN selon la langue de l'utilisateur
- Fenêtres horaires par timezone utilisateur
- pg_cron toutes les minutes → Edge Function `notifications`
- ⚠️ Décalage UTC / heure locale France (+1h hiver, +2h été)

**Anti-spam**
- Table `notification_sends` avec contrainte unique `(user_id, notif_type, day_local)`
- Fonction `reserve_notification_send(...)` en base
- Migration : `20260303001000_notifications_anti_spam_lock.sql`

**Gestion erreurs**
- Subscriptions expirées (erreur 410) supprimées automatiquement

**iOS PWA**
- Guide "Comment activer" depuis les paramètres (ajout à l'écran d'accueil requis)

---

### 🌓 5.10 Thème & UI

- Thème : Clair / Sombre / Système
- Navigation swipe entre écrans principaux (daily / calendar / leaderboard / profile / settings)
- Variables CSS globales (`--primary`, `--surface`, `--border`, `--text-primary`, `--text-secondary`)
- Contraste accessible en extérieur et en mode sombre
- Animation + feedback visuel après validation

---

### 🌍 5.11 Langue (i18n)

- V1 : Français + Anglais
- Choix dans Paramètres ou détection système
- Notifications push également traduites (FR/EN)

---

## 💎 6) Premium (abonnement)

### 6.1 Free (gratuit)
- Défi du jour + validation + flamme
- Historique + calendrier
- Classement (lecture)
- Partage basique

### 6.2 Premium — 3 plans

| Plan | Tarif |
|---|---|
| Hebdomadaire | 0,99 € / semaine |
| Mensuel ⭐ populaire | 2,99 € / mois — 0,10 €/jour |
| Annuel | 19,99 € / an — 1,67 €/mois |

- Essai gratuit **7 jours** sur tous les plans
- Annulation en 1 clic depuis les paramètres

### 6.3 Avantages Premium
- ✨ Générer des défis personnalisés (5/jour, par catégorie et difficulté)
- 🛡️ Streak Shield : protège la flamme 1 fois/mois
- 🏆 Badge exclusif 👑 dans le profil et le classement
- 🎨 Sans publicité
- 📊 Stats avancées (V1.1)

### 6.4 Feature "Générer" — 5/jour *(décision figée)*
- Bouton visible pour tous, verrouillé (paywall) si non Premium
- Sélecteur catégorie + difficulté avant génération
- Limite via `generation_log` (user_id, local_date, count)
- Compteur "X/5 restantes" affiché
- Défi généré enregistré dans `daily_draw` de l'utilisateur

### 6.5 Stripe — architecture technique *(renforcé en cours de projet)*
- Edge Function `create-checkout-session` : session avec `trial_period_days: 7`, `success_url`, `cancel_url`
- Edge Function `stripe-webhook` :
  - Vérification signature HMAC (STRIPE_WEBHOOK_SECRET)
  - `customer.subscription.created` → `is_premium = true`
  - `customer.subscription.updated` → synchronisation statut
  - `customer.subscription.deleted` → `is_premium = false`
  - Mise à jour `stripe_customer_id` en base

---

## 🛠️ 7) Back-office Admin *(ajouté en cours de projet)*

Route `/admin` protégée par navigation guard (`is_admin` dans `user_preferences`).

### 7.1 KPIs temps réel
- Nouveaux inscrits / Actifs / Inactifs / Premium / Abonnés push
- Delta vs période précédente (▲/▼)
- Répartition avec progress bars (Free actifs / Premium actifs / Inactifs)
- Bar chart inscriptions hebdomadaires (S-4 à S-1)
- Sélecteur période : 7j / 30j / 3m / 1an

### 7.2 Push Notifications monitoring
- Taux d'abonnement global
- Notifications envoyées / taux de succès / erreurs 410
- % Premium abonnés push

### 7.3 Feed d'activité
- Événements temps réel : NEW / PREM / PUSH / UNSUB avec badges colorés

### 7.4 CRUD défis
- Liste filtrable actif/inactif/archivé
- Formulaire création/édition : titre, description, catégorie, difficulté, durée
- Archiver plutôt que supprimer (conservation de l'historique)

---

## 🗂️ 8) Données & règles de stockage

### Entités

| Table | Contenu principal |
|---|---|
| `auth.users` | Géré par Supabase Auth |
| `user_preferences` | user_id, pseudo, avatar_url, is_premium, is_admin, last_active, shield_used_at, stripe_customer_id, theme, language, notif_enabled, notif_time |
| `challenges` | id, title, description, category, difficulty, duration, active, archived_at |
| `daily_draws` | id, user_id, draw_date (YYYY-MM-DD), challenge_id |
| `completions` | id, user_id, local_date (YYYY-MM-DD), challenge_id, created_at |
| `push_subscriptions` | id, user_id, subscription (JSON), reminder_time, updated_at |
| `notification_sends` | user_id, notif_type, day_local — verrou anti-spam |
| `generation_log` | user_id, local_date, count — limite 5/jour |

### Règles métier
- Une completion est unique par `(user_id, local_date)` — contrainte Supabase
- Timestamps stockés en UTC, notion "jour" calculée en date locale
- Archivage plutôt que suppression pour les défis
- RLS activée sur toutes les tables utilisateur

---

## 🔒 9) Exigences non-fonctionnelles

- **Performance** : chargement défi du jour < 1s
- **Sécurité** : RLS Supabase + `is_admin` guard + vérification signature Stripe (HMAC)
- **RGPD** : suppression compte complète, minimisation des données, permissions demandées uniquement si nécessaire
- **Fiabilité** : écritures robustes, pas de perte streak/historique
- **Push** : verrou anti-spam en base, nettoyage auto subscriptions 410
- **Observabilité** : logs Edge Functions + dashboard admin

---

## ✅ 10) Tests & critères d'acceptation (DoD)

- Connexion / inscription / reset / suppression compte OK
- Défi identique au rechargement le même jour
- Validation 1x/jour — impossible de valider deux fois
- Flamme mise à jour correctement après validation
- Streak Shield consommé 1 seule fois/mois pour un Premium
- Calendrier reflète correctement ✅/❌/⏳ + navigation mois
- Classement Global et Ligue hebdo affichés correctement
- Score XP mis à jour après chaque validation
- Partage Web Share API + fallback presse-papier OK
- Notifications reçues à l'heure configurée (±1 min), sans spam
- Tunnel Stripe OK — `is_premium` mis à jour via webhook
- Génération limitée à 5/jour pour les Premium
- Dashboard admin : accès refusé sans `is_admin = true`
- Build PWA installable sur iOS et Android

---

## 🚀 11) Livrables attendus

- App mobile PWA (iOS / Android) — Vue.js
- Back-office admin intégré dans l'app (`/admin`)
- Ce document — cahier des charges consolidé
- Backlog GitHub avec tickets par module
- Migrations Supabase versionnées
- Build de test : TestFlight (iOS) / Android internal testing

---

*MicroDéfis — Cahier des charges V1 consolidé — Mars 2026*