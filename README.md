# 🗳️ Badge Generator - UP Le Renouveau

Application web mobile-first pour générer des badges personnalisés de campagne pour le parti **UP – Le Renouveau** dans le cadre des élections législatives et communales.

## ✨ Fonctionnalités

- 📝 Saisie du nom et prénom
- 📸 Upload de photo (avec support drag & drop)
- 🎨 Génération automatique de badge personnalisé
- 📱 Design mobile-first responsive
- ⬇️ Téléchargement du badge en PNG
- 📲 Partage direct sur WhatsApp
- 📘 Partage sur Facebook
- 🚀 Sans inscription, rapide et simple

## 🖼️ Aperçu du Badge

Le badge généré inclut :
- Logo du parti UP – Le Renouveau
- Photo de l'utilisateur
- Texte : « Moi [Prénom NOM], je maintiens le CAP »
- Couleurs officielles du parti
- Mention des élections 2025

## 🛠️ Technologies

- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript (ES6+)
- [html2canvas](https://html2canvas.hertzen.com/) - Génération d'images

## 📂 Structure du Projet

```
├── index.html          # Page principale
├── css/
│   └── style.css       # Styles (mobile-first)
├── js/
│   └── app.js          # Logique JavaScript
├── assets/
│   └── logo.png        # Logo du parti (à ajouter)
├── README.md           # Documentation
└── .github/
    └── copilot-instructions.md
```

## 🚀 Installation et Utilisation

### Méthode 1 : Ouverture directe
Ouvrez simplement `index.html` dans un navigateur web moderne.

### Méthode 2 : Serveur local (recommandé)
1. Installez l'extension **Live Server** dans VS Code
2. Clic droit sur `index.html` → "Open with Live Server"
3. Le site s'ouvre automatiquement dans votre navigateur

### Méthode 3 : Serveur Python
```bash
python -m http.server 8000
```
Puis ouvrez http://localhost:8000

## 🌐 Déploiement sur GitHub Pages

1. Créez un nouveau repository sur GitHub.
2. Poussez votre code :
```bash
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/NOM_DU_REPO.git
git branch -M main
git push -u origin main
```
3. Allez dans **Settings** > **Pages**.
4. Sous **Source**, sélectionnez `main` branch.
5. Votre site sera disponible à l'adresse : `https://VOTRE_NOM_UTILISATEUR.github.io/NOM_DU_REPO/`

## ⚙️ Configuration

### Logo du Parti
Placez le logo officiel du parti dans le dossier `assets/` sous le nom `logo.png`.

### Couleurs
Les couleurs du parti peuvent être personnalisées dans `css/style.css` :

```css
:root {
    --primary-color: #1a5f2a;      /* Vert principal */
    --primary-dark: #0d4a1a;
    --primary-light: #2d8a3e;
    --secondary-color: #ffc107;    /* Jaune/Or */
    --accent-color: #dc3545;       /* Rouge accent */
}
```

## 📱 Compatibilité

- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (iOS & macOS)
- ✅ Edge
- ✅ Samsung Internet

## 🔒 Confidentialité

- Aucune donnée n'est envoyée vers un serveur
- Tout le traitement est fait localement dans le navigateur
- Les photos ne sont pas stockées

## 📄 Licence

© 2025 UP – Le Renouveau. Tous droits réservés.

---

**🇧🇯 Pour le Bénin, maintenons le CAP !**
