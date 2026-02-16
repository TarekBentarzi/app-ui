import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Brain, Mic, User, Bell, Lock, Flame } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';

interface MainMenuScreenProps {
    navigation: any;
}

export const MainMenuScreen = ({ navigation }: MainMenuScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress: userProgress } = useUserProgress();

    const isSignedIn = !!user;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{t('menu.title')}</Text>
                    {isSignedIn ? (
                        <Text style={styles.headerSubtitle}>{t('menu.greeting', { name: user?.name })}</Text>
                    ) : (
                        <Text style={styles.headerSubtitle}>{t('menu.welcome_back')}</Text>
                    )}
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Bell color="#374151" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="user-icon-button"
                        style={[styles.iconButton, styles.profileButton]}
                        onPress={() => isSignedIn ? navigation.navigate('Profile') : navigation.navigate('SignIn')}
                    >
                        <User color="#ffffff" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Streak Counter (only when signed in) */}
            {isSignedIn && (
                <View style={styles.streakCard}>
                    <View style={styles.streakContent}>
                        <View style={styles.streakIcon}>
                            <Flame color="#f97316" size={32} />
                        </View>
                        <View>
                            <Text style={styles.streakLabel}>{t('menu.streak')}</Text>
                            <Text style={styles.streakValue}>{userProgress.streak} {t('menu.days')}</Text>
                        </View>
                    </View>
                    <View style={styles.streakRight}>
                        <Text style={styles.streakMessage}>{t('menu.keep_it_up')}</Text>
                    </View>
                </View>
            )}

            {/* Sign In Banner (when not signed in) */}
            {!isSignedIn && (
                <View style={styles.signInBanner}>
                    <Text style={styles.signInTitle}>{t('menu.unlock_all')}</Text>
                    <Text style={styles.signInText}>
                        {t('menu.unlock_description')}
                    </Text>
                    <TouchableOpacity
                        testID="sign-in-banner-button"
                        style={styles.signInButton}
                        onPress={() => navigation.navigate('SignIn')}
                    >
                        <Text style={styles.signInButtonText}>{t('menu.signin_signup')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Current Progress (when signed in) */}
            {isSignedIn && (
                <View style={styles.progressCard}>
                    <Text style={styles.progressTitle}>{t('menu.your_progress')}</Text>
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>{t('menu.current_position')}</Text>
                        <Text style={styles.progressValue}>
                            {t('menu.surah')} {userProgress.currentSurah}, {t('menu.verse')} {userProgress.currentVerse}
                        </Text>
                    </View>
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>{t('menu.verses_read')}</Text>
                        <Text style={styles.progressValueGray}>{userProgress.versesRead}</Text>
                    </View>
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>{t('menu.verses_memorized')}</Text>
                        <Text style={styles.progressValueGray}>{userProgress.versesMemorized}</Text>
                    </View>
                </View>
            )}

            {/* Learning Sections */}
            <Text style={styles.sectionTitle}>{t('menu.choose_practice')}</Text>

            {/* Reading - Always Available */}
            <TouchableOpacity
                testID="reading-card"
                style={styles.sectionCard}
                onPress={() => navigation.navigate('Reading')}
            >
                <View style={[styles.sectionIcon, styles.readingIcon]}>
                    <BookOpen color="#059669" size={32} />
                </View>
                <View style={styles.sectionContent}>
                    <Text style={styles.sectionCardTitle}>{t('menu.practice_reading.title')}</Text>
                    <Text style={styles.sectionDescription}>{t('menu.practice_reading.subtitle')}</Text>
                    {isSignedIn && (
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        styles.readingProgress,
                                        { width: `${(userProgress.versesRead / 200) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {t('menu.practice_reading.progress', { count: userProgress.versesRead, total: 200 })}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Memorizing - Locked when not signed in */}
            <TouchableOpacity
                testID="memorizing-card"
                style={[styles.sectionCard, !isSignedIn && styles.lockedCard]}
                onPress={() => isSignedIn ? navigation.navigate('Memorizing') : navigation.navigate('SignIn')}
                disabled={!isSignedIn}
            >
                <View style={[styles.sectionIcon, isSignedIn ? styles.memorizingIcon : styles.lockedIcon]}>
                    {isSignedIn ? (
                        <Brain color="#9333ea" size={32} />
                    ) : (
                        <Lock color="#9ca3af" size={32} />
                    )}
                </View>
                <View style={styles.sectionContent}>
                    <Text style={[styles.sectionCardTitle, !isSignedIn && styles.lockedText]}>
                        {t('menu.practice_memorizing.title')}
                    </Text>
                    <Text style={[styles.sectionDescription, !isSignedIn && styles.lockedText]}>
                        {isSignedIn ? t('menu.practice_memorizing.subtitle_unlocked') : t('menu.practice_memorizing.subtitle_locked')}
                    </Text>
                    {isSignedIn && (
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        styles.memorizingProgress,
                                        { width: `${(userProgress.versesMemorized / 50) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {t('menu.practice_reading.progress', { count: userProgress.versesMemorized, total: 50 })}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Pronunciation - Locked when not signed in */}
            <TouchableOpacity
                testID="pronunciation-card"
                style={[styles.sectionCard, !isSignedIn && styles.lockedCard]}
                onPress={() => isSignedIn ? navigation.navigate('Pronunciation') : navigation.navigate('SignIn')}
                disabled={!isSignedIn}
            >
                <View style={[styles.sectionIcon, isSignedIn ? styles.pronunciationIcon : styles.lockedIcon]}>
                    {isSignedIn ? (
                        <Mic color="#2563eb" size={32} />
                    ) : (
                        <Lock color="#9ca3af" size={32} />
                    )}
                </View>
                <View style={styles.sectionContent}>
                    <Text style={[styles.sectionCardTitle, !isSignedIn && styles.lockedText]}>
                        {t('menu.practice_pronunciation.title')}
                    </Text>
                    <Text style={[styles.sectionDescription, !isSignedIn && styles.lockedText]}>
                        {isSignedIn ? t('menu.practice_pronunciation.subtitle_unlocked') : t('menu.practice_pronunciation.subtitle_locked')}
                    </Text>
                    {isSignedIn && (
                        <View style={styles.scoreContainer}>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        styles.pronunciationProgress,
                                        { width: `${userProgress.pronunciationScore}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.scoreText}>{userProgress.pronunciationScore}%</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    contentContainer: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileButton: {
        backgroundColor: '#059669',
    },
    streakCard: {
        backgroundColor: '#f97316',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    streakContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    streakIcon: {
        width: 56,
        height: 56,
        backgroundColor: '#ffffff',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    streakValue: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    streakRight: {
        alignItems: 'flex-end',
    },
    streakMessage: {
        color: '#ffffff',
        fontSize: 14,
    },
    signInBanner: {
        backgroundColor: '#059669',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    signInTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    signInText: {
        color: '#d1fae5',
        fontSize: 14,
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    signInButtonText: {
        color: '#059669',
        fontSize: 16,
        fontWeight: '600',
    },
    progressCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    progressItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    progressValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    progressValueGray: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    sectionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lockedCard: {
        backgroundColor: '#f3f4f6',
    },
    sectionIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    readingIcon: {
        backgroundColor: '#d1fae5',
    },
    memorizingIcon: {
        backgroundColor: '#f3e8ff',
    },
    pronunciationIcon: {
        backgroundColor: '#dbeafe',
    },
    lockedIcon: {
        backgroundColor: '#e5e7eb',
    },
    sectionContent: {
        flex: 1,
    },
    sectionCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    lockedText: {
        color: '#9ca3af',
    },
    progressBarContainer: {
        marginTop: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    readingProgress: {
        backgroundColor: '#059669',
    },
    memorizingProgress: {
        backgroundColor: '#9333ea',
    },
    pronunciationProgress: {
        backgroundColor: '#2563eb',
    },
    progressText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    scoreContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
});
