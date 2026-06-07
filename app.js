/* ══════════════════════════════════════════════════════
   QUIZ INTERACTIF À CHRONOMÈTRE — script.js
   Projet Examen Final — JavaScript natif
══════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────
   1. BANQUE DE QUESTIONS
   Chaque objet : { question, choix[4], reponseCorrecte (index 0-3) }
───────────────────────────────────────── */
const QUESTIONS_BANQUE = [
  {
    question: "Quelle balise HTML est utilisée pour créer un lien hypertexte ?",
    choix: ["<link>", "<a>", "<href>", "<url>"],
    reponseCorrecte: 1
  },
  {
    question: "Quel sélecteur CSS cible un élément avec l'identifiant 'menu' ?",
    choix: [".menu", "*menu", "#menu", "menu"],
    reponseCorrecte: 2
  },
  {
    question: "Quelle méthode JavaScript permet d'ajouter un élément à la fin d'un tableau ?",
    choix: ["push()", "pop()", "shift()", "splice()"],
    reponseCorrecte: 0
  },
  {
    question: "Lequel de ces langages s'exécute côté serveur ?",
    choix: ["HTML", "CSS", "JavaScript (navigateur)", "PHP"],
    reponseCorrecte: 3
  },
  {
    question: "Que renvoie typeof null en JavaScript ?",
    choix: ["'null'", "'undefined'", "'object'", "'boolean'"],
    reponseCorrecte: 2
  },
  {
    question: "Quelle propriété CSS permet de centrer horizontalement un bloc ?",
    choix: ["text-align: center", "margin: 0 auto", "display: inline", "padding: auto"],
    reponseCorrecte: 1
  },
  {
    question: "Quelle balise HTML définit une cellule d'en-tête dans un tableau ?",
    choix: ["<td>", "<tr>", "<th>", "<thead>"],
    reponseCorrecte: 2
  },
  {
    question: "Comment déclarer une variable constante en JavaScript moderne (ES6+) ?",
    choix: ["var x = 5", "let x = 5", "const x = 5", "fixed x = 5"],
    reponseCorrecte: 2
  },
  {
    question: "Quelle méthode permet de rechercher un élément dans le DOM par son ID ?",
    choix: ["querySelector()", "getElementById()", "getElement()", "findById()"],
    reponseCorrecte: 1
  },
  {
    question: "Quel format est utilisé pour échanger des données entre un serveur et un client web ?",
    choix: ["XML uniquement", "CSV", "JSON", "PDF"],
    reponseCorrecte: 2
  }
];

const DUREE_QUESTION = 30; // secondes par question

/* ─────────────────────────────────────────
   2. ÉTAT DU JEU
───────────────────────────────────────── */
let etat = {
  pseudo: "",
  questionIndex: 0,
  score: 0,
  bonnesReponses: 0,
  questions: [],          // tableau mélangé pour la partie
  intervalChrono: null,
  tempsRestant: DUREE_QUESTION,
  reponduCetteQuestion: false,
  historique: []          // [{ pseudo, score, bonnes, date }]
};

/* ─────────────────────────────────────────
   3. SÉLECTEURS DOM
───────────────────────────────────────── */
const $ = id => document.getElementById(id);

const DOM = {
  // Screens
  screenAccueil:   $("screen-accueil"),
  screenJeu:       $("screen-jeu"),
  screenResultats: $("screen-resultats"),
  // Accueil
  inputPseudo:     $("input-pseudo"),
  pseudoError:     $("pseudo-error"),
  btnCommencer:    $("btn-commencer"),
  // Sidebar
  sidebarPseudo:   $("sidebar-pseudo"),
  sidebarScore:    $("sidebar-score"),
  sidebarProgression: $("sidebar-progression"),
  progressFill:    $("progress-fill"),
  // Jeu
  qNum:            $("q-num"),
  qTotal:          $("q-total"),
  questionTexte:   $("question-texte"),
  reponsesGrid:    $("reponses-grid"),
  feedbackBar:     $("feedback-bar"),
  feedbackIcone:   $("feedback-icone"),
  feedbackTexte:   $("feedback-texte"),
  timerDisplay:    $("timer-display"),
  timerArc:        $("timer-arc"),
  // Classement
  classementBody:  $("classement-body"),
  // Résultats
  resEmoji:        $("res-emoji"),
  resMention:      $("res-mention"),
  resScore:        $("res-score"),
  resMessage:      $("res-message"),
  resBonnes:       $("res-bonnes"),
  resMauvaises:    $("res-mauvaises"),
  btnRejouer:      $("btn-rejouer")
};

