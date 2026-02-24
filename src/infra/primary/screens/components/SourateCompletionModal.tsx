import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Trophy, Play, X, ArrowRight, RotateCcw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SourateCompletionModalProps {
    visible: boolean;
    sourateName: string;
    sourateNumber: number;
    nextSourateName?: string;
    onStartQuiz: () => void;
    onSkip: () => void;
    onClose: () => void;
}

export const SourateCompletionModal = ({
    visible,
    sourateName,
    sourateNumber,
    nextSourateName,
    onStartQuiz,
    onSkip,
    onClose,
}: SourateCompletionModalProps) => {
    const { t } = useTranslation();
    const [autoCloseTimer, setAutoCloseTimer] = useState(10);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animation d'entrée
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Animation de paillettes en boucle
            Animated.loop(
                Animated.sequence([
                    Animated.timing(sparkleAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(sparkleAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Compte à rebours automatique
            const interval = setInterval(() => {
                setAutoCloseTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onSkip();
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearInterval(interval);
                setAutoCloseTimer(10);
            };
        } else {
            // Reset les animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            sparkleAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const sparkleOpacity = sparkleAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 1, 0.3],
    });

    const sparkleScale = sparkleAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.8, 1.2, 0.8],
    });

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X color="#6b7280" size={24} />
                    </TouchableOpacity>

                    {/* Sparkles */}
                    <Animated.View
                        style={[
                            styles.sparkleContainer,
                            {
                                opacity: sparkleOpacity,
                                transform: [{ scale: sparkleScale }],
                            },
                        ]}
                    >
                        <Text style={styles.sparkles}>✨ 🎉 ✨</Text>
                    </Animated.View>

                    {/* Trophy icon */}
                    <View style={styles.iconContainer}>
                        <Trophy color="#f59e0b" size={64} />
                    </View>

                    {/* Congratulation message */}
                    <Text style={styles.title}>{t('sourate_completion.congratulations')}</Text>
                    <Text style={styles.subtitle}>
                        {t('sourate_completion.completed_sourate', {
                            number: sourateNumber,
                            name: sourateName,
                        })}
                    </Text>

                    {/* Question */}
                    <Text style={styles.question}>{t('sourate_completion.test_learning')}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onStartQuiz}
                        >
                            <Play color="#ffffff" size={20} />
                            <Text style={styles.primaryButtonText}>
                                {t('sourate_completion.start_quiz')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={onSkip}
                        >
                            <ArrowRight color="#374151" size={20} />
                            <Text style={styles.secondaryButtonText}>
                                {nextSourateName 
                                    ? `${t('sourate_completion.skip_to')} ${nextSourateName}` 
                                    : t('sourate_completion.skip')
                                } ({autoCloseTimer}s)
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Progress bar pour le timer */}
                    <View style={styles.timerBar}>
                        <View
                            style={[
                                styles.timerBarFill,
                                { width: `${(autoCloseTimer / 10) * 100}%` },
                            ]}
                        />
                    </View>
                </Animated.View>
            </Animated.View>
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
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    sparkleContainer: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    sparkles: {
        fontSize: 48,
        textAlign: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonsContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#9333ea',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#9333ea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#f3f4f6',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    timerBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        marginTop: 20,
        overflow: 'hidden',
    },
    timerBarFill: {
        height: '100%',
        backgroundColor: '#9333ea',
        borderRadius: 2,
    },
});
