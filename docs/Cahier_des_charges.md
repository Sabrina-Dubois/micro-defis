# 🔥 Cahier des charges — MicroDéfis (V1) — PWA Vue.js + Supabase

> **Version** : V1 (PWA)  
> **Stack cible** : Vue.js + Supabase (Auth + DB)  
> **Objectif** : Défi quotidien + flamme + historique calendrier + partage + Premium (abonnement)  
> **Note** : Sur PWA iOS, les notifications push ont des limites (notamment besoin d’ajout à l’écran d’accueil, et support partiel selon iOS).

---

## Vision produit
MicroDéfis est une application (PWA dans un premier temps) qui propose **un défi par jour**, permet de le valider, de faire grandir une **flamme (streak)**, de visualiser sa progression dans un **calendrier**, et de partager ses résultats.

---
## Infos projet
- **Nom (provisoire)** : MicroDéfis
- **Plateforme** : Mobile iOS + Android
- **Langue** : FR (V1), EN option
- **Monétisation** : Abonnement Premium
- **Rôles** : Utilisateur / Administrateur

---

## 🎯 1) Contexte & objectifs
### Problème
Les gens manquent de constance pour tenir des habitudes et se motiver au quotidien.

## 🎯 1) Objectifs & KPIs

  
### Objectifs produit
- ✅ Proposer un défi **chaque jour**
- 🔥 Créer une boucle d’engagement (streak/flamme)
- 📚 Donner une preuve de progression (historique + stats)
- 📅 Progression lisible (calendrier + historique)
- 📣 Partage simple (réseaux)
- 💎 Monétisation via Premium

### KPIs (indicatifs)
- % d’utilisateurs qui valident un défi dans les 24h après inscription
- Rétention J+1 / J+7
- Streak moyen / meilleure flamme
- Conversion Premium
---

## 👥 2) Rôles
### 🙋 Utilisateur (PWA)
- S’inscrire / se connecter
- Voir le défi du jour
- Valider “défi réalisé”
- Voir flamme, historique, calendrier
- Partager
- Paramètres (thème, langue, notifications)
- Acheter Premium et utiliser “Générer”

### 🧑‍💻 Administrateur (Back-office)
- CRUD défis
- (Option V1.1) planification défi global du jour
- Stats simples

## 📦 3) Périmètre (scope)
### ✅ Inclus V1
- 🔐 Auth Supabase (email + mot de passe) 
- 👤 Profil utilisateur
- 🎯 Défi du jour
- ✅ Validation
- 🔥 Flamme (streak)
- 📅 Historique **+ vue calendrier**
- 📣 Partage natif (Web Share API si dispo)
- ⚙️ Paramètres : 🔔 notifications, 🌓 thème, 🌍 langue
- 💎 Premium (abonnement) : paywall + statut premium + feature “Générer”
- 🛠️ Admin : gestion des défis (minimum)


## 🧭 4) Parcours principal (UX)
1. 🔐 Connexion / inscription
2. 🎯 Écran “Défi du jour”
3. 💪 Réaliser le défi (hors app)
4. ✅ Valider
5. 🔥 Flamme augmente
6. 📅 Calendrier/historique mis à jour
7. 📣 Partage (optionnel)

---

## 🧱 5) Fonctionnalités (spécifications fonctionnelles)

### 🔐 5.1 Authentification & compte
**Fonctions**
- Inscription / connexion / déconnexion
- Reset mot de passe
- Suppression de compte (V1 ou V1.1)

**Règles**
- Les données doivent être persistées et récupérables (multi-device) si compte.

---

### 👤 5.2 Profil
**Champs**
- Pseudo (obligatoire)
- Avatar (option)
- Date d’inscription (option)
- Résumé stats : flamme actuelle, meilleure flamme, total réussis

**Actions**
- Modifier pseudo/avatar
- Accès paramètres
- Déconnexion

---

### 🎯 5.3 Défi du jour
**Affichage**
- Titre, description
- (Option) catégorie, difficulté, durée
- Statut : “À faire” / “Fait”

**Décision clé**
- Défi aléatoire par utilisateur (catalogue)

**Règles**
- Un seul défi par jour.
- Gestion du “jour” :
  - [ ] Fuseau du téléphone (simple)

---

### ✅ 5.4 Validation du défi
**Fonctions**
- Bouton “Défi réalisé”
- Animation + feedback

**Règles**
- 1 validation max par jour.
- Si déjà validé : bouton désactivé + statut “Validé ✅”.

---

### 🔥 5.5 Flamme (streak)
**Fonctions**
- Si l’utilisateur valide aujourd’hui et avait validé hier → streak +1
- Si l’utilisateur n’a pas validé la veille → streak repart à 1

**Règles à figer**
- [ ] Reset à 0 si jour manqué
- [ ] Joker (ex: 1/mois)

**Cas limites**
- Changement de fuseau / changement d’heure : comportement à documenter (V1 : on suit le téléphone).

---


