import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Brain, Trophy, Play, RefreshCw } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSourates } from '@/shared/hooks';
import { quizService, SourateQuizStats } from '@/infra/secondary/quran';

interface QuizListScreenProps {
  navigation: any;
}

export const QuizListScreen = ({ navigation }: QuizListScreenProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sourates, loading: loadingSourates } = useSourates();
  const [quizStats, setQuizStats] = useState<SourateQuizStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (quizStats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#374151" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('quiz.title')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Brain color="#9333ea" size={64} />
          <Text style={styles.emptyTitle}>{t('quiz.no_sourates')}</Text>
          <Text style={styles.emptyText}>
            {t('quiz.complete_sourates_first')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
            {t('quiz.sourates_count', { count: quizStats.length })}
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

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        {quizStats.map((stat) => {
          const sourate = sourates.find((s) => s.numero === stat.sourateNumero);
          if (!sourate) return null;

          const progress =
            stat.totalQuestions > 0
              ? (stat.correctAnswers / stat.totalQuestions) * 100
              : 0;

          const hasDailyQuestions = stat.dailyQuestionsRemaining > 0;
          const hasNewQuestions =
            stat.questionsAnswered < stat.totalQuestions;

          return (
            <View key={sourate.numero} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.sourateBadge}>
                  <Text style={styles.sourateBadgeText}>{sourate.numero}</Text>
                </View>
                <View style={styles.sourateInfo}>
                  <Text style={styles.sourateNameArabic}>
                    {sourate.nomArabe}
                  </Text>
                  <Text style={styles.sourateNameFrench}>
                    {sourate.nomTraduction}
                  </Text>
                </View>
                <View style={styles.trophyContainer}>
                  <Trophy color="#f59e0b" size={24} />
                </View>
              </View>

              {/* Stats */}
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

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
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
              </View>
            </View>
          );
        })}
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
});
