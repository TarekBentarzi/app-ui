import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { useVersets } from '../../../shared/hooks';

interface VersetsListProps {
  route: any;
  navigation: any;
}

export function VersetsList({ route }: VersetsListProps) {
  const { sourateNumero } = route.params;
  const { versets, loading, error, refetch } = useVersets(sourateNumero);
  const [sound, setSound] = useState<Audio.Sound>();
  const [playingId, setPlayingId] = useState<string | null>(null);

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playAudio(versetId: string, audioUrl: string) {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(undefined);
        setPlayingId(null);
      }

      // Play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(versetId);

      // Reset playing state when sound finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Erreur lors de la lecture audio');
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des versets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error.message}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={versets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.versetCard}>
          <View style={styles.versetHeader}>
            <View style={styles.versetNumber}>
              <Text style={styles.numberText}>{item.versetNumero}</Text>
            </View>
            {item.audioUrl && (
              <TouchableOpacity
                style={[
                  styles.audioButton,
                  playingId === item.id && styles.audioButtonPlaying,
                ]}
                onPress={() => playAudio(item.id, item.audioUrl!)}
              >
                <Text style={styles.audioIcon}>
                  {playingId === item.id ? '⏸️' : '🔊'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View>
            <Text style={styles.arabicText}>{item.texteArabe}</Text>
            <Text style={styles.translationText}>{item.traduction}</Text>
          </View>
        </View>
      )}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  versetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  versetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  versetNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  audioButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  audioButtonPlaying: {
    backgroundColor: '#4CAF50',
  },
  audioIcon: {
    fontSize: 20,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'right',
    color: '#2c3e50',
    marginBottom: 12,
    fontFamily: 'System', // Use a proper Arabic font in production
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    fontStyle: 'italic',
  },
});
