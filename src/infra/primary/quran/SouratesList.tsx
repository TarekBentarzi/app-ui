import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSourates } from '../../../shared/hooks';

interface SouratesListProps {
  navigation: any;
}

export function SouratesList({ navigation }: SouratesListProps) {
  const { sourates, loading, error, refetch } = useSourates();

  const handleSouratePress = (sourateNumero: number) => {
    navigation.navigate('VersetsList', { sourateNumero });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des sourates...</Text>
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
      data={sourates}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.sourateCard}
          onPress={() => handleSouratePress(item.numero)}
        >
          <View style={styles.sourateNumber}>
            <Text style={styles.numberText}>{item.numero}</Text>
          </View>
          <View style={styles.sourateContent}>
            <Text style={styles.arabicName}>{item.nomArabe}</Text>
            <Text style={styles.frenchName}>
              {item.nomTranslitteration} - {item.nomTraduction}
            </Text>
            <Text style={styles.info}>
              {item.nombreVersets} versets • {item.revelation === 'mecque' ? '🕋 Mecquoise' : '🕌 Médinoise'}
            </Text>
          </View>
        </TouchableOpacity>
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
  sourateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sourateNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  numberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sourateContent: {
    flex: 1,
    justifyContent: 'center',
  },
  arabicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
  },
  frenchName: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});
