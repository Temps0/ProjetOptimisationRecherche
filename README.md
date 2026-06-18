# Projet Optimisation Recherche

Un petit projet comprenant une interface frontend sous Vue.js et un serveur backend Node.js.

## Structure

- `Projet_optimisationRecherche/` : L'application front-end (Vue.js / Vite).
- `server/` : Le backend (Node.js) et la base de données SQLite.
- `run.bat` : Un script pratique pour lancer simultanément le back et le front sous Windows.

## Comment lancer le projet

Le plus simple pour démarrer le projet en local est d'exécuter le script `run.bat` situé à la racine :

```cmd
run.bat
```

Ce script va automatiquement ouvrir deux fenêtres :
1. Une pour le serveur backend (qui lance `node index.js`).
2. Une pour le serveur de développement frontend (qui lance `npm run dev`).
