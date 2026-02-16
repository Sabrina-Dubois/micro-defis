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
npm run build
```