### 📚 5.6 Historique + Calendrier (important)
- Vue calendrier : chaque jour affiche un état (✅ fait / ❌ pas fait / ⏳ aujourd’hui pas encore validé)
- Tap sur un jour : détail du défi + statut
- Option : filtre “uniquement jours validés”
---

### 📣 5.7 Partage réseaux
**V1**
- Partage via système natif (texte) : “J’ai réussi le défi du jour + flamme X 🔥”
- Partage depuis l’écran résultat + depuis Profil (option)

---

### 🔔 5.8 Notifications (rappel)
- Paramètres : activer/désactiver + choisir heure
- Sur iOS PWA, push = support partiel et nécessite souvent l’ajout à l’écran d’accueil; prévoir un écran “Comment activer”. [web:183][web:180]

Alternative simple V1 :
- “Rappel” via email (si tu veux), ou juste un rappel in-app (quand l’utilisateur ouvre).
  
---

### 🌓 5.9 Thème & UI
- Thème : Clair / Sombre / Système
- Contraste accessible (lisible en extérieur + en mode sombre)
- Styles cohérents : boutons, cartes, typos, marges

**Feedback**
- Animation + message de réussite

---

**Fuseau horaire : choix “simple” pour V1**
- On considère la journée selon la **date locale du téléphone** (format `YYYY-MM-DD`) et on enregistre cette date comme “jour validé”.  
- On stocke les timestamps côté DB en UTC, mais la notion “jour” de streak/historique se base sur la date locale affichée. (Simple à implémenter et compréhensible.)  


---

### 🌍 5.10 Langue (i18n)
- V1 : Français
- Option : Anglais
- Choix dans Paramètres (ou suivre le système)

---
## 💎 6) Premium (abonnement) 

### 6.1 Free (gratuit)
- Défi du jour
- Validation + flamme
- Historique + calendrier
- Partage basique

### 6.2 Premium (abonnement)
Choisir 2–4 bénéfices max (clairs) :
- ✨ “Générer des défis personnalisés” (ex: par catégorie/difficulté/durée)
- 📊 Stats avancées (ex: graphiques, régularité, meilleurs mois)
- 🌓 Thèmes premium (si tu veux)
- ⛔️ (Option) retirer toute pub si tu en mets

### 6.3 Feature Premium “Générer” (recommandation V1)
👉 Le plus cohérent pour ton concept : **générer des défis personnalisés**, car ça ajoute de la valeur au quotidien.

Décisions :
- [ ] Génération illimitée
- [ ] Limite/jour : ___ (ex: 5/jour)

Règles :
- Non premium : bouton visible mais verrouillé → paywall
- Premium : bouton actif → génère un défi et l’enregistre dans l’historique “défis générés” (option)

### 6.4 Limites & anti-abus
- [ ] Illimité
- [ ] Limite/jour : ___ (ex: 5/jour)
- Stocker un `GenerationLog` pour compter par jour.

---

## 🛠️ 7) Back-office Admin (web)
### Gestion des défis (CRUD)
- Champs : titre, description, catégorie, difficulté, durée, actif/inactif
- Archiver plutôt que supprimer (recommandé) pour conserver l’historique

### Planification
- Écran calendrier : date → défi
- Contrainte : 1 défi par date

### 7.3 Stats (option)
- créations de compte, validations/jour, premium actifs


## 🗂️ 8) Données & règles de stockage
### Entités (simplifié)
- `users` (géré via Supabase Auth) [web:175]
- `profiles` : user_id, pseudo, avatar_url, created_at
- `challenges` : id, title, description, category, difficulty, active
- `daily_challenge` (option mode global) : date, challenge_id
- `completions` : id, user_id, local_date (YYYY-MM-DD), challenge_id, created_at
- `settings` : user_id, theme, language, notif_enabled, notif_time
- `premium` : user_id, premium_active, premium_until (selon modèle)
- `generation_log` : user_id, local_date, count`

### 8.2 Règles
- Une completion est unique par (user_id, date).
- Calcul de streak : à partir des completions (ou stockage d’un champ + recalcul périodique).

---

## 🔒 9) Exigences non-fonctionnelles (qualité)
Un cahier des charges mobile doit inclure les contraintes de **sécurité, performance, RGPD, stabilité**, 

- Performance : chargement rapide des écrans principaux.
- Sécurité : séparation stricte Admin/User, règles d’accès aux données.
- RGPD : suppression compte, minimisation des données collectées, permissions demandées seulement si nécessaire. 
- Fiabilité : pas de perte de streak/historique (écritures robustes).
- Observabilité : logs d’erreurs (Crash/analytics).

  ---

## ✅ 🧪 10) Tests & critères d’acceptation (DoD)
- Connexion OK
- Défi du jour visible
- Validation 1x/jour OK
- Flamme mise à jour correctement
- Calendrier reflète l’état des jours
- Partage OK
- Premium : paywall + accès “Générer” OK
---

## 🚀 11) Livrables attendus
- App mobile (iOS/Android)
- Back-office admin (si V1)
- Documentation (ce fichier) + backlog GitHub
- Build de test (TestFlight / Android internal testing)

---

