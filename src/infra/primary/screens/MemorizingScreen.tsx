import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Brain, Check, X, Trophy } from 'lucide-react-native';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';

interface MemorizingScreenProps {
    navigation: any;
}

const exercise = {
    verse: 'الْحَمْدُ لِلَّهِ رَبِّ _____',
    question: 'Complete the verse from Surah Al-Fatiha',
    correctAnswer: 'الْعَالَمِينَ',
    options: [
        'الْعَالَمِينَ',
        'الرَّحِيمِ',
        'الدِّينِ',
        'الصِّرَاطَ',
    ],
};

export const MemorizingScreen = ({ navigation }: MemorizingScreenProps) => {
    const { progress, updateProgress } = useUserProgress();
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        const correct = answer === exercise.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setScore(score + 10);
            updateProgress({
                versesMemorized: progress.versesMemorized + 1,
            });
        }
    };

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
                    <Text style={styles.title}>Fill in the Blanks</Text>
                    <Text style={styles.subtitle}>Question 1/5</Text>
                </View>
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreText}>{score} pts</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '20%' }]} />
            </View>

            {/* Question Card */}
            <View style={styles.questionCard}>
                <Text style={styles.question}>{exercise.question}</Text>

                {/* Verse with blank */}
                <View style={styles.verseBox}>
                    <Text style={styles.verseText}>{exercise.verse}</Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {exercise.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectOption = option === exercise.correctAnswer;
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
                                    selectedAnswer && !isSelected && !isCorrectOption && styles.optionDisabled,
                                ]}
                                onPress={() => !selectedAnswer && handleAnswer(option)}
                                disabled={!!(selectedAnswer !== null)}
                            >
                                <Text style={[styles.optionText, selectedAnswer && !isSelected && !isCorrectOption && styles.optionTextDisabled]}>
                                    {option}
                                </Text>
                                {isSelected && isCorrect && <Check color="#059669" size={24} />}
                                {isSelected && !isCorrect && <X color="#dc2626" size={24} />}
                                {!isSelected && showCorrect && <Check color="#059669" size={24} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Feedback */}
            {selectedAnswer && (
                <View style={styles.feedbackContainer}>
                    <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                        <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect]}>
                            {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                        </Text>
                        <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextIncorrect]}>
                            {isCorrect
                                ? 'Great job! Keep up the good work.'
                                : `The correct answer is: ${exercise.correctAnswer}`}
                        </Text>
                    </View>

                    <TouchableOpacity
                        testID="continue-button"
                        style={styles.continueButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
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
    content: {
        padding: 24,
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
    question: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
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
});
