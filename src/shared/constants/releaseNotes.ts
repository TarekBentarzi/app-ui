export const APP_VERSION = '1.3.0';

export const RELEASE_NOTES_1_3_0 = [
    // Features
    { 
        type: 'feature' as const, 
        text: 'Nouvelle section Mémorisation avec 2 onglets : "Lecture & Apprentissage" et "Quiz"' 
    },
    { 
        type: 'feature' as const, 
        text: 'Barre de progression de sourate affichée en haut de tous les modes de lecture' 
    },
    { 
        type: 'feature' as const, 
        text: 'Lecture progressive par verset avec quiz automatique à la fin de chaque sourate' 
    },
    
    // Improvements
    { 
        type: 'improvement' as const, 
        text: 'Affichage des noms de sourates en français avec l\'arabe entre parenthèses' 
    },
    { 
        type: 'improvement' as const, 
        text: 'Sélecteur de sourates maintenant défilable horizontalement (accès aux 114 sourates)' 
    },
    { 
        type: 'improvement' as const, 
        text: 'Tajweed/Prononciation désactivé temporairement (bientôt disponible)' 
    },
    { 
        type: 'improvement' as const, 
        text: 'Badge de version Alpha v1.3.0 ajouté sur l\'écran d\'accueil' 
    },
    
    // Bug Fixes
    { 
        type: 'bugfix' as const, 
        text: 'Correction de la persistance de session : vous restez connecté même après avoir quitté l\'app' 
    },
];
