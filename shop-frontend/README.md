# Mon E-commerce — Frontend

Frontend React 19 + Vite pour une boutique en ligne mono-administrateur, avec chat visiteur/admin intégré. Prêt à être connecté à un backend Django REST Framework.

## Démarrer le projet

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:5173`.

Pour tester l'espace administrateur (données simulées) :
- URL : `/admin/connexion`
- Email : `admin@boutique.cm`
- Mot de passe : `admin123`

## Build de production

```bash
npm run build
npm run preview
```

## Structure du projet

```
src/
  assets/         Ressources statiques
  components/     Composants réutilisables (Navbar, ProductCard, ChatWindow, etc.)
  layouts/        MainLayout (site visiteur) et AdminLayout (espace admin protégé)
  pages/          Une page par écran (Accueil, Détail produit, Dashboard, etc.)
  hooks/          useAuth, useChat, useChatWidget
  services/       Couche d'accès aux données (produits, catégories, auth, chat)
  styles/         Design tokens (variables.css) et styles globaux
  utils/          Fonctions utilitaires (formatage, icônes)
```

## Données actuelles : simulateur en mémoire

Le projet fonctionne aujourd'hui avec des données simulées (`src/services/mockData.js`) pour que chaque
page soit testable immédiatement, sans backend. Toute la logique de simulation est isolée dans
`src/services/*.js` : produits, catégories, authentification, conversations.

## Brancher le backend Django REST Framework

1. Dans `src/services/api.js`, passer `USE_MOCKS` à `false`.
2. Définir l'URL de l'API dans un fichier `.env` à la racine :
   ```
   VITE_API_URL=https://votre-api.exemple.com/api
   ```
3. Chaque fonction de `productService.js`, `categoryService.js`, `authService.js` et `chatService.js`
   contient déjà l'appel `apiRequest(...)` équivalent (endpoint et méthode HTTP), en commentaire au-dessus
   de la version mock. Il n'y a rien à modifier dans les composants ou les pages : ils consomment uniquement
   ces services.
4. Endpoints attendus côté Django (à adapter à vos vues DRF) :
   - `GET/POST /products/`, `GET/PUT/DELETE /products/:id/`
   - `GET/POST /categories/`, `PUT/DELETE /categories/:id/`
   - `POST /auth/login/` (retourne `{ token }`)
   - `GET /conversations/`, `GET /conversations/:id/`, `POST /conversations/:id/messages/`

L'authentification admin utilise un token stocké dans `localStorage` et envoyé dans l'en-tête
`Authorization: Token <token>` — à adapter si Django REST Framework utilise un autre schéma
(JWT, session, etc.).

## Notes

- Les images de produits utilisées dans les données de démonstration proviennent d'Unsplash ; à remplacer
  par les vraies images une fois le backend branché (le formulaire "Ajouter un produit" gère déjà l'upload
  de fichiers locaux).
- Le chat est entièrement fonctionnel côté interface (visiteur ↔ admin) mais fonctionne en mémoire ; pour
  du temps réel, prévoir des WebSockets (Django Channels) côté backend.