/* ─────────────────────────────────────────
   4. NAVIGATION ENTRE ÉCRANS
───────────────────────────────────────── */
/**
 * Affiche un écran et cache les autres
 * @param {HTMLElement} screen - L'écran à afficher
 */
function afficherEcran(screen) {
  [DOM.screenAccueil, DOM.screenJeu, DOM.screenResultats].forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  screen.style.display = "flex";
  // Forcer le reflow pour l'animation
  void screen.offsetWidth;
  screen.classList.add("active");
}

/* ─────────────────────────────────────────
   5. MÉLANGE ALÉATOIRE (Fisher-Yates)
   Utilise Math.random() et Math.floor()
───────────────────────────────────────── */
/**
 * Mélange un tableau en place
 * @param {Array} tableau
 * @returns {Array} tableau mélangé
 */
function melangerTableau(tableau) {
  const t = [...tableau];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/**
 * Mélange les choix d'une question et ajuste l'index de la bonne réponse
 * @param {Object} question
 * @returns {Object} question avec choix mélangés
 */
function melangerChoix(question) {
  // Créer un tableau d'indices pour garder trace de la bonne réponse
  const indices = [0, 1, 2, 3];
  const indicesMelanges = melangerTableau(indices);
  const choixMelanges = indicesMelanges.map(i => question.choix[i]);
  const nouvelleReponse = indicesMelanges.indexOf(question.reponseCorrecte);
  return {
    question: question.question,
    choix: choixMelanges,
    reponseCorrecte: nouvelleReponse
  };
}

/* ─────────────────────────────────────────
   6. CHRONOMÈTRE
───────────────────────────────────────── */
const CIRCONFERENCE = 2 * Math.PI * 34; // 2πr avec r=34

/**
 * Met à jour l'arc SVG du chronomètre
 * @param {number} secondes - Temps restant
 */
function majChrono(secondes) {
  const ratio = secondes / DUREE_QUESTION;
  const offset = CIRCONFERENCE * (1 - ratio);
  DOM.timerArc.style.strokeDashoffset = offset;
  DOM.timerDisplay.textContent = secondes;

  // Mode urgence quand < 10 secondes
  if (secondes <= 10) {
    DOM.timerArc.classList.add("urgence");
    DOM.timerDisplay.classList.add("urgence");
  } else {
    DOM.timerArc.classList.remove("urgence");
    DOM.timerDisplay.classList.remove("urgence");
  }
}

/**
 * Démarre le chronomètre pour une question
 */
function demarrerChrono() {
  arreterChrono();
  etat.tempsRestant = DUREE_QUESTION;
  majChrono(etat.tempsRestant);

  etat.intervalChrono = setInterval(() => {
    etat.tempsRestant--;
    majChrono(etat.tempsRestant);

    if (etat.tempsRestant <= 0) {
      arreterChrono();
      // Temps écoulé → question comptée comme fausse
      if (!etat.reponduCetteQuestion) {
        afficherFeedback("temps");
        desactiverBoutons();
        setTimeout(questionSuivante, 1800);
      }
    }
  }, 1000);
}

/**
 * Stoppe le chronomètre
 */
function arreterChrono() {
  if (etat.intervalChrono) {
    clearInterval(etat.intervalChrono);
    etat.intervalChrono = null;
  }
}

/* ─────────────────────────────────────────
   7. AFFICHAGE D'UNE QUESTION
───────────────────────────────────────── */
/**
 * Affiche la question courante à l'écran
 */
function afficherQuestion() {
  const q = etat.questions[etat.questionIndex];
  const numAffiche = etat.questionIndex + 1;
  etat.reponduCetteQuestion = false;

  // Numéro et texte
  DOM.qNum.textContent = `Question ${numAffiche}`;
  DOM.qTotal.textContent = ` / ${etat.questions.length}`;
  DOM.questionTexte.textContent = q.question;

  // Sidebar
  DOM.sidebarProgression.textContent = `${numAffiche} / ${etat.questions.length}`;
  const pct = ((numAffiche - 1) / etat.questions.length) * 100;
  DOM.progressFill.style.width = pct + "%";

  // Cacher le feedback
  DOM.feedbackBar.className = "feedback-bar hidden";

  // ── Génération dynamique des boutons (createElement, appendChild) ──
  DOM.reponsesGrid.innerHTML = "";
  q.choix.forEach((choix, i) => {
    const btn = document.createElement("button");
    btn.className = "btn-reponse";
    btn.textContent = choix;
    btn.dataset.index = i;   // Pour la délégation d'événements
    DOM.reponsesGrid.appendChild(btn);
  });

  // Démarrer le chrono
  demarrerChrono();
}

/* ─────────────────────────────────────────
   8. DÉLÉGATION D'ÉVÉNEMENTS sur la grille
───────────────────────────────────────── */
DOM.reponsesGrid.addEventListener("click", function(e) {
  // Remonter jusqu'au bouton cliqué
  const btn = e.target.closest(".btn-reponse");
  if (!btn || etat.reponduCetteQuestion) return;

  const indexChoisi = parseInt(btn.dataset.index);
  traiterReponse(indexChoisi, btn);
});

/* ─────────────────────────────────────────
   9. TRAITEMENT D'UNE RÉPONSE
───────────────────────────────────────── */
/**
 * Évalue la réponse du joueur
 * @param {number} indexChoisi - Index du bouton cliqué
 * @param {HTMLElement} btnClique - Le bouton cliqué
 */
function traiterReponse(indexChoisi, btnClique) {
  etat.reponduCetteQuestion = true;
  arreterChrono();

  const q = etat.questions[etat.questionIndex];
  const estCorrect = indexChoisi === q.reponseCorrecte;

  // Désactiver tous les boutons
  desactiverBoutons();

  if (estCorrect) {
    // Bonne réponse
    etat.bonnesReponses++;
    etat.score += 10;
    btnClique.classList.add("selectionnee-ok");
    afficherFeedback("correcte");
    majScore();
  } else {
    // Mauvaise réponse : montrer la bonne
    btnClique.classList.add("selectionnee-ko");
    // Trouver et mettre en vert le bon bouton
    const boutons = DOM.reponsesGrid.querySelectorAll(".btn-reponse");
    boutons[q.reponseCorrecte].classList.add("correcte");
    afficherFeedback("incorrecte");
  }

  // Passer à la question suivante après 1,5 s
  setTimeout(questionSuivante, 1500);
}

/**
 * Désactive tous les boutons de réponse
 */
function desactiverBoutons() {
  DOM.reponsesGrid.querySelectorAll(".btn-reponse").forEach(b => {
    b.disabled = true;
  });
}

/* ─────────────────────────────────────────
   10. FEEDBACK VISUEL
───────────────────────────────────────── */
/**
 * Affiche le bandeau de feedback
 * @param {"correcte"|"incorrecte"|"temps"} type
 */
function afficherFeedback(type) {
  DOM.feedbackBar.classList.remove("hidden", "correcte-bar", "incorrecte-bar", "temps-bar");
  if (type === "correcte") {
    DOM.feedbackBar.classList.add("correcte-bar");
    DOM.feedbackIcone.textContent = "✓";
    DOM.feedbackTexte.textContent = "Bonne réponse ! +10 points";
  } else if (type === "incorrecte") {
    DOM.feedbackBar.classList.add("incorrecte-bar");
    DOM.feedbackIcone.textContent = "✗";
    DOM.feedbackTexte.textContent = "Mauvaise réponse ! La bonne réponse est en vert.";
  } else {
    DOM.feedbackBar.classList.add("temps-bar");
    DOM.feedbackIcone.textContent = "⏱";
    DOM.feedbackTexte.textContent = "Temps écoulé ! Question comptée comme fausse.";
  }
}

/* ─────────────────────────────────────────
   11. MISE À JOUR DU SCORE (sidebar)
───────────────────────────────────────── */
/**
 * Met à jour l'affichage du score avec animation
 */
function majScore() {
  DOM.sidebarScore.textContent = etat.score;
  DOM.sidebarScore.classList.remove("bump");
  void DOM.sidebarScore.offsetWidth; // reflow
  DOM.sidebarScore.classList.add("bump");
  setTimeout(() => DOM.sidebarScore.classList.remove("bump"), 400);
}

/* ─────────────────────────────────────────
   12. QUESTION SUIVANTE / FIN DE PARTIE
───────────────────────────────────────── */
/**
 * Passe à la question suivante ou termine la partie
 */
function questionSuivante() {
  etat.questionIndex++;
  if (etat.questionIndex < etat.questions.length) {
    afficherQuestion();
  } else {
    finDePartie();
  }
}

/* ─────────────────────────────────────────
   13. FIN DE PARTIE
───────────────────────────────────────── */
/**
 * Termine la partie, enregistre le score et affiche les résultats
 */
function finDePartie() {
  arreterChrono();

  // Enregistrer dans l'historique (horodatage avec Date)
  const maintenant = new Date();
  const dateFormatee = maintenant.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
  const heureFormatee = maintenant.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit"
  });

  const entree = {
    pseudo:  etat.pseudo,
    score:   etat.score,
    bonnes:  etat.bonnesReponses,
    date:    `${dateFormatee} ${heureFormatee}`
  };

  etat.historique.push(entree);

  // Trier du meilleur au moins bon score
  etat.historique.sort((a, b) => b.score - a.score);

  // Mise à jour du classement
  afficherClassement();

  // Afficher l'écran résultats
  afficherResultats(entree);
  afficherEcran(DOM.screenResultats);
}

