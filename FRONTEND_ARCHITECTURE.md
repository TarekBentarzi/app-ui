# React Native Frontend - Qlearn

## 🏗️ Architecture

```
app-ui/src/
├── domain/
│   ├── entities/           # Entités métier
│   ├── repositories/       # Interfaces de dépôts
│   └── usecases/          # Cas d'usage métier
├── infra/
│   ├── primary/           # Adapters primaires (UI)
│   │   └── quran/
│   │       ├── SouratesList.tsx
│   │       ├── VersetsList.tsx
│   │       ├── QuranDashboard.tsx
│   │       └── index.ts
│   └── secondary/         # Adapters secondaires (API, DB)
│       └── quran/
│           ├── types.ts
│           ├── QuranService.ts
│           ├── ProgressService.ts
│           ├── MemorizationService.ts
│           └── index.ts
└── shared/
    ├── contexts/          # React Contexts
    ├── hooks/             # Custom Hooks
    │   ├── useSourates.ts
    │   ├── useVersets.ts
    │   ├── useProgress.ts
    │   ├── useMemorization.ts
    │   └── index.ts
    └── i18n/              # Internationalisation
```

## 🎯 Clean Architecture

### Couches

1. **Domain** (métier)
   - Entités pures
   - Logique métier
   - Indépendant de toute technologie

2. **Infrastructure Secondaire** (API)
   - Services HTTP (Axios)
   - Communication avec l'API NestJS
   - Gestion des tokens JWT

3. **Infrastructure Primaire** (UI)
   - Composants React Native
   - Présentation des données
   - Interactions utilisateur

4. **Shared** (partagé)
   - Hooks personnalisés
   - Contexts React
   - Utilitaires

### Flux de données

```
User → Component → Hook → Service → API → Backend
  ↑                                           ↓
  └─────────── Data ←  Response ←────────────┘
```

## 📦 Services Disponibles

### QuranService
```typescript
import { quranService } from './infra/secondary/quran';

// Récupérer toutes les sourates
const sourates = await quranService.getAllSourates();

// Récupérer une sourate spécifique
const sourate = await quranService.getSourateByNumero(2);

// Récupérer les versets d'une sourate
const versets = await quranService.getVersetsBySourate(2);

// Récupérer un verset spécifique
const verset = await quranService.getVerset(2, 255); // Ayat al-Kursi
```

### ProgressService
```typescript
import { progressService } from './infra/secondary/quran';

// Récupérer la progression d'un utilisateur
const progress = await progressService.getUserProgress(userId);

// Sauvegarder la position de lecture
const saved = await progressService.saveProgress(userId, 2, 100);
```

### MemorizationService
```typescript
import { memorizationService } from './infra/secondary/quran';

// Récupérer les mémorisations
const memorizations = await memorizationService.getUserMemorizations(userId);

// Créer une mémorisation
const newMem = await memorizationService.createMemorization(userId, {
  versetId: 'verset-id',
  sourateNumero: 2,
  versetNumero: 255,
});

// Mettre à jour une mémorisation
const updated = await memorizationService.updateMemorization(userId, memId, {
  statut: 'memorise',
  niveauMaitrise: 100,
});

// Supprimer une mémorisation
await memorizationService.deleteMemorization(userId, memId);

// Récupérer les révisions du jour
const revisions = await memorizationService.getRevisionsForUser(userId);
```

## 🪝 Hooks Personnalisés

### useSourates()
```typescript
import { useSourates } from './shared/hooks';

function MyComponent() {
  const { sourates, loading, error, refetch } = useSourates();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <SouratesList data={sourates} />;
}
```

### useVersets(sourateNumero)
```typescript
import { useVersets } from './shared/hooks';

function SourateDetail({ sourateNumero }: { sourateNumero: number }) {
  const { versets, loading, error } = useVersets(sourateNumero);
  
  return <VersetsList data={versets} />;
}
```

### useProgress(userId)
```typescript
import { useProgress } from './shared/hooks';

function ReadingProgress({ userId }: { userId: string }) {
  const { progress, saveProgress, saving } = useProgress(userId);
  
  async function handleSave(sourate: number, verset: number) {
    await saveProgress(sourate, verset);
  }
  
  return (
    <View>
      <Text>Sourate {progress?.sourateNumero}:{progress?.versetNumero}</Text>
      <Button onPress={() => handleSave(2, 100)} disabled={saving} />
    </View>
  );
}
```

### useMemorizations(userId)
```typescript
import { useMemorizations } from './shared/hooks';

function MemorizationList({ userId }: { userId: string }) {
  const { memorizations, loading, refetch } = useMemorizations(userId);
  
  return <FlatList data={memorizations} onRefresh={refetch} />;
}
```

### useRevisions(userId)
```typescript
import { useRevisions } from './shared/hooks';

function RevisionsList({ userId }: { userId: string }) {
  const { revisions, loading } = useRevisions(userId);
  
  return (
    <View>
      <Text>{revisions.length} révisions aujourd'hui</Text>
      <FlatList data={revisions} />
    </View>
  );
}
```

