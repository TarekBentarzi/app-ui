import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { useTranslation } from 'react-i18next';
import { useSourates, useVersets, useProgress } from '@/shared/hooks';
import { Audio } from 'expo-av';
import { VerseCard } from '../components/VerseCard';
import { SurahProgressBar } from '../components/SurahProgressBar';
import { QuranProgressBar } from '../components/QuranProgressBar';
import { FontSizeControls } from '../components/FontSizeControls';
import { quizService } from '@/infra/secondary/quran';
import { getSurahNameFr } from '@/shared/constants/surahNames';
import { styles } from './ReadingScreen.styles';
import { useReadingScreenUtils } from './useReadingScreenUtils';
import { useFontSize } from '@/shared/contexts/FontSizeContext';

interface ReadingScreenProps {
    navigation: any;
}

type ReadingMode = 'verse' | 'page' | 'mushaf';

export const ReadingScreen = ({ navigation }: ReadingScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress: localProgress, updateProgress } = useUserProgress();
    const { arabicFontSize, translationFontSize } = useFontSize();
    
    // Utiliser un ID anonyme si pas connecté pour permettre la sauvegarde locale
    const effectiveUserId = user?.id || 'anonymous';
    
    // 3 hooks de progression séparés pour chaque mode
    const { progress: verseProgress, loading: loadingVerse, saveProgress: saveVerseProgress } = useProgress(effectiveUserId, 'verse');
    const { progress: pageProgress, loading: loadingPage, saveProgress: savePageProgress } = useProgress(effectiveUserId, 'page');
    const { progress: mushafProgress, loading: loadingMushaf, saveProgress: saveMushafProgress } = useProgress(effectiveUserId, 'mushaf');
    
    const isSignedIn = !!user;
    
    const [mode, setMode] = useState<ReadingMode>('verse');
    
    // États séparés pour chaque mode
    const [versePosition, setVersePosition] = useState({ sourate: 1, verset: 1 });
    const [pagePosition, setPagePosition] = useState({ sourate: 1, verset: 1 });
    const [mushafPosition, setMushafPosition] = useState({ sourate: 1, verset: 1 });
    
    // Position actuelle selon le mode
    const selectedSurah = mode === 'verse' ? versePosition.sourate : mode === 'page' ? pagePosition.sourate : mushafPosition.sourate;
    const currentVerse = mode === 'verse' ? versePosition.verset : mode === 'page' ? pagePosition.verset : mushafPosition.verset;
    
    const [showTranslation, setShowTranslation] = useState(true);
    const [sound, setSound] = useState<Audio.Sound>();
    const [playingVersetId, setPlayingVersetId] = useState<string | null>(null);
    const [showSelectorModal, setShowSelectorModal] = useState(false);
    const [tempSelectedSurah, setTempSelectedSurah] = useState(1);
    const [tempSelectedVerse, setTempSelectedVerse] = useState(1);
    const [isInitialized, setIsInitialized] = useState(false);
    const [progressionsLoaded, setProgressionsLoaded] = useState({ verse: false, page: false, mushaf: false });
    
    // Refs SÉPARÉES pour chaque mode - AUCUNE DÉPENDANCE
    const verseSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pageSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const mushafSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    const pageVersetPositionsRef = useRef<Map<number, number>>(new Map());
    const mushafVersetPositionsRef = useRef<Map<number, number>>(new Map());
    
    const pageScrollViewRef = useRef<ScrollView>(null);
    const mushafScrollViewRef = useRef<ScrollView>(null);
    
    const verseLastSavedPositionRef = useRef({ sourate: 0, verset: 0 });
    const pageLastSavedPositionRef = useRef({ sourate: 0, verset: 0 });
    const mushafLastSavedPositionRef = useRef({ sourate: 0, verset: 0 });
    
    // Refs pour le modal de sélection
    const surahSelectorScrollRef = useRef<ScrollView>(null);
    const verseSelectorScrollRef = useRef<ScrollView>(null);
    
    // Flag pour éviter le scroll automatique pendant qu'on scrolle manuellement
    const isAutoScrollingRef = useRef(false);
    const hasInitiallyScrolledRef = useRef({ verse: false, page: false, mushaf: false });
    
    // Charger les sourates (commun à tous les modes)
    const { sourates, loading: loadingSourates } = useSourates();
    
    // Charger les VERSETS SÉPARÉMENT pour chaque mode - 3 appels indépendants
    // IMPORTANT: Utiliser 0 tant que la progression n'est pas chargée pour éviter de charger la mauvaise sourate
    const verseSourateToLoad = progressionsLoaded.verse ? versePosition.sourate : 0;
    const pageSourateToLoad = progressionsLoaded.page ? pagePosition.sourate : 0;
    const mushafSourateToLoad = progressionsLoaded.mushaf ? mushafPosition.sourate : 0;
    
    const { versets: verseVersets, loading:loadingVerseVersets, error: verseError } = useVersets(verseSourateToLoad);
    const { versets: pageVersets, loading: loadingPageVersets, error: pageError } = useVersets(pageSourateToLoad);
    const { versets: mushafVersets, loading: loadingMushafVersets, error: mushafError } = useVersets(mushafSourateToLoad);
    
    // Variables utilisées selon le mode actif
    const versets = mode === 'verse' ? verseVersets : mode === 'page' ? pageVersets : mushafVersets;
    const error = mode === 'verse' ? verseError : mode === 'page' ? pageError : mushafError;
    
    const currentSourate = sourates.find(s => s.numero === selectedSurah);
    const tempSourate = sourates.find(s => s.numero === tempSelectedSurah);
    const totalVerses = versets.length;

    // Utiliser le hook pour toutes les fonctions utilitaires
    const {
        updatePosition,
        updateSourate,
        updateVerset,
        currentSaveProgress,
        handleScrollEnd,
        handlePlayAudio,
        handleNextVerse,
        handlePrevVerse,
        handleMarkAsRead,
        moveToNextSourate,
        handleSurahChange,
        handleOpenSelector,
        handleConfirmSelection,
        handleNextSourate,
        handlePrevSourate,
        handleVersetLayout,
        handleScroll,
    } = useReadingScreenUtils({
        mode,
        selectedSurah,
        currentVerse,
        totalVerses: versets.length,
        user,
        localProgress,
        versePosition,
        pagePosition,
        mushafPosition,
        setVersePosition,
        setPagePosition,
        setMushafPosition,
        saveVerseProgress,
        savePageProgress,
        saveMushafProgress,
        updateProgress,
        sound,
        setSound,
        playingVersetId,
        setPlayingVersetId,
        setTempSelectedSurah,
        setTempSelectedVerse,
        setShowSelectorModal,
        tempSelectedSurah,
        tempSelectedVerse,
        pageVersetPositionsRef,
        mushafVersetPositionsRef,
        pageScrollViewRef,
        mushafScrollViewRef,
        pageLastSavedPositionRef,
        mushafLastSavedPositionRef,
        verseLastSavedPositionRef,
        isAutoScrollingRef,
        hasInitiallyScrolledRef,
    });

    // Charger la position sauvegardée pour le mode verse au démarrage (UNE SEULE FOIS)
    useEffect(() => {
        if (!loadingVerse && !progressionsLoaded.verse) {
            if (verseProgress) {
                setVersePosition({ sourate: verseProgress.sourateNumero, verset: verseProgress.versetNumero });
                setTempSelectedSurah(verseProgress.sourateNumero);
                setTempSelectedVerse(verseProgress.versetNumero);
            }
            setProgressionsLoaded(prev => ({ ...prev, verse: true }));
        }
    }, [loadingVerse, verseProgress, progressionsLoaded.verse]);

    // Charger les progressions des autres modes (UNE SEULE FOIS)
    useEffect(() => {
        if (!loadingPage && !progressionsLoaded.page) {
            if (pageProgress) {
                setPagePosition({ sourate: pageProgress.sourateNumero, verset: pageProgress.versetNumero });
            }
            setProgressionsLoaded(prev => ({ ...prev, page: true }));
        }
    }, [loadingPage, pageProgress, progressionsLoaded.page]);

    useEffect(() => {
        if (!loadingMushaf && !progressionsLoaded.mushaf) {
            if (mushafProgress) {
                setMushafPosition({ sourate: mushafProgress.sourateNumero, verset: mushafProgress.versetNumero });
            }
            setProgressionsLoaded(prev => ({ ...prev, mushaf: true }));
        }
    }, [loadingMushaf, mushafProgress, progressionsLoaded.mushaf]);

    // Marquer comme initialisé SEULEMENT quand TOUS les modes sont chargés
    useEffect(() => {
        if (progressionsLoaded.verse && progressionsLoaded.page && progressionsLoaded.mushaf && !isInitialized) {
            setIsInitialized(true);
        }
    }, [progressionsLoaded.verse, progressionsLoaded.page, progressionsLoaded.mushaf, isInitialized]);

    // Sauvegarder automatiquement avec un petit debounce (backup)
    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        // Utiliser les refs spécifiques selon le mode
        const currentSaveTimer = mode === 'verse' ? verseSaveTimerRef : mode === 'page' ? pageSaveTimerRef : mushafSaveTimerRef;
        const currentLastSavedRef = mode === 'verse' ? verseLastSavedPositionRef : mode === 'page' ? pageLastSavedPositionRef : mushafLastSavedPositionRef;

        if (currentSaveTimer.current) {
            clearTimeout(currentSaveTimer.current);
        }

        currentSaveTimer.current = setTimeout(() => {
            if (currentLastSavedRef.current.sourate === selectedSurah && 
                currentLastSavedRef.current.verset === currentVerse) {
                return;
            }

            currentSaveProgress(selectedSurah, currentVerse)
                .then(() => {
                    currentLastSavedRef.current = { sourate: selectedSurah, verset: currentVerse };
                });
        }, 200);

        return () => {
            if (currentSaveTimer.current) {
                clearTimeout(currentSaveTimer.current);
            }
        };
    }, [selectedSurah, currentVerse, isInitialized, currentSaveProgress, mode]);

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    // Auto-scroll vers les éléments sélectionnés quand le modal s'ouvre
    useEffect(() => {
        if (showSelectorModal) {
            // Utiliser setTimeout pour laisser le modal se rendre d'abord
            setTimeout(() => {
                // Scroll vers la sourate sélectionnée (environ 60px par item)
                if (surahSelectorScrollRef.current && tempSelectedSurah > 1) {
                    const estimatedY = (tempSelectedSurah - 1) * 60;
                    surahSelectorScrollRef.current.scrollTo({ y: estimatedY, animated: true });
                }
                
                // Scroll vers le verset sélectionné (environ 50px par item)
                if (verseSelectorScrollRef.current && tempSelectedVerse > 1) {
                    const estimatedY = (tempSelectedVerse - 1) * 50;
                    verseSelectorScrollRef.current.scrollTo({ y: estimatedY, animated: true });
                }
            }, 100);
        }
    }, [showSelectorModal, tempSelectedSurah, tempSelectedVerse]);

    // Réinitialiser les positions des versets quand on change de sourate OU de mode
    useEffect(() => {
        if (mode === 'page') {
            pageVersetPositionsRef.current.clear();
        } else if (mode === 'mushaf') {
            mushafVersetPositionsRef.current.clear();
        }
    }, [selectedSurah, mode]);

    // Réinitialiser le flag de scroll initial quand on change de sourate
    // Note: Le flag est aussi réinitialisé dans handleConfirmSelection pour permettre
    // la navigation vers un nouveau verset dans la même sourate
    useEffect(() => {
        const modeKey = mode as keyof typeof hasInitiallyScrolledRef.current;
        hasInitiallyScrolledRef.current[modeKey] = false;
    }, [selectedSurah, mode]);

    // Scroller vers la position sauvegardée UNE SEULE FOIS au chargement initial pour chaque mode
    useEffect(() => {
        if (mode === 'verse') return; // Mode verse n'utilise pas de scroll continu
        
        // Si on a déjà scrollé pour ce mode, ne rien faire
        const modeKey = mode as keyof typeof hasInitiallyScrolledRef.current;
        if (hasInitiallyScrolledRef.current[modeKey]) return;

        const timer = setTimeout(() => {
            // Utiliser les refs spécifiques selon le mode
            const currentScrollView = mode === 'page' ? pageScrollViewRef : mushafScrollViewRef;
            const currentVersetPositions = mode === 'page' ? pageVersetPositionsRef : mushafVersetPositionsRef;
            
            if (currentScrollView.current && currentVerse > 1 && currentVersetPositions.current.size > 0) {
                // Bloquer handleScroll pendant le scroll automatique
                isAutoScrollingRef.current = true;
                
                // Chercher la position exacte du verset dans la map
                const targetY = currentVersetPositions.current.get(currentVerse);
                
                if (targetY !== undefined) {
                    // Utiliser la position réelle du verset
                    currentScrollView.current.scrollTo({ y: targetY, animated: false });
                } else {
                    // Fallback: estimation si la position n'est pas encore calculée
                    const estimatedY = (currentVerse - 1) * 200;
                    currentScrollView.current.scrollTo({ y: estimatedY, animated: false });
                }
                
                // Marquer qu'on a scrollé pour ce mode
                hasInitiallyScrolledRef.current[modeKey] = true;
                
                // Réactiver handleScroll après un délai
                setTimeout(() => {
                    isAutoScrollingRef.current = false;
                }, 500);
            }
        }, 300); // Délai plus long pour laisser le temps aux versets de se positionner

        return () => clearTimeout(timer);
    }, [mode, currentVerse, pageVersetPositionsRef.current.size, mushafVersetPositionsRef.current.size]);

    const renderVerseMode = () => {
        if (loadingVerseVersets) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
                </View>
            );
        }

        if (verseError || verseVersets.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{t('reading.error_loading')}</Text>
                    <TouchableOpacity style={styles.retryButton}>
                        <Text style={styles.retryText}>{t('reading.retry')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const currentVerseData = verseVersets[currentVerse - 1];

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
                    <Text style={[styles.arabicText, { fontSize: arabicFontSize }]}>{currentVerseData?.texteArabe}</Text>
                    
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
                            <Text style={[styles.translationText, { fontSize: translationFontSize }]}>{currentVerseData.traduction}</Text>
                        </View>
                    )}
                </View>

                {/* Navigation */}
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        testID="previous-button"
                        style={[styles.navButton, currentVerse === 1 && styles.navButtonDisabled]}
                        onPress={handlePrevVerse}
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
                        onPress={handleNextVerse}
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
                            (currentVerse === totalVerses && selectedSurah === 114) && styles.markReadButtonCompleted
                        ]} 
                        onPress={handleMarkAsRead}
                        disabled={currentVerse === totalVerses && selectedSurah === 114}
                    >
                        <Check color="#ffffff" size={20} />
                        <Text style={styles.markReadText}>
                            {currentVerse === totalVerses && selectedSurah === 114
                                ? t('reading.completed')
                                : currentVerse === totalVerses && selectedSurah < 114 
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
        if (loadingPageVersets) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
                </View>
            );
        }

        if (pageError || pageVersets.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{t('reading.error_loading')}</Text>
                </View>
            );
        }

        return (
            <ScrollView
                key="page-scrollview"
                ref={pageScrollViewRef}
                style={styles.pageScrollContent} 
                contentContainerStyle={styles.pageListContent}
                onScroll={handleScroll}
                scrollEventThrottle={400}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollEnd={handleScrollEnd}
            >
                {/* Header de la sourate */}
                {currentSourate && (
                    <View style={styles.sourateHeader}>
                        <Text style={styles.sourateHeaderNumber}>{currentSourate.numero}</Text>
                        <Text style={styles.sourateHeaderName}>{currentSourate.nomArabe}</Text>
                        <Text style={styles.sourateHeaderTranslation}>{getSurahNameFr(currentSourate.numero)}</Text>
                    </View>
                )}

                {/* Tous les versets de la sourate */}
                {pageVersets.map((verset) => (
                    <View 
                        key={verset.id}
                        onLayout={(event) => {
                            handleVersetLayout(verset.versetNumero, { y: event.nativeEvent.layout.y }, 'page');
                        }}
                    >
                        <VerseCard
                            verset={verset}
                            showTranslation={showTranslation}
                            playingVersetId={playingVersetId}
                            onPlayAudio={handlePlayAudio}
                            isFirstOfSourate={false}
                        />
                    </View>
                ))}

                {/* Navigation entre sourates */}
                <View style={styles.sourateNavigation}>
                    <TouchableOpacity
                        style={[
                            styles.sourateNavButton,
                            selectedSurah === 1 && styles.sourateNavButtonDisabled
                        ]}
                        onPress={handlePrevSourate}
                        disabled={selectedSurah === 1}
                    >
                        <ChevronLeft color={selectedSurah === 1 ? '#9ca3af' : '#059669'} size={20} />
                        <View style={styles.sourateNavButtonContent}>
                            <Text style={[
                                styles.sourateNavButtonLabel,
                                selectedSurah === 1 && styles.sourateNavButtonTextDisabled
                            ]}>
                                Précédente
                            </Text>
                            {selectedSurah > 1 && sourates.find(s => s.numero === selectedSurah - 1) && (
                                <Text style={styles.sourateNavButtonName}>
                                    {getSurahNameFr(selectedSurah - 1)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sourateNavButton,
                            selectedSurah === 114 && styles.sourateNavButtonDisabled
                        ]}
                        onPress={handleNextSourate}
                        disabled={selectedSurah === 114}
                    >
                        <View style={styles.sourateNavButtonContent}>
                            <Text style={[
                                styles.sourateNavButtonLabel,
                                selectedSurah === 114 && styles.sourateNavButtonTextDisabled
                            ]}>
                                Suivante
                            </Text>
                            {selectedSurah < 114 && sourates.find(s => s.numero === selectedSurah + 1) && (
                                <Text style={styles.sourateNavButtonName}>
                                    {getSurahNameFr(selectedSurah + 1)}
                                </Text>
                            )}
                        </View>
                        <ChevronRight color={selectedSurah === 114 ? '#9ca3af' : '#059669'} size={20} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    };

    const renderMushafMode = () => {
        if (loadingMushafVersets) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
                </View>
            );
        }

        if (mushafError || mushafVersets.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{t('reading.error_loading')}</Text>
                </View>
            );
        }

        return (
            <ScrollView
                key="mushaf-scrollview"
                ref={mushafScrollViewRef}
                style={styles.mushafScrollContent} 
                contentContainerStyle={styles.mushafListContent}
                onScroll={handleScroll}
                scrollEventThrottle={400}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollEnd={handleScrollEnd}
            >
                {/* Header de la sourate */}
                {currentSourate && (
                    <View style={styles.mushafSourateHeader}>
                        <Text style={styles.mushafSourateName}>
                            {currentSourate.numero}. {getSurahNameFr(currentSourate.numero)} ({currentSourate.nomArabe})
                        </Text>
                        <View style={styles.mushafDivider} />
                    </View>
                )}

                {/* Tous les versets en arabe seulement */}
                {mushafVersets.map((verset) => (
                    <View 
                        key={verset.id} 
                        style={styles.mushafVerseContainer}
                        onLayout={(event) => {
                            handleVersetLayout(verset.versetNumero, { y: event.nativeEvent.layout.y }, 'mushaf');
                        }}
                    >
                        <View style={styles.mushafVerse}>
                            <Text style={styles.mushafNumber}>{verset.versetNumero}</Text>
                            <Text style={[styles.mushafText, { fontSize: arabicFontSize }]}>{verset.texteArabe}</Text>
                            {verset.audioUrl && (
                                <TouchableOpacity
                                    style={[
                                        styles.mushafAudioButton,
                                        playingVersetId === verset.id && styles.mushafAudioButtonPlaying,
                                    ]}
                                    onPress={() => handlePlayAudio(verset.id, verset.audioUrl)}
                                >
                                    <Volume2 
                                        color={playingVersetId === verset.id ? "#ffffff" : "#059669"} 
                                        size={16} 
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {/* Navigation entre sourates */}
                <View style={styles.sourateNavigation}>
                    <TouchableOpacity
                        style={[
                            styles.sourateNavButton,
                            selectedSurah === 1 && styles.sourateNavButtonDisabled
                        ]}
                        onPress={handlePrevSourate}
                        disabled={selectedSurah === 1}
                    >
                        <ChevronLeft color={selectedSurah === 1 ? '#9ca3af' : '#059669'} size={20} />
                        <View style={styles.sourateNavButtonContent}>
                            <Text style={[
                                styles.sourateNavButtonLabel,
                                selectedSurah === 1 && styles.sourateNavButtonTextDisabled
                            ]}>
                                Précédente
                            </Text>
                            {selectedSurah > 1 && sourates.find(s => s.numero === selectedSurah - 1) && (
                                <Text style={styles.sourateNavButtonName}>
                                    {getSurahNameFr(selectedSurah - 1)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sourateNavButton,
                            selectedSurah === 114 && styles.sourateNavButtonDisabled
                        ]}
                        onPress={handleNextSourate}
                        disabled={selectedSurah === 114}
                    >
                        <View style={styles.sourateNavButtonContent}>
                            <Text style={[
                                styles.sourateNavButtonLabel,
                                selectedSurah === 114 && styles.sourateNavButtonTextDisabled
                            ]}>
                                Suivante
                            </Text>
                            {selectedSurah < 114 && sourates.find(s => s.numero === selectedSurah + 1) && (
                                <Text style={styles.sourateNavButtonName}>
                                    {getSurahNameFr(selectedSurah + 1)}
                                </Text>
                            )}
                        </View>
                        <ChevronRight color={selectedSurah === 114 ? '#9ca3af' : '#059669'} size={20} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
                    <TouchableOpacity onPress={handleOpenSelector} style={styles.selectorButton}>
                        <Text style={styles.subtitle}>
                            {mode === 'verse' ? (
                                currentSourate 
                                    ? `${currentSourate.numero}:${currentVerse} - ${getSurahNameFr(currentSourate.numero)} (${currentSourate.nomArabe})`
                                    : t('reading.select_surah')
                            ) : (
                                currentSourate 
                                    ? `${currentSourate.numero} - ${getSurahNameFr(currentSourate.numero)} (${currentSourate.nomArabe})`
                                    : t('reading.select_surah')
                            )}
                        </Text>
                        <ChevronDown color="#6b7280" size={16} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Progression globale du Coran */}
            <QuranProgressBar 
                currentSurah={selectedSurah}
                totalSurahs={114}
                mode={mode}
            />

            {/* Progress Bar de la sourate */}
            {currentSourate && (
                <SurahProgressBar
                    surahName={getSurahNameFr(currentSourate.numero)}
                    surahNumber={currentSourate.numero}
                    currentVerse={currentVerse}
                    totalVerses={mode === 'verse' ? totalVerses : currentSourate.nombreVersets}
                />
            )}

            {/* Contrôles de taille de police */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                <FontSizeControls compact={true} />
            </View>

            {/* Modal de sélection Sourate/Verset */}
            <Modal
                visible={showSelectorModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSelectorModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSelectorModal(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('reading.select_passage')}</Text>
                            <TouchableOpacity onPress={() => setShowSelectorModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalScrollView}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.selectorsRow}>
                            {/* Sélecteur de Sourate */}
                            <View style={styles.selectorColumn}>
                                <Text style={styles.selectorLabel}>{t('reading.surah')}</Text>
                                <ScrollView 
                                    ref={surahSelectorScrollRef}
                                    style={styles.selectorScroll} 
                                    showsVerticalScrollIndicator={true}
                                >
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
                                                    {getSurahNameFr(sourate.numero)}
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
                                <ScrollView 
                                    ref={verseSelectorScrollRef}
                                    style={styles.selectorScroll} 
                                    showsVerticalScrollIndicator={true}
                                >
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
                        </ScrollView>

                        <TouchableOpacity 
                            style={styles.modalConfirmButton}
                            onPress={handleConfirmSelection}
                        >
                            <Text style={styles.modalConfirmText}>{t('common.confirm')}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
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
                <TouchableOpacity
                    style={[styles.tab, mode === 'mushaf' && styles.tabActive]}
                    onPress={() => setMode('mushaf')}
                >
                    <Text style={[styles.tabText, mode === 'mushaf' && styles.tabTextActive]}>
                        {t('reading.mode_mushaf')}
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

            {/* Content - Tous les onglets restent montés pour avoir des scrollbars indépendantes */}
            <View style={styles.pageContent}>
                {/* Mode Verse */}
                <View style={mode !== 'verse' ? styles.hiddenTab : styles.visibleTab}>
                    <ScrollView 
                        key="verse-scrollview"
                        style={styles.scrollContent} 
                        contentContainerStyle={styles.content}
                    >
                        {renderVerseMode()}
                    </ScrollView>
                </View>

                {/* Mode Page */}
                <View style={mode !== 'page' ? styles.hiddenTab : styles.visibleTab}>
                    {renderPageMode()}
                </View>

                {/* Mode Mushaf */}
                <View style={mode !== 'mushaf' ? styles.hiddenTab : styles.visibleTab}>
                    {renderMushafMode()}
                </View>
            </View>
        </View>
    );
};