/* ─────────────────────────────────────────
   14. ÉCRAN DE RÉSULTATS
───────────────────────────────────────── */
/**
 * Remplit l'écran de résultats
 * @param {Object} entree - Résultat de la partie
 */
function afficherResultats(entree) {
  const { emoji, mention, message } = obtenirAppreciation(entree.bonnes);

  DOM.resEmoji.textContent = emoji;
  DOM.resMention.textContent = mention;
  DOM.resScore.textContent = entree.score;
  DOM.resMessage.textContent = message;
  DOM.resBonnes.textContent = entree.bonnes;
  DOM.resMauvaises.textContent = 10 - entree.bonnes;
}

/**
 * Retourne l'appréciation selon le nombre de bonnes réponses
 * @param {number} bonnes
 * @returns {{ emoji, mention, message }}
 */
function obtenirAppreciation(bonnes) {
  if (bonnes === 10) return {
    emoji: "🏆",
    mention: "Parfait !",
    message: "Score parfait ! Vous avez maîtrisé tous les sujets. Félicitations !"
  };
  if (bonnes >= 8) return {
    emoji: "",
    mention: "Excellent !",
    message: "Très beau score ! Vous avez une solide maîtrise des concepts."
  };
  if (bonnes >= 6) return {
    emoji: "",
    mention: "Bien joué !",
    message: "Bon résultat ! Quelques révisions et vous serez au top."
  };
  if (bonnes >= 4) return {
    emoji: "",
    mention: "Passable",
    message: "Des bases sont là, mais il faut travailler davantage. Courage !"
  };
  if (bonnes >= 2) return {
    emoji: "",
    mention: "Faible",
    message: "Des lacunes importantes. Reprenez vos cours et retentez votre chance !"
  };
  return {
    emoji: "",
    mention: "Insuffisant",
    message: "Ne vous découragez pas ! Étudiez bien les bases et rejouez pour progresser."
  };
}

