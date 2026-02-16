#Micro Défis 🚀

Micro Défis est une application web de défis quotidiens basée sur Vue 3, Vite, et Pinia.
Elle permet aux utilisateurs de compléter des challenges, suivre leur progression (🔥 flammes, ✅ complétions, 🏆 badges) et gérer leur profil.

🔹 Fonctionnalités principales
	•	Défis quotidiens avec suivi de progression
	•	Statistiques et streaks (flammes 🔥, niveau, XP)
	•	Calendrier des complétions
	•	Gestion de profil et badges
	•	Paramètres : langue, thème, notifications
	•	PWA installable sur mobile et desktop

🔹 Stack technique
	•	Frontend : Vue 3 + Vite + Pinia
	•	Backend / BDD : Supabase (auth, user_profiles, challenges, daily_assignments, daily_completions)
	•	UI : Vuetify 3
	•	PWA : bouton d’installation et offline support

🔹 Setup du projet

```sh
# Installer les dépendances
npm install
# Lancer le serveur de dev avec hot reload
npm run dev

# Compiler pour la production
npm run build
```

### 🔹 Structure des stores (Pinia)

 | Store | Contenu / usage| Actions principales|

| --------- | --------- | --------- | 
| userStore| Infos utilisateur, login, username | loadUser(), updateProfile(), changeAvatar() |

| statsStore | Stats : streaks, total complétés, XP, niveau |
| challengeStore | Liste des challenges et détail des défis |
| dailyStore | Stats : streaks, total complétés, XP, niveau |


### Compile and Minify for Production

```sh
# Compiler pour la production
npm run build
```

## 🔹 Structure des stores (Pinia)

| Store | Contenu / usage| Actions principales |
| --------- | --------- | --------- | 
| `userStore`| Infos utilisateur, login, username | `loadUser()`, `updateProfile()`, `changeAvatar()`|
| `statsStore` | Stats : streaks, total complétés, XP, niveau | `loadCompletions()`, `calculateStreaks()`, `addCompletion()` | 
| `challengeStore` | Liste des challenges et détail des défis | `loadTodayChallenge()`, `markAsCompleted()` |
| `dailyStore` | Stats : streaks, total complétés, XP, niveau | `loadPreferences()`, `updatePreference()`, `setLanguage()`,` setTheme()` |


## 🔹 Composants clés

 | Composant | Stores utilisés| Objectif |
| --------- | --------- | --------- | 
| `DailyChallenge.vue`| `userStore`, `statsStore`, `challengeStore`| Afficher le défi du jour, gérer le bouton “À faire”, montrer les flammes 🔥|
| `Calendar.vue`| `dailyStore, statsStore`| Afficher calendrier de complétions et stats journalières | 
| `Profile.vue`|`userStore`, `statsStore` | Afficher profil utilisateur, badges, niveau, stats |
| `Settings.vue`| Tous les stores | Gérer préférences : langue, thème, notifications, rappel|


## 🔹 Guide rapide d’utilisation
1. Créer un compte ou se connecter via Supabase auth
2. Compléter les défis quotidiens
3. Suivre les streaks et XP dans le profil
4. Vérifier les badges et le calendrier
5. Installer la PWA pour usage mobile

## 🔹 Notes de développement
	•	Assurez-vous que Pinia est bien installé et configuré dans main.js :
```sh
import { createPinia } from 'pinia';
const pinia = createPinia();
app.use(pinia);
```

	•	Supabase doit être configuré avec les bonnes clés dans .env
	•	Tous les composants suivent le pattern : load → display → action
