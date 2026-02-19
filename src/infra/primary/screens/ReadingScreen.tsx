import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Modal } from 'react-native';
import { ArrowLeft, BookmarkPlus, Volume2, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { useTranslation } from 'react-i18next';
import { useSourates, useVersets, useAllVersets } from '@/shared/hooks';
import { Audio } from 'expo-av';
import type { Sourate, Verset } from '@/infra/secondary/quran';
import { VerseCard } from './components/VerseCard';

interface ReadingScreenProps {
    navigation: any;
}

type ReadingMode = 'verse' | 'page';

export const ReadingScreen = ({ navigation }: ReadingScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress, updateProgress } = useUserProgress();
    const [mode, setMode] = useState<ReadingMode>('verse');
    const [selectedSurah, setSelectedSurah] = useState(progress.currentSurah || 1);
    const [currentVerse, setCurrentVerse] = useState(progress.currentVerse || 1);
    const [showTranslation, setShowTranslation] = useState(true);
    const [sound, setSound] = useState<Audio.Sound>();
    const [playingVersetId, setPlayingVersetId] = useState<string | null>(null);
    const [showSelectorModal, setShowSelectorModal] = useState(false);
    const [tempSelectedSurah, setTempSelectedSurah] = useState(selectedSurah);
    const [tempSelectedVerse, setTempSelectedVerse] = useState(currentVerse);
    
    // Hook pour le mode "Par Verset" (une sourate à la fois)
    const { sourates, loading: loadingSourates } = useSourates();
    const { versets: versetsOneSurah, loading: loadingVersets, error } = useVersets(selectedSurah);
    
    // Hook pour le mode "Par Page" (tout le Coran)
    const { 
        versets: allVersets, 
        loading: loadingAllVersets, 
        loadingMore,
        hasMore,
        loadMore,
        sourates: souratesForAll 
    } = useAllVersets();
    
    const currentSourate = sourates.find(s => s.numero === selectedSurah);
    const tempSourate = sourates.find(s => s.numero === tempSelectedSurah);
    const versesPerPage = 5; // Nombre de versets par page en mode "Par Page"

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    const isSignedIn = !!user;
    const totalVerses = versetsOneSurah.length;

    const handlePlayAudio = async (versetId: string, audioUrl: string | null) => {
        if (!audioUrl) return;
        
        try {
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

    const handleMarkAsRead = () => {
        if (currentVerse < totalVerses) {
            // Passer au verset suivant dans la même sourate
            const nextVerse = currentVerse + 1;
            setCurrentVerse(nextVerse);
            updateProgress({
                currentSurah: selectedSurah,
                currentVerse: nextVerse,
                versesRead: Math.max(progress.versesRead, currentVerse),
            });
        } else if (selectedSurah < 114) {
            // Dernier verset de la sourate, passer à la sourate suivante
            const nextSurah = selectedSurah + 1;
            setSelectedSurah(nextSurah);
            setCurrentVerse(1);
            updateProgress({
                currentSurah: nextSurah,
                currentVerse: 1,
                versesRead: progress.versesRead + 1,
            });
        }
    };

    const handleSurahChange = (numero: number) => {
        setSelectedSurah(numero);
        setCurrentVerse(1);
    };

    const handleOpenSelector = () => {
        setTempSelectedSurah(selectedSurah);
        setTempSelectedVerse(currentVerse);
        setShowSelectorModal(true);
    };

    const handleConfirmSelection = () => {
        setSelectedSurah(tempSelectedSurah);
        setCurrentVerse(tempSelectedVerse);
        setShowSelectorModal(false);
        updateProgress({
            currentSurah: tempSelectedSurah,
            currentVerse: tempSelectedVerse,
            versesRead: progress.versesRead,
        });
    };

    const renderVerseMode = () => {
        if (loadingVersets) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
                </View>
            );
        }

        if (error || versetsOneSurah.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{t('reading.error_loading')}</Text>
                    <TouchableOpacity style={styles.retryButton}>
                        <Text style={styles.retryText}>{t('reading.retry')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const currentVerseData = versetsOneSurah[currentVerse - 1];

        return (
            <>
                {/* Progress Bar */}
                {isSignedIn && (
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>{t('reading.your_progress')}</Text>
                            <Text style={styles.progressValue}>{currentVerse}/{totalVerses}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${(currentVerse / totalVerses) * 100}%` }]} />
                        </View>
                    </View>
                )}

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
                    {showTranslation && currentVerseData?.traduction && (
                        <View style={styles.translationBox}>
                            <Text style={styles.translationText}>{currentVerseData.traduction}</Text>
                        </View>
                    )}
                </View>

                {/* Navigation */}
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        testID="previous-button"
                        style={[styles.navButton, currentVerse === 1 && styles.navButtonDisabled]}
                        onPress={() => setCurrentVerse(Math.max(1, currentVerse - 1))}
                        disabled={currentVerse === 1}
                    >
                        <ChevronLeft color={currentVerse === 1 ? '#9ca3af' : '#374151'} size={20} />
                        <Text style={[styles.navButtonText, currentVerse === 1 && styles.navButtonTextDisabled]}>
                            {t('common.previous')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="next-button"
                        style={[styles.navButton, currentVerse === totalVerses && styles.navButtonDisabled]}
                        onPress={() => setCurrentVerse(Math.min(totalVerses, currentVerse + 1))}
                        disabled={currentVerse === totalVerses}
                    >
                        <Text style={[styles.navButtonText, currentVerse === totalVerses && styles.navButtonTextDisabled]}>
                            {t('common.next')}
                        </Text>
                        <ChevronRight color={currentVerse === totalVerses ? '#9ca3af' : '#374151'} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Mark as Read Button */}
                {isSignedIn ? (
                    <TouchableOpacity 
                        testID="mark-as-read-button" 
                        style={[
                            styles.markReadButton,
                            (currentVerse === totalVerses && selectedSurah === 114) && styles.markReadButtonDisabled
                        ]} 
                        onPress={handleMarkAsRead}
                        disabled={currentVerse === totalVerses && selectedSurah === 114}
                    >
                        <Check color="#ffffff" size={20} />
                        <Text style={styles.markReadText}>
                            {currentVerse === totalVerses && selectedSurah < 114 
                                ? t('reading.next_surah')
                                : t('reading.mark_as_read')
                            }
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.signInPrompt}>
                        <Text style={styles.signInPromptText}>
                            {t('reading.signin_prompt')}
                        </Text>
                    </View>
                )}
            </>
        );
    };

    const renderPageMode = () => {
        if (loadingAllVersets) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
                    <Text style={styles.loadingSubText}>{t('reading.complete_reading')}...</Text>
                </View>
            );
        }

        if (allVersets.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{t('reading.error_loading')}</Text>
                </View>
            );
        }

        // Fonction pour obtenir le nom de la sourate d'un verset
        const getSourateName = (sourateNumero: number) => {
            const sourate = souratesForAll.find(s => s.numero === sourateNumero);
            return sourate ? `${sourate.numero}. ${sourate.nomArabe} - ${sourate.nomFrancais}` : `Sourate ${sourateNumero}`;
        };

        // Fonction pour savoir si c'est le premier verset d'une sourate
        const isFirstVerseOfSourate = (item: Verset, index: number) => {
            if (index === 0) return true;
            return item.sourateNumero !== allVersets[index - 1]?.sourateNumero;
        };

        const renderVerseItem = ({ item, index }: { item: Verset; index: number }) => {
            const isFirst = isFirstVerseOfSourate(item, index);
            const sourateName = isFirst ? getSourateName(item.sourateNumero) : undefined;
            
            return (
                <VerseCard
                    verset={item}
                    showTranslation={showTranslation}
                    playingVersetId={playingVersetId}
                    onPlayAudio={handlePlayAudio}
                    isFirstOfSourate={isFirst}
                    sourateName={sourateName}
                />
            );
        };

        const renderFooter = () => {
            if (!loadingMore) return null;
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color="#059669" />
                    <Text style={styles.footerLoaderText}>{t('reading.loading_more')}</Text>
                </View>
            );
        };

        return (
            <FlatList
                data={allVersets}
                keyExtractor={(item) => item.id}
                renderItem={renderVerseItem}
                contentContainerStyle={styles.pageListContent}
                onEndReached={() => {
                    if (hasMore && !loadingMore) {
                        loadMore();
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                removeClippedSubviews={true}
            />
        );
    };

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
                    <Text style={styles.title}>{t('reading.title')}</Text>
                    {mode === 'verse' ? (
                        <TouchableOpacity onPress={handleOpenSelector} style={styles.selectorButton}>
                            <Text style={styles.subtitle}>
                                {currentSourate 
                                    ? `${currentSourate.numero}:${currentVerse} - ${currentSourate.nomFrancais}`
                                    : t('reading.select_surah')
                                }
                            </Text>
                            <ChevronDown color="#6b7280" size={16} />
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.subtitle}>{t('reading.complete_reading')}</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.bookmarkButton}>
                    <BookmarkPlus color="#059669" size={20} />
                </TouchableOpacity>
            </View>

            {/* Modal de sélection Sourate/Verset */}
            <Modal
                visible={showSelectorModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSelectorModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('reading.select_passage')}</Text>
                            <TouchableOpacity onPress={() => setShowSelectorModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.selectorsRow}>
                            {/* Sélecteur de Sourate */}
                            <View style={styles.selectorColumn}>
                                <Text style={styles.selectorLabel}>{t('reading.surah')}</Text>
                                <ScrollView style={styles.selectorScroll} showsVerticalScrollIndicator={true}>
                                    {sourates.map((sourate) => (
                                        <TouchableOpacity
                                            key={sourate.numero}
                                            style={[
                                                styles.selectorItem,
                                                tempSelectedSurah === sourate.numero && styles.selectorItemActive
                                            ]}
                                            onPress={() => {
                                                setTempSelectedSurah(sourate.numero);
                                                setTempSelectedVerse(1);
                                            }}
                                        >
                                            <Text style={[
                                                styles.selectorItemNumber,
                                                tempSelectedSurah === sourate.numero && styles.selectorItemTextActive
                                            ]}>
                                                {sourate.numero}
                                            </Text>
                                            <View style={styles.selectorItemText}>
                                                <Text style={[
                                                    styles.selectorItemName,
                                                    tempSelectedSurah === sourate.numero && styles.selectorItemTextActive
                                                ]}>
                                                    {sourate.nomFrancais}
                                                </Text>
                                                <Text style={[
                                                    styles.selectorItemArabic,
                                                    tempSelectedSurah === sourate.numero && styles.selectorItemTextActive
                                                ]}>
                                                    {sourate.nomArabe}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Sélecteur de Verset */}
                            <View style={styles.selectorColumn}>
                                <Text style={styles.selectorLabel}>{t('reading.verse')}</Text>
                                <ScrollView style={styles.selectorScroll} showsVerticalScrollIndicator={true}>
                                    {tempSourate && Array.from({ length: tempSourate.nombreVersets }, (_, i) => i + 1).map((verseNum) => (
                                        <TouchableOpacity
                                            key={verseNum}
                                            style={[
                                                styles.selectorItem,
                                                tempSelectedVerse === verseNum && styles.selectorItemActive
                                            ]}
                                            onPress={() => setTempSelectedVerse(verseNum)}
                                        >
                                            <Text style={[
                                                styles.selectorItemVerseNumber,
                                                tempSelectedVerse === verseNum && styles.selectorItemTextActive
                                            ]}>
                                                {verseNum}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.modalConfirmButton}
                            onPress={handleConfirmSelection}
                        >
                            <Text style={styles.modalConfirmText}>{t('common.confirm')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, mode === 'verse' && styles.tabActive]}
                    onPress={() => setMode('verse')}
                >
                    <Text style={[styles.tabText, mode === 'verse' && styles.tabTextActive]}>
                        {t('reading.mode_by_verse')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, mode === 'page' && styles.tabActive]}
                    onPress={() => setMode('page')}
                >
                    <Text style={[styles.tabText, mode === 'page' && styles.tabTextActive]}>
                        {t('reading.mode_by_page')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Toggle traduction pour mode Page */}
            {mode === 'page' && (
                <View style={styles.translationToggleContainer}>
                    <Text style={styles.translationToggleLabel}>{t('reading.translation')}</Text>
                    <TouchableOpacity
                        style={[styles.smallToggleButton, showTranslation && styles.smallToggleButtonActive]}
                        onPress={() => setShowTranslation(!showTranslation)}
                    >
                        <Text style={[styles.smallToggleText, showTranslation && styles.smallToggleTextActive]}>
                            {showTranslation ? t('common.hide') : t('common.show')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Content */}
            {mode === 'verse' ? (
                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
                    {renderVerseMode()}
                </ScrollView>
            ) : (
                <View style={styles.pageContent}>
                    {renderPageMode()}
                </View>
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
        padding: 24,
    },
    pageContent: {
        flex: 1,
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
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bookmarkButton: {
        width: 40,
        height: 40,
        backgroundColor: '#d1fae5',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#059669',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#059669',
        fontWeight: '600',
    },
    translationToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    translationToggleLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    smallToggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#e5e7eb',
    },
    smallToggleButtonActive: {
        backgroundColor: '#059669',
    },
    smallToggleText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
    },
    smallToggleTextActive: {
        color: '#ffffff',
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
    loadingSubText: {
        marginTop: 4,
        fontSize: 14,
        color: '#9ca3af',
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#059669',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
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
    markReadButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    markReadText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    signInPrompt: {
        backgroundColor: '#fef3c7',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    signInPromptText: {
        fontSize: 14,
        color: '#92400e',
    },
    // Page mode styles
    pageListContent: {
        paddingTop: 8,
        paddingBottom: 16,
    },
    // Footer loader pour la pagination
    footerLoader: {
        padding: 20,
        alignItems: 'center',
    },
    footerLoaderText: {
        marginTop: 8,
        fontSize: 14,
        color: '#6b7280',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalClose: {
        fontSize: 24,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    selectorsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    selectorColumn: {
        flex: 1,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        textAlign: 'center',
    },
    selectorScroll: {
        maxHeight: 350,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: '#f9fafb',
    },
    selectorItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectorItemActive: {
        backgroundColor: '#d1fae5',
    },
    selectorItemNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        minWidth: 30,
    },
    selectorItemText: {
        flex: 1,
    },
    selectorItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    selectorItemArabic: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    selectorItemVerseNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        textAlign: 'center',
        width: '100%',
    },
    selectorItemTextActive: {
        color: '#059669',
    },
    modalConfirmButton: {
        backgroundColor: '#059669',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalConfirmText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
