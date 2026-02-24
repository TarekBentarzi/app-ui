import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Trophy, RotateCcw, ArrowRight, Brain } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface QuizResultModalProps {
    visible: boolean;
    score: number;
    totalQuestions: number;
    sourateNumber: number;
    sourateName: string;
    onContinueQuizzes: () => void;
    onRedoSourate: () => void;
    onNextSourate: () => void;
    onClose: () => void;
}

export const QuizResultModal = ({
    visible,
    score,
    totalQuestions,
    sourateNumber,
    sourateName,
    onContinueQuizzes,
    onRedoSourate,
    onNextSourate,
    onClose,
}: QuizResultModalProps) => {
    const { t } = useTranslation();
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    {/* Icon et titre */}
                    <View
                        style={[
                            styles.iconContainer,
                            isPerfect ? styles.iconPerfect : isGood ? styles.iconGood : styles.iconOk,
                        ]}
                    >
                        <Trophy
                            color={isPerfect ? '#f59e0b' : isGood ? '#10b981' : '#6b7280'}
                            size={64}
                        />
                    </View>

                    <Text style={styles.title}>
                        {isPerfect ? t('quiz.perfect_score') : isGood ? t('quiz.great_job') : t('quiz.results')}
                    </Text>

                    {/* Score */}
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>
                            {score}/{totalQuestions}
                        </Text>
                        <Text style={styles.percentageText}>{percentage}%</Text>
                    </View>

                    {/* Message */}
                    <Text style={styles.message}>
                        {t('sourate_completion.completed_sourate', {
                            number: sourateNumber,
                            name: sourateName,
                        })}
                    </Text>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsTitle}>{t('common.what_next')}</Text>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={onContinueQuizzes}
                        >
                            <Brain color="#9333ea" size={24} />
                            <Text style={styles.optionText}>
                                {t('sourate_completion.stay_in_quiz')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={onRedoSourate}
                        >
                            <RotateCcw color="#059669" size={24} />
                            <Text style={styles.optionText}>
                                {t('sourate_completion.redo_sourate')}
                            </Text>
                        </TouchableOpacity>

                        {sourateNumber < 114 && (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={onNextSourate}
                            >
                                <ArrowRight color="#3b82f6" size={24} />
                                <Text style={styles.optionText}>
                                    {t('sourate_completion.continue_to_next')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconPerfect: {
        backgroundColor: '#fef3c7',
    },
    iconGood: {
        backgroundColor: '#d1fae5',
    },
    iconOk: {
        backgroundColor: '#f3f4f6',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 16,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    percentageText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#6b7280',
    },
    message: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    optionsContainer: {
        width: '100%',
        gap: 12,
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f9fafb',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
});
