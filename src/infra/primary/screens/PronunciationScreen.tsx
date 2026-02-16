import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Mic, Volume2, Award, RotateCcw } from 'lucide-react-native';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';

interface PronunciationScreenProps {
    navigation: any;
}

const tajweedRules = [
    { rule: 'Ghunnah', correct: true, description: 'Nasal sound held for 2 counts' },
    { rule: 'Qalqalah', correct: true, description: 'Echo/bouncing sound' },
    { rule: 'Madd', correct: false, description: 'Elongation - should be longer' },
    { rule: 'Idghaam', correct: true, description: 'Merging sounds' },
];

export const PronunciationScreen = ({ navigation }: PronunciationScreenProps) => {
    const { updateProgress } = useUserProgress();
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const pronunciationScore = 88;

    const handleRecord = () => {
        setIsRecording(!isRecording);
        if (isRecording) {
            setTimeout(() => {
                setHasRecorded(true);
                setShowResults(true);
                updateProgress({
                    pronunciationScore: pronunciationScore,
                });
            }, 500);
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
                    <Text style={styles.title}>Pronunciation (Tajweed)</Text>
                    <Text style={styles.subtitle}>Practice & Perfect</Text>
                </View>
            </View>

            {/* Score Overview */}
            <View style={styles.scoreCard}>
                <View>
                    <Text style={styles.scoreLabel}>Overall Accuracy</Text>
                    <Text style={styles.scoreValue}>85%</Text>
                </View>
                <View style={styles.awardIcon}>
                    <Award color="#ffffff" size={32} />
                </View>
            </View>

            {/* Verse to Practice */}
            <View style={styles.verseCard}>
                <Text style={styles.practiceLabel}>Practice this verse</Text>
                <Text style={styles.arabicText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                <Text style={styles.transliterationText}>Bismillāhi r-raḥmāni r-raḥīm</Text>
                <Text style={styles.translationText}>
                    In the name of Allah, the Entirely Merciful, the Especially Merciful.
                </Text>

                {/* Listen Button */}
                <TouchableOpacity style={styles.listenButton}>
                    <Volume2 color="#2563eb" size={20} />
                    <Text style={styles.listenButtonText}>Listen to Correct Pronunciation</Text>
                </TouchableOpacity>

                {/* Tajweed Rules */}
                <View style={styles.rulesBox}>
                    <Text style={styles.rulesTitle}>⚡ Key Tajweed Rules</Text>
                    <Text style={styles.ruleItem}>• Pay attention to the Madd (elongation) in "Rahmāni"</Text>
                    <Text style={styles.ruleItem}>• Proper pronunciation of the "ḥ" sound</Text>
                    <Text style={styles.ruleItem}>• Clear articulation of double letters</Text>
                </View>
            </View>

            {/* Recording Section */}
            <View style={styles.recordingCard}>
                <Text style={styles.recordingTitle}>Your Recording</Text>

                {/* Recording Button */}
                <View style={styles.recordingButtonContainer}>
                    <TouchableOpacity
                        testID="record-button"
                        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                        onPress={handleRecord}
                    >
                        {isRecording ? (
                            <View style={styles.stopIcon} />
                        ) : (
                            <Mic color="#ffffff" size={48} />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.recordingHint}>
                        {isRecording ? 'Tap to stop recording' : hasRecorded ? 'Tap to record again' : 'Tap to start recording'}
                    </Text>
                </View>
            </View>

            {/* Results */}
            {showResults && (
                <View style={styles.resultsCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scorePercentage}>{pronunciationScore}%</Text>
                    </View>
                    <Text style={styles.resultsTitle}>Great Job!</Text>
                    <Text style={styles.resultsDescription}>Your pronunciation is very good!</Text>

                    {/* Detailed Feedback */}
                    <Text style={styles.analysisTitle}>Tajweed Analysis</Text>
                    {tajweedRules.map((rule, index) => (
                        <View key={index} style={[styles.ruleCard, rule.correct ? styles.ruleCorrect : styles.ruleWarning]}>
                            <View style={styles.ruleContent}>
                                <Text style={[styles.ruleName, rule.correct ? styles.ruleNameCorrect : styles.ruleNameWarning]}>
                                    {rule.rule}
                                </Text>
                                <Text style={[styles.ruleDesc, rule.correct ? styles.ruleDescCorrect : styles.ruleDescWarning]}>
                                    {rule.description}
                                </Text>
                            </View>
                            <View style={[styles.ruleIcon, rule.correct ? styles.ruleIconCorrect : styles.ruleIconWarning]}>
                                <Text style={styles.ruleIconText}>{rule.correct ? '✓' : '!'}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.retryButton}>
                            <RotateCcw color="#374151" size={16} />
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="continue-button"
                            style={styles.continueButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
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
    scoreCard: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#dbeafe',
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    awardIcon: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verseCard: {
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
    practiceLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    arabicText: {
        fontSize: 28,
        color: '#1f2937',
        lineHeight: 48,
        marginBottom: 16,
        textAlign: 'center',
        writingDirection: 'rtl',
    },
    transliterationText: {
        fontSize: 16,
        color: '#6b7280',
        fontStyle: 'italic',
        marginBottom: 8,
        textAlign: 'center',
    },
    translationText: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 24,
        textAlign: 'center',
    },
    listenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#dbeafe',
        borderWidth: 2,
        borderColor: '#93c5fd',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    listenButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2563eb',
    },
    rulesBox: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#fbbf24',
        borderRadius: 16,
        padding: 16,
    },
    rulesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 8,
    },
    ruleItem: {
        fontSize: 14,
        color: '#92400e',
        marginBottom: 4,
    },
    recordingCard: {
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
    recordingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    recordingButtonContainer: {
        alignItems: 'center',
    },
    recordButton: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    recordButtonActive: {
        backgroundColor: '#dc2626',
    },
    stopIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#ffffff',
        borderRadius: 4,
    },
    recordingHint: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 16,
    },
    resultsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    scoreCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    scorePercentage: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#059669',
    },
    resultsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    resultsDescription: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    ruleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    ruleCorrect: {
        backgroundColor: '#d1fae5',
    },
    ruleWarning: {
        backgroundColor: '#fef3c7',
    },
    ruleContent: {
        flex: 1,
    },
    ruleName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    ruleNameCorrect: {
        color: '#065f46',
    },
    ruleNameWarning: {
        color: '#92400e',
    },
    ruleDesc: {
        fontSize: 14,
    },
    ruleDescCorrect: {
        color: '#047857',
    },
    ruleDescWarning: {
        color: '#b45309',
    },
    ruleIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ruleIconCorrect: {
        backgroundColor: '#059669',
    },
    ruleIconWarning: {
        backgroundColor: '#f59e0b',
    },
    ruleIconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    retryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    continueButton: {
        flex: 1,
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
