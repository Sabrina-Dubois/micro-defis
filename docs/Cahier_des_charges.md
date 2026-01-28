# Cahier des charges — Application mobile de défis quotidiens (V1)

## 1. Contexte et objectif
Application mobile permettant de réaliser un défi chaque jour, valider sa réussite, cumuler une flamme (streak), consulter son historique et partager sur les réseaux.

## 2. Périmètre
### 2.1 Inclus (V1)
- Compte utilisateur + profil
- Défi du jour + validation
- Flamme (streak) + historique
- Partage réseaux
- Paramètres : notifications, thème (clair/sombre/système), langue
- Premium : abonnement + feature “générer”
- Admin : gestion des défis (+ planification optionnelle)

### 2.2 Exclu (V2+)
- Fil social interne (likes/commentaires)
- Classements avancés
- Modération avancée
- Défis géolocalisés

## 3. Acteurs
### 3.1 Utilisateur (mobile)
- S’inscrire / se connecter
- Voir le défi du jour
- Valider “Défi réalisé”
- Voir flamme + stats simples
- Voir historique
- Partager
- Gérer notifications / thème / langue
- Souscrire à Premium

### 3.2 Administrateur (back-office)
- CRUD défis (créer/éditer/archiver)
- Catégories/difficultés
- Planifier le défi du jour (si mode “défi global”)
- Stats basiques (option)

## 4. Parcours principal
1. Ouvrir l’app
2. Se connecter / s’inscrire (ou invité si activé)
3. Voir le défi du jour
4. Réaliser le défi (hors app)
5. Valider le défi
6. Flamme + historique se mettent à jour, partage possible

## 5. Fonctionnalités (détails)
### 5.1 Authentification & compte
- Inscription, connexion, déconnexion
- Reset mot de passe
- Suppression de compte (V1 ou V1.1)

### 5.2 Profil
- Pseudo, avatar
- Flamme actuelle, meilleure flamme
- Total défis réussis (option)

### 5.3 Défi du jour
- Titre + description (+ catégorie/difficulté/durée option)
- Un seul défi par jour

**Décision** :
- Mode A : défi identique pour tous (planifié)
- Mode B : défi aléatoire par utilisateur (catalogue)

### 5.4 Validation
- Bouton “Défi réalisé”
- Interdire double validation le même jour

### 5.5 Flamme (streak)
- Affichage + animation
- Règle à figer : reset si jour manqué ? joker ?

### 5.6 Historique
- Liste par date (fait / non fait)
- Stats optionnelles

### 5.7 Partage
- Partage natif (texte)
- Option V2 : carte image

### 5.8 Notifications
- Activer/désactiver
- Choisir heure
- Option : rappel seulement si non validé

### 5.9 Thème
- Clair / Sombre / Système

### 5.10 Langue
- FR (V1)
- EN (option)

## 6. Premium (abonnement) + “Générer”
### 6.1 Offre
- Abonnement mensuel et/ou annuel
- Paywall + bouton “Restaurer les achats”

### 6.2 Accès
- Free : accès standard, “Générer” verrouillé
- Premium : “Générer” activé (+ limite/jour à définir)

### 6.3 Définition de “Générer” (à figer)
- Générer des défis personnalisés OU
- Générer une carte de partage OU
- Générer une semaine de défis

## 7. Back-office Admin
- Gestion défis
- Planification (si défi global)
- Stats (option)

## 8. Modèle de données (simplifié)
- User
- Challenge
- Completion
- (Option) DailyChallenge
- Settings
- GenerationLog

## 9. Critères de réussite (V1)
- Défi du jour → validation → flamme augmente → historique OK → partage OK
- Paramètres (notif/thème/langue) OK
- Premium : abonnement actif → accès “Générer”
- Admin : gestion défis OK
