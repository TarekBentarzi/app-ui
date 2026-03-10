import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { useTranslation } from 'react-i18next';
import { useSourates, useVersets, useProgress } from '@/shared/hooks';
import { Audio } from 'expo-av';
import type { Sourate } from '@/infra/secondary/quran';
import { SourateCompletionModal } from '../components/SourateCompletionModal';
import { SurahProgressBar } from '../components/SurahProgressBar';
import { quizService } from '@/infra/secondary/quran';

interface VerseReadingScreenProps {
    navigation: any;
}

export const VerseReadingScreen = ({ navigation }: VerseReadingScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress: localProgress, updateProgress } = useUserProgress();
    const effectiveUserId = user?.id || 'anonymous';
    const { progress: verseProgress, loading: loadingVerse, saveProgress: saveProgressToStorage } = useProgress(effectiveUserId, 'verse');
    
    const isSignedIn = !!user;
    const [selectedSurah, setSelectedSurah] = useState(0); // Commencer à 0 pour attendre la progression
    const [currentVerse, setCurrentVerse] = useState(1);
    const [showTranslation, setShowTranslation] = useState(true);
    const [sound, setSound] = useState<Audio.Sound>();
    const [playingVersetId, setPlayingVersetId] = useState<string | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedSourate, setCompletedSourate] = useState<{ numero: number; nom: string } | null>(null);
    
    const { sourates, loading: loadingSourates } = useSourates();
    const { versets, loading: loadingVersets, error } = useVersets(selectedSurah);
    
    const currentSourate = sourates.find(s => s.numero === selectedSurah);
    const totalVerses = versets.length;

    // Wrapper pour synchroniser ProgressStorage et UserProgressContext
    const saveProgress = useCallback(async (surah: number, verse: number) => {
        // Sauvegarder dans ProgressStorage
        await saveProgressToStorage(surah, verse);
        // Synchroniser UserProgressContext
        updateProgress({
            currentSurah: surah,
            currentVerse: verse,
        });
    }, [saveProgressToStorage, updateProgress]);

    // Charger la position sauvegardée
    useEffect(() => {
        if (!loadingVerse) {
            if (verseProgress) {
                setSelectedSurah(verseProgress.sourateNumero);
                setCurrentVerse(verseProgress.versetNumero);
            } else {
                // Pas de progression sauvegardée, commencer à Fatiha
                setSelectedSurah(1);
                setCurrentVerse(1);
            }
        }
    }, [loadingVerse, verseProgress]);

    // Sauvegarder automatiquement (backup)
    useEffect(() => {
        const timer = setTimeout(() => {
            saveProgress(selectedSurah, currentVerse);
        }, 2000);
        
        return () => clearTimeout(timer);
    }, [selectedSurah, currentVerse, saveProgress]);

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    const handlePlayAudio = async (versetId: string, audioUrl: string | null) => {
        if (!audioUrl) return;
        
        try {
            // Si on clique sur le même verset en cours de lecture, arrêter le son
            if (playingVersetId === versetId && sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(undefined);
                setPlayingVersetId(null);
                return;
            }
            
            // Sinon, arrêter le son précédent et jouer le nouveau
            if (sound) {
                await sound.unloadAsync();
                setSound(undefined);
                setPlayingVersetId(null);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            setSound(newSound);
            setPlayingVersetId(versetId);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingVersetId(null);
                }
            });
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleNext = async () => {
        if (currentVerse < totalVerses) {
            const nextVerse = currentVerse + 1;
            setCurrentVerse(nextVerse);
            
            // Sauvegarder et synchroniser automatiquement
            await saveProgress(selectedSurah, nextVerse);
            // Mettre à jour uniquement les stats
            updateProgress({
                versesRead: localProgress.versesRead + 1,
            });
        } else {
            // Fin de la sourate - afficher modal
            if (currentSourate && user) {
                setCompletedSourate({ numero: currentSourate.numero, nom: currentSourate.nomTraduction });
                setShowCompletionModal(true);
            }
        }
    };

    const handlePrevious = () => {
        if (currentVerse > 1) {
            const prevVerse = currentVerse - 1;
            setCurrentVerse(prevVerse);
            // Sauvegarder et synchroniser automatiquement
            saveProgress(selectedSurah, prevVerse);
        }
    };

    const handleSourateChange = (newSurah: number) => {
        setSelectedSurah(newSurah);
        setCurrentVerse(1);
        // Sauvegarder et synchroniser automatiquement
        saveProgress(newSurah, 1);
    };

    const handleCloseCompletionModal = () => {
        setShowCompletionModal(false);
        setCompletedSourate(null);
        
        // Passer à la sourate suivante
        if (selectedSurah < 114) {
            handleSourateChange(selectedSurah + 1);
        }
    };

    if (loadingVersets || loadingSourates) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#9333ea" />
                <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
            </View>
        );
    }

    if (error || versets.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{t('reading.error_loading')}</Text>
            </View>
        );
    }

    const currentVerseData = versets[currentVerse - 1];

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            {currentSourate && (
                <SurahProgressBar
                    surahName={currentSourate.nomTraduction}
                    surahNumber={currentSourate.numero}
                    currentVerse={currentVerse}
                    totalVerses={totalVerses}
                />
            )}

            {/* Surah Selector - Déplacé en haut */}
            <View style={styles.surahSelectorTop}>
                <Text style={styles.surahSelectorLabel}>{t('reading.change_surah')}</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={Platform.OS === 'web'}
                    style={styles.surahScrollView}
                    contentContainerStyle={styles.surahListContent}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    persistentScrollbar={Platform.OS === 'web'}
                >
                    {sourates.map((surah) => (
                        <TouchableOpacity
                            key={surah.numero}
                            style={[
                                styles.surahChip,
                                selectedSurah === surah.numero && styles.surahChipActive
                            ]}
                            onPress={() => handleSourateChange(surah.numero)}
                            activeOpacity={0.7}
                            delayPressIn={Platform.OS === 'web' ? 0 : 100}
                        >
                            <Text style={[
                                styles.surahChipText,
                                selectedSurah === surah.numero && styles.surahChipTextActive
                            ]}>
                                {surah.numero}. {surah.nomTraduction} ({surah.nomArabe})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
                {/* Verse Card */}
                <View style={styles.verseCard}>
                    <View style={styles.verseNumber}>
                        <Text style={styles.verseNumberText}>{currentVerse}</Text>
                    </View>

                    {/* Arabic Text */}
                    <Text style={styles.arabicText}>{currentVerseData?.texteArabe}</Text>
                    
                    {/* Audio Button */}
                    {currentVerseData?.audioUrl && (
                        <TouchableOpacity 
                            style={styles.audioButton}
                            onPress={() => handlePlayAudio(currentVerseData.id, currentVerseData.audioUrl)}
                        >
                            <Volume2 color="#ffffff" size={20} />
                        </TouchableOpacity>
                    )}

                    {/* Transliteration */}
                    {currentVerseData?.translitteration && (
                        <View style={styles.transliterationBox}>
                            <Text style={styles.sectionLabel}>{t('reading.transliteration')}</Text>
                            <Text style={styles.transliterationText}>{currentVerseData.translitteration}</Text>
                        </View>
                    )}

                    {/* Translation */}
                    <View style={styles.translationHeader}>
                        <Text style={styles.sectionLabel}>{t('reading.translation')}</Text>
                        <TouchableOpacity
                            style={[styles.toggleButton, showTranslation && styles.toggleButtonActive]}
                            onPress={() => setShowTranslation(!showTranslation)}
                        >
                            <Text style={[styles.toggleText, showTranslation && styles.toggleTextActive]}>
                                {showTranslation ? t('common.hide') : t('common.show')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showTranslation && currentVerseData?.traduction && (
                        <Text style={styles.translationText}>{currentVerseData.traduction}</Text>
                    )}
                </View>

                {/* Navigation Buttons */}
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={[styles.navButton, currentVerse === 1 && styles.navButtonDisabled]}
                        onPress={handlePrevious}
                        disabled={currentVerse === 1}
                    >
                        <ChevronLeft color={currentVerse === 1 ? '#9ca3af' : '#059669'} size={20} />
                        <Text style={[styles.navButtonText, currentVerse === 1 && styles.navButtonTextDisabled]}>
                            {t('reading.previous')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentVerse < totalVerses ? t('reading.next') : t('reading.finish')}
                        </Text>
                        {currentVerse < totalVerses ? (
                            <ChevronRight color="#ffffff" size={20} />
                        ) : (
                            <Check color="#ffffff" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Completion Modal */}
            {completedSourate && (
                <SourateCompletionModal
                    visible={showCompletionModal}
                    sourateNumber={completedSourate.numero}
                    sourateName={completedSourate.nom}
                    nextSourateName={selectedSurah < 114 ? sourates[selectedSurah]?.nomTraduction : undefined}
                    onStartQuiz={() => {
                        setShowCompletionModal(false);
                        navigation.navigate('Quiz', {
                            sourateNumero: completedSourate.numero,
                            isNew: true,
                        });
                    }}
                    onSkip={handleCloseCompletionModal}
                    onClose={handleCloseCompletionModal}
                />
            )}
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
        padding: 16,
        gap: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
    },
    verseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    verseNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#9333ea',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    verseNumberText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    arabicText: {
        fontSize: 32,
        lineHeight: 56,
        textAlign: 'right',
        color: '#111827',
        marginBottom: 16,
        fontFamily: 'System',
    },
    audioButton: {
        backgroundColor: '#9333ea',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    transliterationBox: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    transliterationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151',
        fontStyle: 'italic',
    },
    translationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    toggleButtonActive: {
        backgroundColor: '#9333ea',
        borderColor: '#9333ea',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    toggleTextActive: {
        color: '#ffffff',
    },
    translationText: {
        fontSize: 16,
        lineHeight: 28,
        color: '#374151',
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#059669',
    },
    navButtonDisabled: {
        borderColor: '#e5e7eb',
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    navButtonTextDisabled: {
        color: '#9ca3af',
    },
    nextButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#059669',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    surahSelectorTop: {
        marginTop: 8,
        marginBottom: 16,
    },
    surahSelectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12,
    },
    surahScrollView: {
        flexGrow: 0,
        marginHorizontal: -16,
    },
    surahListContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingRight: 32,
    },
    surahChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    surahChipActive: {
        backgroundColor: '#9333ea',
    },
    surahChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    surahChipTextActive: {
        color: '#ffffff',
    },
});
