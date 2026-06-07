# Quiz Interactif à Chronomètre

> Projet Examen Final — JavaScript natif  
> Groupe 3  · Développement Web

---

## 📋 Présentation

Application web de quiz interactif avec compte à rebours, feedback visuel immédiat et classement des parties. L'utilisateur saisit son pseudo, répond à 10 questions en 30 secondes chacune, et son score est enregistré dans un classement général.

---

##  Démo

🔗 **Lien déploiement :** `https://xlxyx001.github.io/Projet_js-Quiz/`  
📁 **Dépôt GitHub :** `https://github.com/Xlxyx001/Projet_js-Quiz.git`

---

## Structure du projet

```
Projet_js-quiz /
├── index.html    → Structure HTML (3 écrans)
├── style.css     → Styles et animations
├── script.js     → Logique du jeu (JavaScript natif)
└── README.md     → Documentation
```

---

##  Fonctionnalités

### Obligatoires (cahier des charges)

| # | Fonctionnalité | Statut |
|---|---|---|
| 1 | 10 questions avec 4 choix chacune | ✅ |
| 2 | Questions affichées une par une, clic sur un bouton | ✅ |
| 3 | Chronomètre de 30 secondes par question | ✅ |
| 4 | Feedback visuel vert (correct) / rouge (incorrect) | ✅ |
| 5 | Écran de résultats avec score et message d'appréciation | ✅ |
| 6 | Historique des parties trié du meilleur au moins bon | ✅ |
| 7 | Bouton "Rejouer" sans rechargement de page | ✅ |

### Contraintes techniques respectées

| Contrainte | Implémentation |
|---|---|
| `Math.random()` + `Math.floor()` | Algorithme Fisher-Yates (`melangerTableau()`) |
| `Date` pour l'horodatage | `new Date()` à la fin de chaque partie |
| `createElement` + `appendChild` | Génération dynamique des boutons de réponse |
| Délégation d'événements | Un seul `addEventListener` sur `#reponses-grid` |

### Fonctionnalités bonus

- **Écran d'accueil** avec saisie et validation du pseudo
- **Mélange des choix** à chaque partie (pas seulement l'ordre des questions)
- **Barre de progression** dans la sidebar
- **Arc SVG animé** pour le chronomètre (devient rouge sous 10 s)
- **Médailles** 🥇🥈🥉 dans le classement
- **Responsive** mobile (grille 1 colonne sous 768 px)
- **Protection XSS** sur les pseudos affichés

---

##  Technologies utilisées

- **HTML5** — Structure sémantique, 3 sections (accueil / jeu / résultats)
- **CSS3** — Variables CSS, Flexbox, Grid, animations keyframes
- **JavaScript ES6+** — `const`, `let`, arrow functions, destructuring, `"use strict"`
- **Google Fonts** — Syne (titres) + DM Sans (corps)
- Aucun framework JS · Aucune bibliothèque externe

---

##  Déroulement d'une partie

```
1. Écran d'accueil  →  Saisie du pseudo  →  Clic "Commencer"
        ↓
2. Écran de jeu     →  10 questions (30s chacune)
   - Clic sur une réponse  →  Feedback immédiat  →  Question suivante
   - Temps écoulé          →  Question comptée fausse  →  Question suivante
        ↓
3. Écran de résultats  →  Score / Mention / Stats
   - Clic "Rejouer"  →  Retour étape 2 (questions remélangées)
```

---



---



### `melangerChoix(question)` — Mélange les réponses
Mélange les 4 choix d'une question et recalcule l'index de la bonne réponse pour rester cohérent.

### `demarrerChrono()` — Compte à rebours
Lance un `setInterval` d'1 seconde. Si `tempsRestant` atteint 0 sans réponse, appelle `afficherFeedback("temps")` et passe à la question suivante.

### `obtenirAppreciation(bonnes)` — Message de fin
| Bonnes réponses | Mention | Emoji |
|---|---|---|
| 10 / 10 | Parfait ! | |
| 8 – 9 | Excellent ! |  |
| 6 – 7 | Bien joué ! |  |
| 4 – 5 | Passable |  |
| 2 – 3 | À revoir |  |
| 0 – 1 | Insuffisant |  |

---



---

## 👥 Équipe

| Membre | Rôle |
|---|---|
| [Bolou Manassé Yvan] | HTML + Structure |
| [Tchicaya André] | CSS + Design |
| [Gnabris Boris et Bolou Manassé] | JavaScript + Logique |

---



*Examen Final JavaScript — Formation Développement Web*
