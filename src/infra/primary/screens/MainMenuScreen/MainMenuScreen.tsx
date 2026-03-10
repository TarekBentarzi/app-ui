import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Brain, Mic, User, Bell, Lock, Flame, BookMarked } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { ReleaseNotesModal } from '../components/ReleaseNotesModal';
import { APP_VERSION, RELEASE_NOTES_1_3_0 } from '@/shared/constants/releaseNotes';
import { UniversalStorage } from '@/infra/secondary/storage/UniversalStorage';
import { styles } from './MainMenuScreen.styles';
interface MainMenuScreenProps {
    navigation: any;
}

export const MainMenuScreen = ({ navigation }: MainMenuScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress: userProgress } = useUserProgress();
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);

    const isSignedIn = !!user;

    // Check if user has seen release notes for this version
    useEffect(() => {
        const checkReleaseNotes = async () => {
            const lastSeenVersion = await UniversalStorage.getItem('last_seen_version');
            if (lastSeenVersion !== APP_VERSION) {
                setShowReleaseNotes(true);
            }
        };
        
        checkReleaseNotes();
    }, []);

    const handleCloseReleaseNotes = async () => {
        setShowReleaseNotes(false);
        await UniversalStorage.setItem('last_seen_version', APP_VERSION);
    };

    return (
        <>
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

            {/* Pronunciation - Coming Soon (Disabled) */}
            <TouchableOpacity
                testID="pronunciation-card"
                style={[styles.sectionCard, styles.lockedCard]}
                disabled={true}
            >
                <View style={[styles.sectionIcon, styles.lockedIcon]}>
                    <Lock color="#9ca3af" size={32} />
                </View>
                <View style={styles.sectionContent}>
                    <Text style={[styles.sectionCardTitle, styles.lockedText]}>
                        {t('menu.practice_pronunciation.title')}
                    </Text>
                    <Text style={[styles.sectionDescription, styles.lockedText]}>
                        {t('menu.practice_pronunciation.coming_soon')}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Quran - Always Available */}
            <TouchableOpacity
                testID="quran-card"
                style={styles.sectionCard}
                onPress={() => navigation.navigate('QuranDashboard')}
            >
                <View style={[styles.sectionIcon, styles.quranIcon]}>
                    <BookMarked color="#16a34a" size={32} />
                </View>
                <View style={styles.sectionContent}>
                    <Text style={styles.sectionCardTitle}>Quran Complet</Text>
                    <Text style={styles.sectionDescription}>
                        Accédez au Quran complet avec audio et traduction
                    </Text>
                </View>
            </TouchableOpacity>
        </ScrollView>

        {/* Release Notes Modal */}
        <ReleaseNotesModal
            visible={showReleaseNotes}
            version={APP_VERSION}
            notes={RELEASE_NOTES_1_3_0}
            onClose={handleCloseReleaseNotes}
        />
        </>
    );
};