import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Brain, Trophy, Play, RefreshCw, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSourates } from '@/shared/hooks';
import { quizService, SourateQuizStats } from '@/infra/secondary/quran';

interface QuizListScreenProps {
  navigation: any;
  hideHeader?: boolean; // Pour utilisation dans les tabs
}

type FilterType = 'all' | 'read' | 'unread' | 'completed' | 'custom';

export const QuizListScreen = ({ navigation, hideHeader = false }: QuizListScreenProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sourates, loading: loadingSourates } = useSourates();
  const [quizStats, setQuizStats] = useState<SourateQuizStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showCustomList, setShowCustomList] = useState(false);
  const [selectedSourates, setSelectedSourates] = useState<Set<number>>(new Set());

  const loadQuizStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const stats = await quizService.getUserQuizStats(user.id);
      setQuizStats(stats);
    } catch (error) {
      console.error('Error loading quiz stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuizStats();
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuizStats();
  };

  const handleStartQuiz = (sourateNumero: number, isNew: boolean) => {
    navigation.navigate('Quiz', {
      sourateNumero,
      isNew,
    });
  };

  // Filtrer les sourates selon le filtre sélectionné
  const getFilteredSourates = () => {
    return sourates.filter(sourate => {
      const stat = quizStats.find(s => s.sourateNumero === sourate.numero);
      const hasStats = !!stat;
      const isCompleted = stat && stat.questionsAnswered >= stat.totalQuestions;

      switch (filter) {
        case 'read':
          return hasStats;
        case 'unread':
          return !hasStats;
        case 'completed':
          return isCompleted;
        case 'custom':
          return selectedSourates.has(sourate.numero);
        case 'all':
        default:
          return true;
      }
    });
  };

  const toggleSourateSelection = (numero: number) => {
    const newSelected = new Set(selectedSourates);
    if (newSelected.has(numero)) {
      newSelected.delete(numero);
    } else {
      newSelected.add(numero);
    }
    setSelectedSourates(newSelected);
  };

  const selectAllSourates = () => {
    const allNumbers = new Set(sourates.map(s => s.numero));
    setSelectedSourates(allNumbers);
  };

  const deselectAllSourates = () => {
    setSelectedSourates(new Set());
  };

  const filteredSourates = getFilteredSourates();

  if (loading || loadingSourates) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
        <Text style={styles.loadingText}>{t('quiz.loading')}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Brain color="#9333ea" size={64} />
        <Text style={styles.emptyTitle}>{t('quiz.signin_required')}</Text>
        <Text style={styles.emptyText}>{t('quiz.signin_prompt')}</Text>
        <TouchableOpacity
          style={styles.signinButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.signinButtonText}>{t('common.signin')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {!hideHeader && (
        <View style={styles.header}>
          <TouchableOpacity
            testID="back-button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#374151" size={20} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('quiz.title')}</Text>
            <Text style={styles.subtitle}>
              {filteredSourates.length} {t('quiz.sourates')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              color="#9333ea"
              size={20}
              style={refreshing ? styles.spinning : undefined}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'read' && styles.filterButtonActive]}
          onPress={() => setFilter('read')}
        >
          <Text style={[styles.filterButtonText, filter === 'read' && styles.filterButtonTextActive]}>
            Lues
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterButtonText, filter === 'unread' && styles.filterButtonTextActive]}>
            Non lues
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
            Complétées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Filter Button + Dropdown */}
      <View style={styles.customFilterContainer}>
        <TouchableOpacity
          style={[styles.customFilterButton, filter === 'custom' && styles.customFilterButtonActive]}
          onPress={() => {
            setFilter('custom');
            setShowCustomList(!showCustomList);
          }}
        >
          <Filter color={filter === 'custom' ? '#ffffff' : '#9333ea'} size={18} />
          <Text style={[styles.customFilterButtonText, filter === 'custom' && styles.customFilterButtonTextActive]}>
            Personnalisé ({selectedSourates.size})
          </Text>
          {showCustomList ? (
            <ChevronUp color={filter === 'custom' ? '#ffffff' : '#9333ea'} size={18} />
          ) : (
            <ChevronDown color={filter === 'custom' ? '#ffffff' : '#9333ea'} size={18} />
          )}
        </TouchableOpacity>

        {/* Dropdown List with Checkboxes */}
        {showCustomList && (
          <View style={styles.customListContainer}>
            <View style={styles.customListHeader}>
              <Text style={styles.customListTitle}>
                Sélectionner les sourates ({selectedSourates.size}/{sourates.length})
              </Text>
              <View style={styles.customListActions}>
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={selectAllSourates}
                >
                  <Text style={styles.selectAllButtonText}>Tout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={deselectAllSourates}
                >
                  <Text style={styles.selectAllButtonText}>Aucun</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.customListScroll} nestedScrollEnabled>
              {sourates.map((sourate) => {
                const isSelected = selectedSourates.has(sourate.numero);
                return (
                  <TouchableOpacity
                    key={sourate.numero}
                    style={styles.customListItem}
                    onPress={() => toggleSourateSelection(sourate.numero)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Check color="#ffffff" size={16} />}
                    </View>
                    <Text style={styles.customListItemText}>
                      {sourate.numero}. {sourate.nomTraduction} ({sourate.nomArabe})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        {filteredSourates.length === 0 ? (
          <View style={styles.emptyFilterContainer}>
            <Filter color="#9ca3af" size={48} />
            <Text style={styles.emptyFilterText}>Aucune sourate dans cette catégorie</Text>
          </View>
        ) : (
          filteredSourates.map((sourate) => {
            const stat = quizStats.find((s) => s.sourateNumero === sourate.numero);
            const hasStats = !!stat;

            const progress = hasStats && stat.totalQuestions > 0
              ? (stat.correctAnswers / stat.totalQuestions) * 100
              : 0;

            const hasDailyQuestions = hasStats && stat.dailyQuestionsRemaining > 0;
            const hasNewQuestions = hasStats && stat.questionsAnswered < stat.totalQuestions;

            return (
              <View key={sourate.numero} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.sourateBadge}>
                    <Text style={styles.sourateBadgeText}>{sourate.numero}</Text>
                  </View>
                  <View style={styles.sourateInfo}>
                    <Text style={styles.sourateNameFrench}>
                      {sourate.nomTraduction} ({sourate.nomArabe})
                    </Text>
                  </View>
                  <View style={styles.trophyContainer}>
                    {hasStats ? (
                      <Trophy color="#f59e0b" size={24} />
                    ) : (
                      <Brain color="#9ca3af" size={24} />
                    )}
                  </View>
                </View>

                {/* Stats */}
                {hasStats ? (
                  <>
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stat.totalQuestions}</Text>
                        <Text style={styles.statLabel}>{t('quiz.questions')}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {stat.correctAnswers}/{stat.questionsAnswered}
                        </Text>
                        <Text style={styles.statLabel}>{t('quiz.correct')}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{Math.round(progress)}%</Text>
                        <Text style={styles.statLabel}>{t('quiz.progress')}</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </>
                ) : (
                  <View style={styles.noStatsContainer}>
                    <Text style={styles.noStatsText}>
                      Quiz disponible - Commencez dès maintenant !
                    </Text>
                  </View>
                )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {hasStats ? (
                  <>
                    {hasDailyQuestions && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={() => handleStartQuiz(sourate.numero, false)}
                      >
                        <Play color="#ffffff" size={18} />
                        <Text style={styles.primaryButtonText}>
                          {t('quiz.daily_quiz')} ({stat.dailyQuestionsRemaining})
                        </Text>
                      </TouchableOpacity>
                    )}
                    {hasNewQuestions && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          hasDailyQuestions
                            ? styles.secondaryButton
                            : styles.primaryButton,
                        ]}
                        onPress={() => handleStartQuiz(sourate.numero, true)}
                      >
                        <Brain
                          color={hasDailyQuestions ? '#9333ea' : '#ffffff'}
                          size={18}
                        />
                        <Text
                          style={
                            hasDailyQuestions
                              ? styles.secondaryButtonText
                              : styles.primaryButtonText
                          }
                        >
                          {t('quiz.new_questions')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!hasDailyQuestions && !hasNewQuestions && (
                      <View style={styles.completedContainer}>
                        <Trophy color="#10b981" size={20} />
                        <Text style={styles.completedText}>
                          {t('quiz.all_completed')}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => handleStartQuiz(sourate.numero, true)}
                  >
                    <Play color="#ffffff" size={18} />
                    <Text style={styles.primaryButtonText}>
                      Commencer le quiz
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  refreshButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinning: {
    // Animation will be added via Animated API if needed
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  signinButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  signinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourateBadge: {
    width: 48,
    height: 48,
    backgroundColor: '#f3e8ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourateBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  sourateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sourateNameArabic: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sourateNameFrench: {
    fontSize: 14,
    color: '#6b7280',
  },
  trophyContainer: {
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#9333ea',
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#9333ea',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3e8ff',
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  secondaryButtonText: {
    color: '#9333ea',
    fontSize: 14,
    fontWeight: '600',
  },
  completedContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
  },
  completedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#9333ea',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  noStatsContainer: {
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  noStatsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyFilterText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  customFilterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  customFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  customFilterButtonActive: {
    backgroundColor: '#9333ea',
  },
  customFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333ea',
  },
  customFilterButtonTextActive: {
    color: '#ffffff',
  },
  customListContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  customListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  customListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  customListActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#9333ea',
  },
  selectAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  customListScroll: {
    maxHeight: 300,
  },
  customListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  customListItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
});
