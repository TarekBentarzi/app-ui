import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useProgress, useMemorizations, useRevisions } from '../../../shared/hooks';

interface QuranDashboardProps {
  navigation: any;
}

export function QuranDashboard({ navigation }: QuranDashboardProps) {
  const { user } = useAuth();
  const userId = user?.id;

  const { progress, loading: progressLoading } = useProgress(userId || '');
  const { memorizations, loading: memorizationsLoading } = useMemorizations(userId || '');
  const { revisions, loading: revisionsLoading } = useRevisions(userId || '');

  if (!userId) {
    return (
      <View style={styles.container}>
        <View style={styles.notSignedInContainer}>
          <Text style={styles.notSignedInText}>Connectez-vous pour voir vos statistiques</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.signInButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>📖 Quran Complet</Text>
        </View>
        <TouchableOpacity
          style={styles.browseSouratesButton}
          onPress={() => navigation.navigate('SouratesList')}
        >
          <Text style={styles.browseSouratesButtonText}>Parcourir les Sourates</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memorizedCount = memorizations.filter(
    (m) => m.statut === 'memorise'
  ).length;
  const inProgressCount = memorizations.filter(
    (m) => m.statut === 'en_cours'
  ).length;

  const averageMaitrise =
    memorizations.length > 0
      ? Math.round(
          memorizations.reduce((sum, m) => sum + m.niveauMaitrise, 0) /
            memorizations.length
        )
      : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📖 Mon Tableau de Bord</Text>
      </View>

      {/* Reading Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Ma Lecture</Text>
        {progressLoading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : progress ? (
          <View>
            <Text style={styles.progressText}>
              Sourate {progress.sourateNumero}, Verset {progress.versetNumero}
            </Text>
            <Text style={styles.dateText}>
              Dernière mise à jour: {new Date(progress.dateUpdate).toLocaleDateString()}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Aucune progression enregistrée</Text>
        )}
      </View>

      {/* Memorization Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Mémorisation</Text>
        {memorizationsLoading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{memorizedCount}</Text>
              <Text style={styles.statLabel}>Mémorisés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{inProgressCount}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{averageMaitrise}%</Text>
              <Text style={styles.statLabel}>Maîtrise</Text>
            </View>
          </View>
        )}
      </View>

      {/* Revisions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Révisions du jour</Text>
        {revisionsLoading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : revisions.length > 0 ? (
          <View>
            <Text style={styles.revisionsCount}>
              {revisions.length} verset{revisions.length > 1 ? 's' : ''} à réviser
            </Text>
            <View style={styles.revisionsList}>
              {revisions.slice(0, 5).map((revision) => (
                <View key={revision.id} style={styles.revisionItem}>
                  <Text style={styles.revisionText}>
                    Sourate {revision.sourateNumero}:{revision.versetNumero}
                  </Text>
                  <Text style={styles.revisionMaitrise}>
                    {revision.niveauMaitrise}%
                  </Text>
                </View>
              ))}
            </View>
            {revisions.length > 5 && (
              <Text style={styles.moreText}>
                +{revisions.length - 5} autre{revisions.length - 5 > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>Aucune révision aujourd'hui!</Text>
          </View>
        )}
      </View>

      {/* Global Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Statistiques</Text>
        <View style={styles.globalStats}>
          <StatRow label="Total versets" value={memorizations.length.toString()} />
          <StatRow
            label="Exercices réussis"
            value={memorizations
              .reduce((sum, m) => sum + m.exercicesReussis, 0)
              .toString()}
          />
          <StatRow
            label="Exercices totaux"
            value={memorizations
              .reduce((sum, m) => sum + m.exercicesTotal, 0)
              .toString()}
          />
          <StatRow
            label="Série actuelle"
            value={memorizations
              .reduce((max, m) => Math.max(max, m.streak), 0)
              .toString()}
          />
        </View>
      </View>

      {/* Browse Sourates Button */}
      <TouchableOpacity
        style={styles.browseSouratesButton}
        onPress={() => navigation.navigate('SouratesList')}
      >
        <Text style={styles.browseSouratesButtonText}>📖 Parcourir les Sourates</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={styles.statRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  loadingText: {
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  progressText: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyText: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  revisionsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  revisionsList: {
    marginTop: 8,
  },
  revisionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  revisionText: {
    fontSize: 16,
    color: '#34495e',
  },
  revisionMaitrise: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  moreText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  globalStats: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statRowLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  notSignedInContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notSignedInText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  browseSouratesButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  browseSouratesButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
