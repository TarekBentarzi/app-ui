import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, BookmarkPlus, Volume2, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { useTranslation } from 'react-i18next';

interface ReadingScreenProps {
    navigation: any;
}

const verses = [
    {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: "Bismillāhi r-raḥmāni r-raḥīm",
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    },
    {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: "Al-ḥamdu lillāhi rabbi l-'ālamīn",
        translation: 'All praise is due to Allah, Lord of the worlds.',
    },
    {
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: "Ar-raḥmāni r-raḥīm",
        translation: 'The Entirely Merciful, the Especially Merciful,',
    },
    {
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        transliteration: "Māliki yawmi d-dīn",
        translation: 'Sovereign of the Day of Recompense.',
    },
];

export const ReadingScreen = ({ navigation }: ReadingScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress, updateProgress } = useUserProgress();
    const [currentVerse, setCurrentVerse] = useState(progress.currentVerse || 1);
    const [showTranslation, setShowTranslation] = useState(true);

    const isSignedIn = !!user;

    const handleMarkAsRead = () => {
        const nextVerse = currentVerse < verses.length ? currentVerse + 1 : currentVerse;
        updateProgress({
            currentVerse: nextVerse,
            versesRead: Math.max(progress.versesRead, currentVerse),
        });
        if (currentVerse < verses.length) {
            setCurrentVerse(nextVerse);
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
                    <Text style={styles.title}>{t('reading.title')}</Text>
                    <Text style={styles.subtitle}>{t('reading.surah_title', { number: 1, name: 'Al-Fatiha' })}</Text>
                </View>
                <TouchableOpacity style={styles.bookmarkButton}>
                    <BookmarkPlus color="#059669" size={20} />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            {isSignedIn && (
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>{t('reading.your_progress')}</Text>
                        <Text style={styles.progressValue}>{currentVerse}/{verses.length}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(currentVerse / verses.length) * 100}%` }]} />
                    </View>
                </View>
            )}

            {/* Verse Card */}
            <View style={styles.verseCard}>
                <View style={styles.verseNumber}>
                    <Text style={styles.verseNumberText}>{currentVerse}</Text>
                </View>

                {/* Arabic Text */}
                <Text style={styles.arabicText}>{verses[currentVerse - 1]?.arabic}</Text>
                <TouchableOpacity style={styles.audioButton}>
                    <Volume2 color="#ffffff" size={20} />
                </TouchableOpacity>

                {/* Transliteration */}
                <View style={styles.transliterationBox}>
                    <Text style={styles.sectionLabel}>{t('reading.transliteration')}</Text>
                    <Text style={styles.transliterationText}>{verses[currentVerse - 1]?.transliteration}</Text>
                </View>

                {/* Translation Toggle */}
                <View style={styles.translationHeader}>
                    <Text style={styles.sectionLabel}>{t('reading.translation')}</Text>
                    <TouchableOpacity
                        testID="translation-toggle-button"
                        style={[styles.toggleButton, showTranslation && styles.toggleButtonActive]}
                        onPress={() => setShowTranslation(!showTranslation)}
                    >
                        <Text style={[styles.toggleText, showTranslation && styles.toggleTextActive]}>
                            {showTranslation ? t('common.hide') : t('common.show')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Translation */}
                {showTranslation && (
                    <View style={styles.translationBox}>
                        <Text style={styles.translationText}>{verses[currentVerse - 1]?.translation}</Text>
                    </View>
                )}
            </View>

            {/* Navigation */}
            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    testID="previous-button"
                    style={[styles.navButton, currentVerse === 1 && styles.navButtonDisabled]}
                    onPress={() => setCurrentVerse(Math.max(1, currentVerse - 1))}
                    disabled={!!(currentVerse === 1)}
                >
                    <ChevronLeft color={currentVerse === 1 ? '#9ca3af' : '#374151'} size={20} />
                    <Text style={[styles.navButtonText, currentVerse === 1 && styles.navButtonTextDisabled]}>
                        {t('common.previous')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="next-button"
                    style={[styles.navButton, currentVerse === verses.length && styles.navButtonDisabled]}
                    onPress={() => setCurrentVerse(Math.min(verses.length, currentVerse + 1))}
                    disabled={!!(currentVerse === verses.length)}
                >
                    <Text style={[styles.navButtonText, currentVerse === verses.length && styles.navButtonTextDisabled]}>
                        {t('common.next')}
                    </Text>
                    <ChevronRight color={currentVerse === verses.length ? '#9ca3af' : '#374151'} size={20} />
                </TouchableOpacity>
            </View>

            {/* Mark as Read Button */}
            {isSignedIn ? (
                <TouchableOpacity testID="mark-as-read-button" style={styles.markReadButton} onPress={handleMarkAsRead}>
                    <Check color="#ffffff" size={20} />
                    <Text style={styles.markReadText}>{t('reading.mark_as_read')}</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.signInPrompt}>
                    <Text style={styles.signInPromptText}>
                        {t('reading.signin_prompt')}
                    </Text>
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
    bookmarkButton: {
        width: 40,
        height: 40,
        backgroundColor: '#d1fae5',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#059669',
        borderRadius: 4,
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
    verseNumber: {
        width: 48,
        height: 48,
        backgroundColor: '#d1fae5',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
    },
    verseNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669',
    },
    arabicText: {
        fontSize: 32,
        lineHeight: 56,
        textAlign: 'center',
        color: '#1f2937',
        marginBottom: 16,
        writingDirection: 'rtl',
    },
    audioButton: {
        width: 48,
        height: 48,
        backgroundColor: '#059669',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 32,
    },
    transliterationBox: {
        backgroundColor: '#d1fae5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
        marginBottom: 4,
    },
    transliterationText: {
        fontSize: 16,
        color: '#1f2937',
        fontStyle: 'italic',
    },
    translationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
    },
    toggleButtonActive: {
        backgroundColor: '#059669',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    toggleTextActive: {
        color: '#ffffff',
    },
    translationBox: {
        backgroundColor: '#dbeafe',
        borderRadius: 16,
        padding: 16,
    },
    translationText: {
        fontSize: 16,
        color: '#1f2937',
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    navButtonDisabled: {
        backgroundColor: '#e5e7eb',
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    navButtonTextDisabled: {
        color: '#9ca3af',
    },
    markReadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#059669',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    markReadText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    signInPrompt: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#fbbf24',
        borderRadius: 16,
        padding: 16,
    },
    signInPromptText: {
        fontSize: 14,
        color: '#92400e',
        textAlign: 'center',
    },
});
