import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Modal } from 'react-native';
import { ArrowLeft, BookmarkPlus, Bookmark, Volume2, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { useTranslation } from 'react-i18next';
import { useSourates, useVersets, useProgress, useBookmarks } from '@/shared/hooks';
import { Audio } from 'expo-av';
import type { Sourate, Verset } from '@/infra/secondary/quran';
import { VerseCard } from './components/VerseCard';
import { SourateCompletionModal } from './components/SourateCompletionModal';
import { SurahProgressBar } from './components/SurahProgressBar';
import { QuranProgressBar } from './components/QuranProgressBar';
import { quizService } from '@/infra/secondary/quran';
import { getSurahNameFr } from '@/shared/constants/surahNames';

interface ReadingScreenProps {
    navigation: any;
}

type ReadingMode = 'verse' | 'page' | 'mushaf';

export const ReadingScreen = ({ navigation }: ReadingScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress: localProgress, updateProgress } = useUserProgress();
    
    // Utiliser un ID anonyme si pas connecté pour permettre la sauvegarde locale
    const effectiveUserId = user?.id || 'anonymous';
    
    // 3 hooks de progression séparés pour chaque mode
    const { progress: verseProgress, loading: loadingVerse, saveProgress: saveVerseProgress } = useProgress(effectiveUserId, 'verse');
    const { progress: pageProgress, loading: loadingPage, saveProgress: savePageProgress } = useProgress(effectiveUserId, 'page');
    const { progress: mushafProgress, loading: loadingMushaf, saveProgress: saveMushafProgress } = useProgress(effectiveUserId, 'mushaf');
    
    const { isBookmarked, toggleBookmark } = useBookmarks(user?.id || null);
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
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedSourate, setCompletedSourate] = useState<{ numero: number; nom: string } | null>(null);
    const [tempSelectedSurah, setTempSelectedSurah] = useState(1);
    const [tempSelectedVerse, setTempSelectedVerse] = useState(1);
    const [isInitialized, setIsInitialized] = useState(false);
    const [lastLoadedMode, setLastLoadedMode] = useState<ReadingMode | null>(null);
    const [progressionsLoaded, setProgressionsLoaded] = useState({ verse: false, page: false, mushaf: false });
    
    // Refs SÉPARÉES pour chaque mode - AUCUNE DÉPENDANCE
    const verseSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pageSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const mushafSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    const verseVersetPositionsRef = useRef<Map<number, number>>(new Map());
    const pageVersetPositionsRef = useRef<Map<number, number>>(new Map());
    const mushafVersetPositionsRef = useRef<Map<number, number>>(new Map());
    
    const verseScrollViewRef = useRef<ScrollView>(null);
    const pageScrollViewRef = useRef<ScrollView>(null);
    const mushafScrollViewRef = useRef<ScrollView>(null);
    
    const verseLastSavedPositionRef = useRef({ sourate: 0, verset: 0 });
    const pageLastSavedPositionRef = useRef({ sourate: 0, verset: 0 });
    const mushafLastSavedPositionRef = useRef({ sourate: 0, verset: 0 });
    
    // Flag pour éviter le scroll automatique pendant qu'on scrolle manuellement
    const isAutoScrollingRef = useRef(false);
    const hasInitiallyScrolledRef = useRef({ verse: false, page: false, mushaf: false });
    
    // Charger les sourates (commun à tous les modes)
    const { sourates, loading: loadingSourates } = useSourates();
    
    // Charger les VERSETS SÉPARÉMENT pour chaque mode - 3 appels indépendants
    const { versets: verseVersets, loading: loadingVerseVersets, error: verseError } = useVersets(versePosition.sourate);
    const { versets: pageVersets, loading: loadingPageVersets, error: pageError } = useVersets(pagePosition.sourate);
    const { versets: mushafVersets, loading: loadingMushafVersets, error: mushafError } = useVersets(mushafPosition.sourate);
    
    // Variables utilisées selon le mode actif
    const versets = mode === 'verse' ? verseVersets : mode === 'page' ? pageVersets : mushafVersets;
    const loadingVersets = mode === 'verse' ? loadingVerseVersets : mode === 'page' ? loadingPageVersets : loadingMushafVersets;
    const error = mode === 'verse' ? verseError : mode === 'page' ? pageError : mushafError;
    
    const currentSourate = sourates.find(s => s.numero === selectedSurah);
    const tempSourate = sourates.find(s => s.numero === tempSelectedSurah);

    // Fonctions helper pour mettre à jour la position selon le mode actif
    const updatePosition = (sourate: number, verset: number) => {
        if (mode === 'verse') {
            setVersePosition({ sourate, verset });
        } else if (mode === 'page') {
            setPagePosition({ sourate, verset });
        } else {
            setMushafPosition({ sourate, verset });
        }
    };

    const updateSourate = (sourate: number) => {
        if (mode === 'verse') {
            setVersePosition(prev => ({ ...prev, sourate }));
        } else if (mode === 'page') {
            setPagePosition(prev => ({ ...prev, sourate }));
        } else {
            setMushafPosition(prev => ({ ...prev, sourate }));
        }
    };

    const updateVerset = (verset: number) => {
        if (mode === 'verse') {
            setVersePosition(prev => ({ ...prev, verset }));
        } else if (mode === 'page') {
            setPagePosition(prev => ({ ...prev, verset }));
        } else {
            setMushafPosition(prev => ({ ...prev, verset }));
        }
    };

    // Déterminer la progression actuelle selon le mode
    const currentProgress = mode === 'verse' ? verseProgress : mode === 'page' ? pageProgress : mushafProgress;
    const currentLoading = mode === 'verse' ? loadingVerse : mode === 'page' ? loadingPage : loadingMushaf;
    
    // Fonction stable pour sauvegarder selon le mode actuel
    const currentSaveProgress = useCallback(async (sourate: number, verset: number) => {
        if (mode === 'verse') {
            return saveVerseProgress(sourate, verset);
        } else if (mode === 'page') {
            return savePageProgress(sourate, verset);
        } else {
            return saveMushafProgress(sourate, verset);
        }
    }, [mode, saveVerseProgress, savePageProgress, saveMushafProgress]);

    // Charger la position sauvegardée pour le mode verse au démarrage (UNE SEULE FOIS)
    useEffect(() => {
        if (!loadingVerse && !progressionsLoaded.verse) {
            if (verseProgress) {
                setVersePosition({ sourate: verseProgress.sourateNumero, verset: verseProgress.versetNumero });
                setTempSelectedSurah(verseProgress.sourateNumero);
                setTempSelectedVerse(verseProgress.versetNumero);
            }
            setProgressionsLoaded(prev => ({ ...prev, verse: true }));
            setLastLoadedMode('verse');
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

    // Sauvegarder immédiatement quand le scroll s'arrête
    const handleScrollEnd = useCallback(() => {
        if (mode === 'verse') {
            return;
        }

        // Utiliser les refs spécifiques selon le mode
        const currentLastSavedRef = mode === 'page' ? pageLastSavedPositionRef : mushafLastSavedPositionRef;
        
        if (currentLastSavedRef.current.sourate === selectedSurah && 
            currentLastSavedRef.current.verset === currentVerse) {
            return;
        }

        currentSaveProgress(selectedSurah, currentVerse)
            .then(() => {
                currentLastSavedRef.current = { sourate: selectedSurah, verset: currentVerse };
            });
    }, [mode, selectedSurah, currentVerse, currentSaveProgress]);

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

    const totalVerses = versets.length;

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
            // Error playing audio
        }
    };

    // Navigation automatique avec sauvegarde
    const handleNextVerse = () => {
        if (currentVerse < totalVerses) {
            const nextVerse = currentVerse + 1;
            updateVerset(nextVerse);
            updateProgress({
                currentSurah: selectedSurah,
                currentVerse: nextVerse,
                versesRead: Math.max(localProgress.versesRead, nextVerse),
            });
            currentSaveProgress(selectedSurah, nextVerse);
        }
    };

    const handlePrevVerse = () => {
        if (currentVerse > 1) {
            const prevVerse = currentVerse - 1;
            updateVerset(prevVerse);
            updateProgress({
                currentSurah: selectedSurah,
                currentVerse: prevVerse,
                versesRead: localProgress.versesRead,
            });
            currentSaveProgress(selectedSurah, prevVerse);
        }
    };

    const handleMarkAsRead = async () => {
        if (currentVerse < totalVerses) {
            // Passer au verset suivant dans la même sourate
            const nextVerse = currentVerse + 1;
            updateVerset(nextVerse);
            updateProgress({
                currentSurah: selectedSurah,
                currentVerse: nextVerse,
                versesRead: Math.max(localProgress.versesRead, currentVerse),
            });
            // Sauvegarder immédiatement
            currentSaveProgress(selectedSurah, nextVerse);
        } else if (selectedSurah < 114) {
            // Dernier verset de la sourate, passer à la sourate suivante
            
            // Débloquer la sourate qu'on vient de finir pour le quiz
            if (user) {
                try {
                    await quizService.unlockSourate(user.id, selectedSurah);
                    
                    // Afficher le modal de félicitation seulement en mode verse
                    if (mode === 'verse') {
                        setCompletedSourate({
                            numero: selectedSurah,
                            nom: getSurahNameFr(selectedSurah),
                        });
                        setShowCompletionModal(true);
                    } else {
                        // En mode page ou mushaf, passer directement à la sourate suivante
                        moveToNextSourate();
                    }
                } catch (error) {
                    // En cas d'erreur, passer quand même à la sourate suivante
                    moveToNextSourate();
                }
            } else {
                moveToNextSourate();
            }
        }
    };

    const moveToNextSourate = () => {
        const nextSurah = selectedSurah + 1;
        updatePosition(nextSurah, 1);
        updateProgress({
            currentSurah: nextSurah,
            currentVerse: 1,
            versesRead: localProgress.versesRead + 1,
        });
        // Sauvegarder immédiatement
        currentSaveProgress(nextSurah, 1);
    };

    const handleStartQuiz = () => {
        setShowCompletionModal(false);
        if (completedSourate) {
            navigation.navigate('Quiz', {
                sourateNumero: completedSourate.numero,
                isNew: true,
            });
        }
    };

    const handleSkipQuiz = () => {
        setShowCompletionModal(false);
        moveToNextSourate();
    };

    const handleSurahChange = (numero: number) => {
        updatePosition(numero, 1);
        // Sauvegarder immédiatement sur le serveur
        if (user) {
            currentSaveProgress(numero, 1);
        }
    };

    const handleOpenSelector = () => {
        setTempSelectedSurah(selectedSurah);
        setTempSelectedVerse(currentVerse);
        setShowSelectorModal(true);
    };

    const handleConfirmSelection = () => {
        updatePosition(tempSelectedSurah, tempSelectedVerse);
        setShowSelectorModal(false);
        updateProgress({
            currentSurah: tempSelectedSurah,
            currentVerse: tempSelectedVerse,
            versesRead: localProgress.versesRead,
        });
        
        // Sauvegarder immédiatement sur le serveur
        if (user) {
            currentSaveProgress(tempSelectedSurah, tempSelectedVerse);
        }
    };

    // Navigation entre sourates (pour modes page et mushaf)
    const handleNextSourate = () => {
        if (selectedSurah < 114) {
            const nextSourate = selectedSurah + 1;
            updateSourate(nextSourate);
            updateVerset(1); // Recommencer au verset 1
            currentSaveProgress(nextSourate, 1);
        }
    };

    const handlePrevSourate = () => {
        if (selectedSurah > 1) {
            const prevSourate = selectedSurah - 1;
            updateSourate(prevSourate);  
            updateVerset(1); // Commencer au verset 1
            currentSaveProgress(prevSourate, 1);
        }
    };

    // Gestion de la sauvegarde automatique au scroll
    const handleVersetLayout = useCallback((versetNumero: number, layout: { y: number }) => {
        // Utiliser la Map spécifique au mode actif
        if (mode === 'page') {
            pageVersetPositionsRef.current.set(versetNumero, layout.y);
        } else if (mode === 'mushaf') {
            mushafVersetPositionsRef.current.set(versetNumero, layout.y);
        }
    }, [mode]);

    const handleScroll = useCallback((event: any) => {
        // Ne rien faire en mode verse (il utilise la navigation par boutons)
        if (mode === 'verse') return;

        // Ne rien faire si on est en train de scroller automatiquement
        if (isAutoScrollingRef.current) return;

        const scrollY = event.nativeEvent.contentOffset.y;
        
        // Utiliser la bonne Map selon le mode actif
        const currentVersetPositions = mode === 'page' ? pageVersetPositionsRef.current : mushafVersetPositionsRef.current;
        
        // Trouver le verset le plus proche de la position de scroll
        let closestVerset = 1;
        let closestDistance = Infinity;
        
        currentVersetPositions.forEach((y, versetNum) => {
            const distance = Math.abs(scrollY - y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestVerset = versetNum;
            }
        });
        
        // Mettre à jour la position pour le mode actif
        if (mode === 'page') {
            setPagePosition(prev => ({ ...prev, verset: closestVerset }));
        } else if (mode === 'mushaf') {
            setMushafPosition(prev => ({ ...prev, verset: closestVerset }));
        }
    }, [mode]);

    // Réinitialiser les positions des versets quand on change de sourate OU de mode
    useEffect(() => {
        if (mode === 'page') {
            pageVersetPositionsRef.current.clear();
        } else if (mode === 'mushaf') {
            mushafVersetPositionsRef.current.clear();
        }
    }, [selectedSurah, mode]);

    // Réinitialiser le flag de scroll initial SEULEMENT quand on change de sourate (pas de mode)
    useEffect(() => {
        const modeKey = mode as keyof typeof hasInitiallyScrolledRef.current;
        hasInitiallyScrolledRef.current[modeKey] = false;
    }, [selectedSurah]);

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
                            handleVersetLayout(verset.versetNumero, { y: event.nativeEvent.layout.y });
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
                            handleVersetLayout(verset.versetNumero, { y: event.nativeEvent.layout.y });
                        }}
                    >
                        <View style={styles.mushafVerse}>
                            <Text style={styles.mushafNumber}>{verset.versetNumero}</Text>
                            <Text style={styles.mushafText}>{verset.texteArabe}</Text>
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

            {/* Modal de félicitation après sourate */}
            {completedSourate && (
                <SourateCompletionModal
                    visible={showCompletionModal}
                    sourateName={completedSourate.nom}
                    sourateNumber={completedSourate.numero}
                    nextSourateName={completedSourate.numero < 114 ? getSurahNameFr(completedSourate.numero + 1) : undefined}
                    onStartQuiz={handleStartQuiz}
                    onSkip={handleSkipQuiz}
                    onClose={() => setShowCompletionModal(false)}
                />
            )}

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
    visibleTab: {
        flex: 1,
    },
    hiddenTab: {
        display: 'none', // Cache complètement l'onglet mais le garde monté
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
    bookmarkButtonActive: {
        backgroundColor: '#059669',
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
    markReadButtonCompleted: {
        backgroundColor: '#6b7280',
        opacity: 0.7,
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
    // Mushaf mode styles
    mushafListContent: {
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 8,
    },
    mushafVerseContainer: {
        marginBottom: 8,
    },
    mushafSourateHeader: {
        alignItems: 'center',
        marginVertical: 24,
        paddingHorizontal: 16,
    },
    mushafSourateName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#059669',
        textAlign: 'center',
        marginBottom: 12,
    },
    mushafDivider: {
        width: '60%',
        height: 2,
        backgroundColor: '#d1fae5',
        borderRadius: 1,
    },
    mushafVerse: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    mushafText: {
        fontSize: 26,
        lineHeight: 50,
        textAlign: 'right',
        color: '#1f2937',
        writingDirection: 'rtl',
    },
    mushafNumber: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 28,
        height: 28,
        backgroundColor: '#d1fae5',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
        lineHeight: 28,
    },
    jumpingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    jumpingCard: {
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    jumpingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    // Nouveaux styles pour les modes simplifiés
    pageScrollContent: {
        flex: 1,
    },
    mushafScrollContent: {
        flex: 1,
    },
    sourateHeader: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#ffffff',
        borderBottomWidth: 3,
        borderBottomColor: '#059669',
        marginBottom: 16,
    },
    sourateHeaderNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#059669',
    },
    sourateHeaderName: {
        fontSize: 32,
        color: '#1f2937',
        marginTop: 8,
        textAlign: 'center',
    },
    sourateHeaderTranslation: {
        fontSize: 20,
        color: '#6b7280',
        marginTop: 4,
    },
    sourateNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        padding: 16,
        paddingBottom: 32,
    },
    sourateNavButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 2,
        borderColor: '#059669',
    },
    sourateNavButtonDisabled: {
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    sourateNavButtonContent: {
        flex: 1,
    },
    sourateNavButtonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },
    sourateNavButtonName: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    sourateNavButtonTextDisabled: {
        color: '#9ca3af',
    },
});
