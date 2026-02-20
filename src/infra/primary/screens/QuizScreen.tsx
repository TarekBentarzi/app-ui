import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Check, X, Trophy, RefreshCw } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSourates } from '@/shared/hooks';
import { quizService, QuizQuestion } from '@/infra/secondary/quran';

interface QuizScreenProps {
  navigation: any;
  route: {
    params: {
      sourateNumero: number;
      isNew: boolean;
    };
  };
}

export const QuizScreen = ({ navigation, route }: QuizScreenProps) => {
  const { sourateNumero, isNew } = route.params;
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sourates } = useSourates();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const sourate = sourates.find((s) => s.numero === sourateNumero);

  const loadQuiz = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const quizQuestions = isNew
        ? await quizService.getNewQuestions(user.id, sourateNumero, 5)
        : await quizService.getDailyQuiz(user.id, sourateNumero);
      setQuestions(quizQuestions);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [user?.id, sourateNumero, isNew]);

  const handleAnswer = async (answer: string) => {
    if (!user?.id || submitting || selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Soumettre la réponse à l'API
    try {
      setSubmitting(true);
      await quizService.submitAnswer(user.id, currentQuestion.id, answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetry = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    loadQuiz();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
        <Text style={styles.loadingText}>{t('quiz.loading_questions')}</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#374151" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>{sourate?.nomTraduction}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Trophy color="#9333ea" size={64} />
          <Text style={styles.emptyTitle}>{t('quiz.no_questions')}</Text>
          <Text style={styles.emptyText}>{t('quiz.try_again_later')}</Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = score === questions.length;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#374151" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('quiz.results')}</Text>
        </View>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.content}
        >
          <View style={styles.resultsContainer}>
            <View
              style={[
                styles.trophyContainer,
                isPerfect && styles.trophyContainerPerfect,
              ]}
            >
              <Trophy
                color={isPerfect ? '#f59e0b' : '#9333ea'}
                size={80}
              />
            </View>
            <Text style={styles.resultsTitle}>
              {isPerfect ? t('quiz.perfect_score') : t('quiz.great_job')}
            </Text>
            <Text style={styles.resultsScore}>
              {score}/{questions.length}
            </Text>
            <Text style={styles.resultsPercentage}>{percentage}%</Text>

            <View style={styles.resultsSummary}>
              <View style={styles.summaryItem}>
                <Check color="#10b981" size={24} />
                <Text style={styles.summaryValue}>{score}</Text>
                <Text style={styles.summaryLabel}>{t('quiz.correct')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <X color="#ef4444" size={24} />
                <Text style={styles.summaryValue}>
                  {questions.length - score}
                </Text>
                <Text style={styles.summaryLabel}>{t('quiz.incorrect')}</Text>
              </View>
            </View>

            <View style={styles.resultsActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.primaryButtonText}>
                  {t('quiz.back_to_list')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleRetry}
              >
                <RefreshCw color="#9333ea" size={18} />
                <Text style={styles.secondaryButtonText}>
                  {t('quiz.retry')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
          <Text style={styles.title}>{sourate?.nomTraduction}</Text>
          <Text style={styles.subtitle}>
            {t('quiz.question_of', {
              current: currentQuestionIndex + 1,
              total: questions.length,
            })}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
        />
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <View style={styles.verseBadge}>
          <Text style={styles.verseBadgeText}>
            {t('quiz.verse')} {currentQuestion.versetNumero}
          </Text>
        </View>

        <Text style={styles.question}>{t('quiz.fill_in_blank')}</Text>

        {/* Verse with blank */}
        <View style={styles.verseBox}>
          <Text style={styles.verseText}>{currentQuestion.texteWithBlank}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;
            const showCorrect = selectedAnswer && isCorrectOption;
            const showIncorrect = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                testID={`option-${option}`}
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect && styles.optionCorrect,
                  showIncorrect && styles.optionIncorrect,
                  selectedAnswer &&
                    !isSelected &&
                    !isCorrectOption &&
                    styles.optionDisabled,
                ]}
                onPress={() => !selectedAnswer && handleAnswer(option)}
                disabled={!!selectedAnswer || submitting}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer &&
                      !isSelected &&
                      !isCorrectOption &&
                      styles.optionTextDisabled,
                  ]}
                >
                  {option}
                </Text>
                {isSelected && isCorrect && <Check color="#059669" size={24} />}
                {isSelected && !isCorrect && <X color="#dc2626" size={24} />}
                {!isSelected && showCorrect && (
                  <Check color="#059669" size={24} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Feedback & Continue */}
      {selectedAnswer && (
        <View style={styles.feedbackContainer}>
          <View
            style={[
              styles.feedbackBox,
              isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
            ]}
          >
            <Text
              style={[
                styles.feedbackTitle,
                isCorrect
                  ? styles.feedbackTitleCorrect
                  : styles.feedbackTitleIncorrect,
              ]}
            >
              {isCorrect ? t('quiz.correct_answer') : t('quiz.wrong_answer')}
            </Text>
            <Text
              style={[
                styles.feedbackText,
                isCorrect
                  ? styles.feedbackTextCorrect
                  : styles.feedbackTextIncorrect,
              ]}
            >
              {isCorrect
                ? t('quiz.great_job_text')
                : t('quiz.correct_answer_was', {
                    answer: currentQuestion.correctAnswer,
                  })}
            </Text>
          </View>

          <TouchableOpacity
            testID="continue-button"
            style={styles.continueButton}
            onPress={handleNext}
          >
            <Text style={styles.continueButtonText}>
              {currentQuestionIndex < questions.length - 1
                ? t('common.next')
                : t('quiz.see_results')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  scoreBox: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#9333ea',
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verseBadge: {
    alignSelf: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  verseBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333ea',
  },
  question: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  verseBox: {
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  verseText: {
    fontSize: 28,
    textAlign: 'center',
    color: '#1f2937',
    lineHeight: 48,
    writingDirection: 'rtl',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  optionCorrect: {
    borderColor: '#059669',
    backgroundColor: '#d1fae5',
  },
  optionIncorrect: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  optionDisabled: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  optionText: {
    fontSize: 18,
    color: '#1f2937',
    writingDirection: 'rtl',
    flex: 1,
  },
  optionTextDisabled: {
    color: '#9ca3af',
  },
  feedbackContainer: {
    gap: 16,
  },
  feedbackBox: {
    borderRadius: 16,
    padding: 16,
  },
  feedbackCorrect: {
    backgroundColor: '#d1fae5',
  },
  feedbackIncorrect: {
    backgroundColor: '#fee2e2',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackTitleCorrect: {
    color: '#065f46',
  },
  feedbackTitleIncorrect: {
    color: '#991b1b',
  },
  feedbackText: {
    fontSize: 14,
  },
  feedbackTextCorrect: {
    color: '#047857',
  },
  feedbackTextIncorrect: {
    color: '#b91c1c',
  },
  continueButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
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
  backButtonLarge: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    alignItems: 'center',
  },
  trophyContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#f3e8ff',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyContainerPerfect: {
    backgroundColor: '#fef3c7',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  resultsPercentage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 32,
  },
  resultsSummary: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 40,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  resultsActions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: '#9333ea',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3e8ff',
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  secondaryButtonText: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: '600',
  },
});
