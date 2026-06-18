# Projet Optimisation Recherche

Ce projet est une application web permettant d'optimiser et d'automatiser des recherches de données. Il est composé d'une interface utilisateur moderne et d'une API backend robuste.

## 🚀 Technologies utilisées

Le projet est divisé en deux parties principales :

### 💻 Frontend (Dossier `Projet_optimisationRecherche/`)
L'interface utilisateur est construite avec les technologies modernes du web :
- **Vue.js 3** (Composition API) pour l'interface interactive.
- **Vue Router** pour la navigation entre les pages.
- **Vite** comme outil de build ultra-rapide.
- **TypeScript** pour un typage statique et un code plus sûr.
- **Leaflet** pour l'affichage et la gestion de cartes interactives.
- **XLSX** pour la lecture et la manipulation de fichiers Excel.

### ⚙️ Backend (Dossier `server/`)
L'API qui gère la logique métier, l'authentification et les données :
- **Node.js** avec **Express.js** pour la création de l'API REST.
- **SQLite3** pour la base de données relationnelle légère et intégrée.
- **JSON Web Token (JWT)** & **Bcrypt** pour l'authentification sécurisée et le hachage des mots de passe.
- **Puppeteer** pour le web scraping et l'automatisation de navigation.

---

## 🛠️ Comment lancer le projet en local

Un script automatisé est fourni pour démarrer facilement les deux environnements sous Windows.

1. Installez les dépendances :
   Assurez-vous d'avoir exécuté `npm install` dans les deux dossiers (`Projet_optimisationRecherche/` et `server/`).

2. Démarrez les serveurs :
   Exécutez simplement le script `run.bat` situé à la racine du projet :
   ```cmd
   run.bat
   ```

Ce script va automatiquement ouvrir deux fenêtres de commande :
- L'une pour lancer le serveur backend (`node index.js`).
- L'autre pour lancer le serveur frontend de développement (`npm run dev`).
