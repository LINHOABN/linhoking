# Documentation de l'API REST de la Boutique en Ligne

Cette API sert de backend pour la boutique en ligne. Elle est accessible sous le préfixe `/api/`.

## Sommaire
- [Authentification](#authentification)
- [Catégories](#catégories)
- [Produits](#produits)
- [Images Produit](#images-produit)
- [Chat en Ligne](#chat-en-ligne)

---

## Authentification

### 1. Se Connecter (Login)
* **Description** : Permet à l'administrateur d'obtenir un token d'accès JWT et un token de rafraîchissement.
* **Méthode / URL** : `POST /api/login/`
* **Accès** : Public (Visiteur / Admin)
* **Format de Requête (JSON)** :
  ```json
  {
    "username": "admin",
    "password": "un_mot_de_passe_securise"
  }
  ```
* **Format de Réponse (200 OK)** :
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Codes HTTP** :
  * `200 OK` : Authentification réussie.
  * `401 Unauthorized` : Identifiants invalides.

### 2. Se Déconnecter (Logout)
* **Description** : Invalide le token de rafraîchissement (blacklist du côté serveur pour la sécurité).
* **Méthode / URL** : `POST /api/logout/`
* **Accès** : Réservé aux utilisateurs connectés (Admin) - Nécessite le header `Authorization: Bearer <access_token>`
* **Format de Requête (JSON)** :
  ```json
  {
    "refresh": "token_de_rafraichissement_a_blacklister"
  }
  ```
* **Format de Réponse (200 OK)** :
  ```json
  {
    "detail": "Déconnexion réussie."
  }
  ```
* **Codes HTTP** :
  * `200 OK` : Déconnexion réussie.
  * `401 Unauthorized` : Bearer Token manquant ou invalide.

### 3. Rafraîchir le Token d'Accès
* **Description** : Permet d'obtenir un nouveau token d'accès après expiration du précédent.
* **Méthode / URL** : `POST /api/token/refresh/`
* **Accès** : Public
* **Format de Requête (JSON)** :
  ```json
  {
    "refresh": "token_de_rafraichissement_valide"
  }
  ```
* **Format de Réponse (200 OK)** :
  ```json
  {
    "access": "nouveau_token_access"
  }
  ```
* **Codes HTTP** :
  * `200 OK` : Token rafraîchi avec succès.
  * `401 Unauthorized` : Token de rafraîchissement invalide ou expiré.

---

## Catégories

Les visiteurs peuvent uniquement lister et voir les détails des catégories (GET). Les créations, modifications et suppressions sont limitées à l'administrateur.

### 1. Lister les Catégories
* **Description** : Récupère la liste paginée de toutes les catégories.
* **Méthode / URL** : `GET /api/categories/`
* **Accès** : Public
* **Format de Réponse (200 OK)** :
  ```json
  {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "nom": "Vêtements",
        "slug": "vetements",
        "date_creation": "2026-07-28T23:26:00Z"
      }
    ]
  }
  ```
* **Codes HTTP** :
  * `200 OK` : Succès.

### 2. Détail d'une Catégorie
* **Description** : Récupère les détails d'une catégorie spécifique en utilisant son `slug`.
* **Méthode / URL** : `GET /api/categories/<slug>/`
* **Accès** : Public
* **Format de Réponse (200 OK)** :
  ```json
  {
    "id": 1,
    "nom": "Vêtements",
    "slug": "vetements",
    "date_creation": "2026-07-28T23:26:00Z"
  }
  ```
* **Codes HTTP** :
  * `200 OK` : Succès.
  * `404 Not Found` : Catégorie inexistante.

### 3. Créer une Catégorie
* **Description** : Permet à l'admin d'ajouter une nouvelle catégorie. Le slug est généré automatiquement s'il n'est pas fourni.
* **Méthode / URL** : `POST /api/categories/`
* **Accès** : Admin connecté (Authorization: Bearer <access_token>)
* **Format de Requête (JSON)** :
  ```json
  {
    "nom": "Électronique"
  }
  ```
* **Format de Réponse (201 Created)** :
  ```json
  {
    "id": 2,
    "nom": "Électronique",
    "slug": "electronique",
    "date_creation": "2026-07-28T23:27:00Z"
  }
  ```
* **Codes HTTP** :
  * `201 Created` : Création réussie.
  * `400 Bad Request` : Nom de catégorie vide, ou catégorie déjà existante.
  * `401 Unauthorized` : Token manquant ou invalide.

### 4. Modifier / Supprimer une Catégorie
* **Méthodes / URL** :
  * `PUT /api/categories/<slug>/` (Remplacement complet)
  * `PATCH /api/categories/<slug>/` (Mise à jour partielle)
  * `DELETE /api/categories/<slug>/` (Suppression)
* **Accès** : Admin connecté (Authorization: Bearer <access_token>)
* **Codes HTTP** :
  * `200 OK` : Modification réussie.
  * `204 No Content` : Suppression réussie.
  * `400 Bad Request` : Erreur de validation.
  * `401 Unauthorized` : Non authentifié.
  * `404 Not Found` : Catégorie introuvable.

---

## Produits

### 1. Lister les Produits
* **Description** : Récupère la liste paginée de tous les produits publiés. Si le client est connecté avec un compte Administrateur, elle retourne également les produits non publiés (brouillons).
* **Méthode / URL** : `GET /api/products/`
* **Filtres optionnels** :
  * Filtrer par catégorie via le slug : `/api/products/?categorie__slug=vetements`
  * Recherche textuelle (recherche sur le nom et la description) : `/api/products/?search=veste`
  * Tri : `ordering=prix` ou `ordering=-prix` or `ordering=-date_creation`
* **Accès** : Public
* **Format de Réponse (200 OK)** :
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "nom": "T-shirt Vintage",
        "slug": "t-shirt-vintage",
        "description": "Super t-shirt vintage",
        "prix": "29.99",
        "image_principale": "http://localhost:8000/media/products/t_shirt.jpg",
        "categorie": {
          "id": 1,
          "nom": "Vêtements",
          "slug": "vetements",
          "date_creation": "2026-07-28T23:26:00Z"
        },
        "images": [
          {
            "id": 1,
            "produit": 1,
            "image": "http://localhost:8000/media/products/t_shirt_detail.jpg"
          }
        ],
        "date_creation": "2026-07-28T23:27:00Z",
        "date_modification": "2026-07-28T23:27:00Z",
        "est_publie": true
      }
    ]
  }
  ```
* **Codes HTTP** : `200 OK`.

### 2. Créer un Produit
* **Description** : Permet à l'administrateur d'ajouter un produit. Le corps doit être envoyé au format `multipart/form-data` pour l'upload d'images.
* **Méthode / URL** : `POST /api/products/`
* **Accès** : Admin connecté (Authorization: Bearer <access_token>)
* **Champs de la Requête** :
  * `nom` (Chaîne de caractères, obligatoire et non vide)
  * `description` (Chaîne, optionnelle)
  * `prix` (Nombre décimal >= 0)
  * `categorie_id` (ID numérique de la catégorie existante, obligatoire)
  * `image_principale` (Fichier d'image valide, obligatoire)
  * `est_publie` (Booléen, True par défaut, optionnel)
* **Codes HTTP** :
  * `201 Created` : Création réussie.
  * `400 Bad Request` : Prix négatif, nom vide, catégorie inexistante ou format d'image invalide.
  * `401 Unauthorized` : Permissions insuffisantes.

### 3. Modifier / Supprimer un Produit
* **Méthodes / URL** :
  * `PUT /api/products/<slug>/`
  * `PATCH /api/products/<slug>/`
  * `DELETE /api/products/<slug>/`
* **Accès** : Admin connecté (Authorization: Bearer <access_token>)
* **Codes HTTP** :
  * `200 OK` / `204 No Content` / `400 Bad Request` / `401 Unauthorized` / `404 Not Found`.

---

## Images Produit

Permet d'associer plusieurs images secondaires à un produit.

### 1. Ajouter une Image à un Produit
* **Description** : Associe une nouvelle image à un produit existant.
* **Méthode / URL** : `POST /api/products/images/`
* **Accès** : Admin connecté
* **Format de Requête** (`multipart/form-data`) :
  * `produit` : ID numérique du produit
  * `image` : Le fichier d'image valide
* **Format de Réponse (201 Created)** :
  ```json
  {
    "id": 2,
    "produit": 1,
    "image": "http://localhost:8000/media/products/img_secondaire.jpg"
  }
  ```

### 2. Supprimer une Image Secondaire
* **Description** : Supprime une image secondaire existante à partir de son ID.
* **Méthode / URL** : `DELETE /api/products/images/<id>/`
* **Accès** : Admin connecté
* **Codes HTTP** :
  * `204 No Content` : Suppression réussie.
  * `401 Unauthorized` : Non autorisé.
  * `404 Not Found` : Image inexistante.

---

## Chat en Ligne

Permet aux visiteurs de discuter sans inscription préalable, et à l'administrateur de centraliser et répondre à toutes les conversations.

### 1. Démarrer une Conversation (Visiteur)
* **Description** : Permet à un visiteur d'initialiser son flux de chat en spécifiant son nom.
* **Méthode / URL** : `POST /api/chat/conversations/`
* **Accès** : Public (Visiteur)
* **Format de Requête (JSON)** :
  ```json
  {
    "nom_visiteur": "Alice Smith",
    "email": "alice@example.com"
  }
  ```
* **Format de Réponse (201 Created)** :
  ```json
  {
    "id": 3,
    "nom_visiteur": "Alice Smith",
    "email": "alice@example.com",
    "date_creation": "2026-07-28T23:30:00Z",
    "messages": []
  }
  ```

### 2. Lister les Conversations (Admin)
* **Description** : Permet à l'administrateur de voir toutes les sessions de discussions actives de la boutique.
* **Méthode / URL** : `GET /api/chat/conversations/`
* **Accès** : Admin connecté
* **Response Code** : `200 OK`.

### 3. Envoyer un Message
* **Description** : Envoie un message dans une conversation spécifique. Si l'expéditeur de la requête est un administrateur connecté (staff), le destinataire verra le message comme venant de `"ADMIN"`. Sinon, il sera enregistré en tant que `"VISITEUR"`.
* **Méthode / URL** : `POST /api/chat/messages/`
* **Accès** : Public
* **Format de Requête (JSON)** :
  ```json
  {
    "conversation": 3,
    "message": "Bonjour, le service client est top !"
  }
  ```
* **Format de Réponse (201 Created)** :
  ```json
  {
    "id": 14,
    "conversation": 3,
    "expediteur": "VISITEUR",
    "message": "Bonjour, le service client est top !",
    "date_envoi": "2026-07-28T23:31:00Z",
    "lu": false
  }
  ```

### 4. Lister les Messages d'une Conversation
* **Description** : Liste tous les messages d'un fil de discussion donné. Lorsque l'administrateur consulte cet endpoint, tous les messages du visiteur sont automatiquement marqués comme lus (`lu = true`).
* **Méthode / URL** : `GET /api/chat/messages/?conversation=<conversation_id>`
* **Accès** : Admin connecté
* **Format de Réponse (200 OK)** :
  ```json
  {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 14,
        "conversation": 3,
        "expediteur": "VISITEUR",
        "message": "Bonjour, le service client est top !",
        "date_envoi": "2026-07-28T23:31:00Z",
        "lu": true
      }
    ]
  }
  ```

### 5. Supprimer une Conversation (Admin)
* **Description** : Met fin et supprime définitivement l'historique d'une conversation.
* **Méthode / URL** : `DELETE /api/chat/conversations/<id>/`
* **Accès** : Admin connecté
* **Codes HTTP** :
  * `204 No Content` : Supprimé avec succès.
  * `401 Unauthorized` : Accès refusé.
  * `404 Not Found` : Conversation introuvable.
