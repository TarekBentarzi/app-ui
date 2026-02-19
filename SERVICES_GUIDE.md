# Services React Native - Qlearn

## 📦 Services créés

### ✅ Services API

1. **QuranService** - Gestion des sourates et versets
   - `getAllSourates()` - Toutes les sourates
   - `getSourateByNumero(numero)` - Une sourate spécifique
   - `getVersetsBySourate(sourateNumero)` - Tous les versets d'une sourate
   - `getVerset(sourateNumero, versetNumero)` - Un verset spécifique

2. **ProgressService** - Sauvegarde de progression
   - `getUserProgress(userId)` - Position de lecture
   - `saveProgress(userId, sourateNumero, versetNumero)` - Sauvegarder

3. **MemorizationService** - Mémorisation de versets
   - `getUserMemorizations(userId)` - Versets mémorisés
   - `getRevisionsForUser(userId)` - Versets à réviser
   - `createMemorization(userId, data)` - Commencer mémorisation
   - `updateMemorization(userId, id, data)` - Mettre à jour
   - `deleteMemorization(userId, id)` - Supprimer
   - `calculateNextRevision(level, streak)` - Calcul révision espacée

### ✅ Hooks React personnalisés

1. **useSourates** - Liste des sourates
2. **useSourate(numero)** - Une sourate spécifique
3. **useVersets(sourateNumero)** - Versets d'une sourate
4. **useVerset(sourateNumero, versetNumero)** - Un verset
5. **useProgress(userId)** - Progression avec `saveProgress()`
6. **useMemorizations(userId)** - Liste mémorisations
7. **useRevisions(userId)** - Versets à réviser
8. **useMemorization()** - Actions CRUD mémorisation

## 🚀 Utilisation

### Exemple 1: Afficher les sourates

```typescript
import { useSourates } from './shared/hooks/useSourates';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

function SouratesScreen() {
  const { sourates, loading, error, refetch } = useSourates();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Erreur: {error.message}</Text>;

  return (
    <FlatList
      data={sourates}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.numero}. {item.nomTranslitteration}</Text>
          <Text>{item.nomArabe}</Text>
          <Text>{item.nombreVersets} versets</Text>
        </View>
      )}
      onRefresh={refetch}
      refreshing={loading}
    />
  );
}
```

### Exemple 2: Afficher les versets avec audio

```typescript
import { useVersets } from './shared/hooks/useVersets';
import { Audio } from 'expo-av';
import { View, Text, Button, ActivityIndicator } from 'react-native';

function VersetsScreen({ sourateNumero }: { sourateNumero: number }) {
  const { versets, loading } = useVersets(sourateNumero);
  const [sound, setSound] = React.useState<Audio.Sound>();

  async function playAudio(audioUrl: string) {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );
    setSound(sound);
  }

  React.useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={versets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.versetNumero}. {item.texteArabe}</Text>
          <Text>{item.traduction}</Text>
          {item.audioUrl && (
            <Button 
              title="🔊 Écouter" 
              onPress={() => playAudio(item.audioUrl!)} 
            />
          )}
        </View>
      )}
    />
  );
}
```

### Exemple 3: Sauvegarder la progression

```typescript
import { useProgress } from './shared/hooks/useProgress';
import { useAuth } from './shared/contexts/AuthContext';
import { Button, Text, ActivityIndicator } from 'react-native';

function ReadingScreen({ sourateNumero, versetNumero }) {
  const { user } = useAuth();
  const { progress, saveProgress, saving } = useProgress(user?.id);

  async function handleSaveProgress() {
    try {
      await saveProgress(sourateNumero, versetNumero);
      alert('Position sauvegardée!');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  }

  return (
    <View>
      <Text>Sourate {sourateNumero}, Verset {versetNumero}</Text>
      <Button
        title={saving ? "Sauvegarde..." : "📌 Sauvegarder ma position"}
        onPress={handleSaveProgress}
        disabled={saving}
      />
      {progress && (
        <Text>
          Dernière lecture: Sourate {progress.sourateNumero}:{progress.versetNumero}
        </Text>
      )}
    </View>
  );
}
```

### Exemple 4: Mémorisation de versets

```typescript
import { useMemorization, useMemorizations } from './shared/hooks/useMemorization';
import { useAuth } from './shared/contexts/AuthContext';
import { View, Text, Button, FlatList } from 'react-native';

function MemorizationScreen() {
  const { user } = useAuth();
  const { memorizations, loading, refetch } = useMemorizations(user?.id);
  const { 
    createMemorization, 
    updateMemorization, 
    creating, 
    updating 
  } = useMemorization();

  async function startMemorizing(verset: Verset) {
    try {
      await createMemorization(
        user!.id,
        verset.id,
        verset.sourateNumero,
        verset.versetNumero
      );
      refetch();
      alert('Mémorisation commencée!');
    } catch (error) {
      alert('Erreur');
    }
  }

  async function completeExercise(memorizationId: string) {
    try {
      await updateMemorization(user!.id, memorizationId, {
        exercicesTotal: 5,
        exercicesReussis: 4,
        niveauMaitrise: 80,
        statut: 'memorise',
      });
      refetch();
    } catch (error) {
      alert('Erreur');
    }
  }

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={memorizations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>Sourate {item.sourateNumero}:{item.versetNumero}</Text>
          <Text>Statut: {item.statut}</Text>
          <Text>Maîtrise: {item.niveauMaitrise}%</Text>
          <Text>
            Exercices: {item.exercicesReussis}/{item.exercicesTotal}
          </Text>
          <Button
            title="✅ Compléter exercice"
            onPress={() => completeExercise(item.id)}
            disabled={updating}
          />
        </View>
      )}
    />
  );
}
```

### Exemple 5: Révisions

```typescript
import { useRevisions } from './shared/hooks/useMemorization';
import { useAuth } from './shared/contexts/AuthContext';
import { View, Text, FlatList, Badge } from 'react-native';

function RevisionsScreen() {
  const { user } = useAuth();
  const { revisions, loading, refetch } = useRevisions(user?.id);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>📚 Révisions du jour: {revisions.length}</Text>
      <FlatList
        data={revisions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>Sourate {item.sourateNumero}:{item.versetNumero}</Text>
            <Text>Niveau: {item.niveauMaitrise}%</Text>
            <Text>
              Prochaine révision: {new Date(item.prochaineRevision!).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
```

## 🔧 Configuration

### Installation des dépendances

```bash
npm install axios expo-av
```

### Configuration de l'URL de l'API

Dans `types.ts`, modifiez `API_CONFIG.baseURL` pour pointer vers votre API en production.

### Authentification

Tous les services supportent l'authentification JWT:

```typescript
import { quranService, progressService, memorizationService } from './infra/secondary/quran';

// Après connexion, configurer le token
const token = 'votre-jwt-token';
quranService.setAuthToken(token);
progressService.setAuthToken(token);
memorizationService.setAuthToken(token);
```

## 📱 Prochaines étapes

1. Créer les composants UI (écrans, cartes, listes)
2. Implémenter le lecteur audio avec contrôles
3. Créer les exercices de mémorisation (QCM, complétion, etc.)
4. Ajouter les notifications pour les révisions
5. Implémenter le mode hors-ligne avec cache local