### useMemorization()
```typescript
import { useMemorization } from './shared/hooks';

function MemorizationActions({ userId, versetId }: Props) {
  const {
    createMemorization,
    updateMemorization,
    deleteMemorization,
    creating,
    updating,
  } = useMemorization();
  
  async function handleStart() {
    await createMemorization(userId, versetId, 2, 255);
  }
  
  async function handleUpdate(id: string) {
    await updateMemorization(userId, id, { statut: 'memorise' });
  }
  
  return (
    <View>
      <Button onPress={handleStart} disabled={creating} />
      <Button onPress={() => handleUpdate('id')} disabled={updating} />
    </View>
  );
}
```

## 🎨 Composants UI

### SouratesList
```typescript
import { SouratesList } from './infra/primary/quran';

function SouratesScreen({ navigation }) {
  return (
    <SouratesList
      onSouratePress={(sourateNumero) => {
        navigation.navigate('SourateDetail', { sourateNumero });
      }}
    />
  );
}
```

### VersetsList
```typescript
import { VersetsList } from './infra/primary/quran';

function SourateDetailScreen({ route }) {
  const { sourateNumero } = route.params;
  
  return (
    <VersetsList
      sourateNumero={sourateNumero}
      onVersetPress={(versetNumero) => {
        console.log(`Verset ${versetNumero} pressed`);
      }}
    />
  );
}
```

### QuranDashboard
```typescript
import { QuranDashboard } from './infra/primary/quran';
import { useAuth } from './shared/contexts/AuthContext';

function DashboardScreen() {
  const { user } = useAuth();
  
  if (!user) return <Login />;
  
  return <QuranDashboard userId={user.id} />;
}
```

## 🔐 Authentification

### Configuration du Token JWT

```typescript
import {
  quranService,
  progressService,
  memorizationService,
} from './infra/secondary/quran';

// Après connexion
function handleLogin(token: string) {
  // Configurer le token pour tous les services
  quranService.setAuthToken(token);
  progressService.setAuthToken(token);
  memorizationService.setAuthToken(token);
  
  // Sauvegarder dans AsyncStorage
  AsyncStorage.setItem('authToken', token);
}

// Au démarrage de l'app
async function initializeAuth() {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    quranService.setAuthToken(token);
    progressService.setAuthToken(token);
    memorizationService.setAuthToken(token);
  }
}
```

## 🎵 Lecture Audio

Le composant `VersetsList` inclut déjà la lecture audio:

```typescript
// Utilise expo-av pour lire les fichiers audio
import { Audio } from 'expo-av';

// Les URLs audio sont au format:
// https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/SSSSVVV.mp3
// où SSS = numéro de sourate (3 chiffres)
// et VVV = numéro de verset (3 chiffres)
```

### Installation

```bash
npx expo install expo-av
```

### Permissions (iOS)

Dans `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ]
  }
}
```

## 📱 Exemple d'Application Complète

```typescript
// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  quranService,
  progressService,
  memorizationService,
} from './src/infra/secondary/quran';
import { SouratesList, VersetsList, QuranDashboard } from './src/infra/primary/quran';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      quranService.setAuthToken(token);
      progressService.setAuthToken(token);
      memorizationService.setAuthToken(token);
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Mon Tableau de Bord' }}
        />
        <Stack.Screen 
          name="Sourates" 
          component={SouratesScreen}
          options={{ title: 'Les Sourates' }}
        />
        <Stack.Screen 
          name="SourateDetail" 
          component={SourateDetailScreen}
          options={({ route }) => ({ 
            title: `Sourate ${route.params.sourateNumero}` 
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function DashboardScreen({ navigation }) {
  const userId = 'user-id'; // Get from auth context
  
  return (
    <View>
      <QuranDashboard userId={userId} />
      <Button 
        title="Voir les Sourates"
        onPress={() => navigation.navigate('Sourates')}
      />
    </View>
  );
}

function SouratesScreen({ navigation }) {
  return (
    <SouratesList
      onSouratePress={(sourateNumero) => {
        navigation.navigate('SourateDetail', { sourateNumero });
      }}
    />
  );
}

function SourateDetailScreen({ route }) {
  const { sourateNumero } = route.params;
  
  return (
    <VersetsList
      sourateNumero={sourateNumero}
      onVersetPress={(versetNumero) => {
        console.log(`Verset ${versetNumero} selected`);
      }}
    />
  );
}
```

## 🔄 Gestion du Cache (TODO)

### Avec React Query (recommandé)

```bash
npm install @tanstack/react-query
```

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

## 📊 Prochaines Étapes

- [ ] Implémenter le système d'exercices
- [ ] Ajouter les notifications pour les révisions
- [ ] Créer un mode hors-ligne avec SQLite
- [ ] Ajouter la recherche de versets
- [ ] Implémenter les favoris
- [ ] Ajouter les statistiques détaillées
- [ ] Créer des widgets de progression
- [ ] Ajouter le partage de versets
- [ ] Implémenter le mode nuit
- [ ] Ajouter la sélection de récitateurs

## 🎓 Ressources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