/* ─────────────────────────────────────────
   15. CLASSEMENT GÉNÉRAL
───────────────────────────────────────── */
/**
 * Affiche le classement trié dans le tableau HTML
 */
function afficherClassement() {
  if (etat.historique.length === 0) {
    DOM.classementBody.innerHTML = `
      <tr class="classement-vide">
        <td colspan="4">Aucune partie enregistrée</td>
      </tr>`;
    return;
  }

  DOM.classementBody.innerHTML = "";

  etat.historique.forEach((entree, i) => {
    const rang = i + 1;
    const tr = document.createElement("tr");

    // Badge médaille selon le rang
    let classRang = "rang-other";
    let labelRang = rang;
    if (rang === 1) { classRang = "rang-1"; labelRang = "1"; }
    else if (rang === 2) { classRang = "rang-2"; labelRang = "2"; }
    else if (rang === 3) { classRang = "rang-3"; labelRang = "3"; }

    tr.innerHTML = `
      <td><span class="rang-badge ${classRang}">${labelRang}</span></td>
      <td>${escapeHTML(entree.pseudo)}</td>
      <td class="score-cell">${entree.score} pts</td>
      <td>${entree.date}</td>
    `;
    DOM.classementBody.appendChild(tr);
  });
}

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ─────────────────────────────────────────
   16. DÉMARRAGE D'UNE PARTIE
