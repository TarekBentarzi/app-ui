# Configuration Jest et Playwright

## Installation réalisée

### Dépendances installées :
- **Jest** : Framework de test unitaire
- **@testing-library/react** : Utilitaires pour tester les composants React
- **@testing-library/jest-dom** : Extensions Jest pour les assertions DOM
- **@playwright/test** : Framework de test E2E/composant
- **ts-jest** : Support TypeScript pour Jest

## Scripts de test disponibles

### Tests unitaires (Jest)
```bash
npm test                  # Exécuter les tests une fois
npm run test:watch      # Mode watch - réexécute à chaque changement
npm run test:coverage   # Générer un rapport de couverture
```

### Tests E2E (Playwright)
```bash
npm run test:e2e        # Exécuter les tests en mode headless
npm run test:e2e:ui     # Exécuter avec l'interface UI de Playwright
npm run test:e2e:debug  # Déboguer les tests
```

## Configuration

### jest.config.js
- **Environnement** : jsdom (pour tester les composants React DOM)
- **Support TypeScript** : ts-jest
- **Couverture** : Collectée pour tous les fichiers .ts/.tsx

### playwright.config.ts
- **Navigateurs** : Chrome, Firefox, Safari (Desktop)
- **URL de base** : http://localhost:19006 (serveur Expo web)
- **Rapports** : HTML (voir ./playwright-report après les tests)

## Exemples fournis

### Tests unitaires
- [App.spec.tsx](App.spec.tsx) : Exemple de test de composant React

### Tests E2E
- [e2e/app.spec.ts](e2e/app.spec.ts) : Exemple de test E2E avec Playwright

## Comment écrire des tests

### Test unitaire (Jest + React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
```

### Test E2E (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

## Notes importantes

- Assurez-vous que le serveur Expo web est lancé (`npm run web`) avant d'exécuter les tests E2E
- Les fichiers de test doivent avoir l'extension `.spec.ts` ou `.spec.tsx`
- Les tests E2E sont dans le dossier `e2e/`