───────────────────────────────────────── */
/**
 * Initialise et démarre une nouvelle partie
 */
function demarrerPartie() {
  // Réinitialiser l'état de la partie
  etat.questionIndex = 0;
  etat.score = 0;
  etat.bonnesReponses = 0;
  etat.reponduCetteQuestion = false;

  // Mélanger les questions ET les choix de chaque question
  const questionsMelangees = melangerTableau(QUESTIONS_BANQUE);
  etat.questions = questionsMelangees.map(q => melangerChoix(q));

  // Mettre à jour la sidebar
  DOM.sidebarPseudo.textContent = etat.pseudo;
  DOM.sidebarScore.textContent = "0";
  DOM.sidebarProgression.textContent = `1 / ${etat.questions.length}`;
  DOM.progressFill.style.width = "0%";

  // Afficher l'écran de jeu
  afficherEcran(DOM.screenJeu);
  afficherClassement();
  afficherQuestion();
}

/* ─────────────────────────────────────────
   17. ÉVÉNEMENTS GLOBAUX
───────────────────────────────────────── */

// ── Bouton "Commencer" ──
DOM.btnCommencer.addEventListener("click", () => {
  const pseudo = DOM.inputPseudo.value.trim();
  if (!pseudo) {
    DOM.pseudoError.textContent = "Veuillez entrer un pseudo pour continuer.";
    DOM.inputPseudo.focus();
    return;
  }
  DOM.pseudoError.textContent = "";
  etat.pseudo = pseudo;
  demarrerPartie();
});

// ── Valider avec Entrée ──
DOM.inputPseudo.addEventListener("keydown", e => {
  if (e.key === "Enter") DOM.btnCommencer.click();
});

// ── Bouton "Rejouer" ──
DOM.btnRejouer.addEventListener("click", () => {
  demarrerPartie();
});

/* ─────────────────────────────────────────
   18. INITIALISATION
───────────────────────────────────────── */
// Afficher l'écran d'accueil au démarrage
afficherEcran(DOM.screenAccueil);
afficherClassement(); // tableau vide au départ