import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Modal } from 'react-native';
import { ArrowLeft, BookmarkPlus, Bookmark, Volume2, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { useTranslation } from 'react-i18next';
import { useSourates, useVersets, useAllVersets, useProgress, useBookmarks } from '@/shared/hooks';
import { Audio } from 'expo-av';
import type { Sourate, Verset } from '@/infra/secondary/quran';
import { VerseCard } from './components/VerseCard';
import { SourateCompletionModal } from './components/SourateCompletionModal';
import { SurahProgressBar } from './components/SurahProgressBar';
import { quizService } from '@/infra/secondary/quran';

interface ReadingScreenProps {
    navigation: any;
}

type ReadingMode = 'verse' | 'page' | 'mushaf';

export const ReadingScreen = ({ navigation }: ReadingScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { progress: localProgress, updateProgress } = useUserProgress();
    
    // 3 hooks de progression séparés pour chaque mode
    const { progress: verseProgress, loading: loadingVerse, saveProgress: saveVerseProgress } = useProgress(user?.id || null, 'verse');
    const { progress: pageProgress, loading: loadingPage, saveProgress: savePageProgress } = useProgress(user?.id || null, 'page');
    const { progress: mushafProgress, loading: loadingMushaf, saveProgress: saveMushafProgress } = useProgress(user?.id || null, 'mushaf');
    
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
    const [hasScrolledInitially, setHasScrolledInitially] = useState(false);
    const [lastLoadedMode, setLastLoadedMode] = useState<ReadingMode | null>(null);
    const [progressionsLoaded, setProgressionsLoaded] = useState({ verse: false, page: false, mushaf: false });
    const [isJumpingToSourate, setIsJumpingToSourate] = useState(false);
    const [isCurrentVerseBookmarked, setIsCurrentVerseBookmarked] = useState(false);
    
    // Références pour les FlatLists (page et mushaf)
    const flatListRef = useRef<FlatList>(null);
    const viewableItemsRef = useRef<string[]>([]);
    const isRepositioningRef = useRef(false);
    const hasScrolledInitiallyRef = useRef(false);
    const modeRef = useRef<ReadingMode>(mode);
    const userRef = useRef(user);
    
    // Timer de sauvegarde automatique (debounce)
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    
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

    // Synchroniser les refs avec les states
    useEffect(() => {
        hasScrolledInitiallyRef.current = hasScrolledInitially;
    }, [hasScrolledInitially]);

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Vérifier si le verset actuel est bookmarked
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (user && (mode === 'page' || mode === 'mushaf')) {
                const bookmarked = await isBookmarked(selectedSurah, currentVerse);
                setIsCurrentVerseBookmarked(bookmarked);
            } else {
                setIsCurrentVerseBookmarked(false);
            }
        };
        
        checkBookmarkStatus();
    }, [user, mode, selectedSurah, currentVerse, isBookmarked]);

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
    const currentSaveProgress = mode === 'verse' ? saveVerseProgress : mode === 'page' ? savePageProgress : saveMushafProgress;

    // Charger la position sauvegardée pour le mode verse au démarrage (UNE SEULE FOIS)
    useEffect(() => {
        if (!loadingVerse && !progressionsLoaded.verse) {
            if (verseProgress) {
                console.log('[ReadingScreen] Chargement position verse:', verseProgress);
                setVersePosition({ sourate: verseProgress.sourateNumero, verset: verseProgress.versetNumero });
                setTempSelectedSurah(verseProgress.sourateNumero);
                setTempSelectedVerse(verseProgress.versetNumero);
            } else {
                console.log('[ReadingScreen] Pas de sauvegarde verse, valeurs par défaut');
            }
            setProgressionsLoaded(prev => ({ ...prev, verse: true }));
            setIsInitialized(true);
            setLastLoadedMode('verse');
        }
    }, [loadingVerse, verseProgress, progressionsLoaded.verse]);

    // Charger les progressions des autres modes (UNE SEULE FOIS)
    useEffect(() => {
        if (!loadingPage && !progressionsLoaded.page) {
            if (pageProgress) {
                console.log('[ReadingScreen] Chargement position page:', pageProgress);
                setPagePosition({ sourate: pageProgress.sourateNumero, verset: pageProgress.versetNumero });
            }
            setProgressionsLoaded(prev => ({ ...prev, page: true }));
        }
    }, [loadingPage, pageProgress, progressionsLoaded.page]);

    useEffect(() => {
        if (!loadingMushaf && !progressionsLoaded.mushaf) {
            if (mushafProgress) {
                console.log('[ReadingScreen] Chargement position mushaf:', mushafProgress);
                setMushafPosition({ sourate: mushafProgress.sourateNumero, verset: mushafProgress.versetNumero });
            }
            setProgressionsLoaded(prev => ({ ...prev, mushaf: true }));
        }
    }, [loadingMushaf, mushafProgress, progressionsLoaded.mushaf]);

    // getItemLayout pour un scroll précis dans les FlatLists
    const getItemLayout = (_: any, index: number) => ({
        length: 200, // Hauteur estimée moyenne d'un verset
        offset: 200 * index,
        index,
    });

    // Scroll initial vers la position sauvegardée (au montage)
    useEffect(() => {
        if ((mode === 'page' || mode === 'mushaf') && allVersets.length > 0 && !hasScrolledInitially && flatListRef.current) {
            const currentPos = mode === 'page' ? pagePosition : mushafPosition;
            
            // Calculer l'index du verset
            const estimatedIndex = calculateVersetsBeforeSourate(currentPos.sourate) + currentPos.verset - 1;
            
            console.log(`[ReadingScreen] Chargement initial ${mode} vers sourate ${currentPos.sourate}`);
            
            // Afficher le loader pour les sourates éloignées
            if (estimatedIndex > 100) {
                setIsJumpingToSourate(true);
            }
            
            const timer = setTimeout(() => {
                try {
                    flatListRef.current?.scrollToIndex({ 
                        index: estimatedIndex, 
                        animated: false,
                        viewPosition: 0.1
                    });
                } catch (error) {
                    console.warn('[ReadingScreen] Erreur scroll initial:', error);
                }
                setHasScrolledInitially(true);
                // Cacher le loader après le scroll
                setTimeout(() => setIsJumpingToSourate(false), 1000);
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [mode, allVersets.length, hasScrolledInitially, pagePosition, mushafPosition]);

    // Fonction helper pour calculer le nombre de versets avant une sourate
    const calculateVersetsBeforeSourate = (sourateNumero: number): number => {
        // Nombre de versets par sourate (tableau complet du Coran)
        const versetsPerSourate: { [key: number]: number } = {
            1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
            11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
            21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
            31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
            41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
            51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
            61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
            71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
            81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
            91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
            101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
            111: 5, 112: 4, 113: 5, 114: 6
        };
        
        let total = 0;
        for (let i = 1; i < sourateNumero; i++) {
            total += versetsPerSourate[i] || 0;
        }
        return total;
    };

    // Gérer le changement de mode : scroll vers la position du nouveau mode
    useEffect(() => {
        // Ne rien faire si on est au démarrage ou si le mode n'a pas changé
        if (!isInitialized || !lastLoadedMode || lastLoadedMode === mode) return;
        
        console.log(`[ReadingScreen] Changement de mode de ${lastLoadedMode} vers ${mode}`);
        setLastLoadedMode(mode);
        
        // Pour page/mushaf, scroller vers la position sauvegardée
        if ((mode === 'page' || mode === 'mushaf') && allVersets.length > 0 && hasScrolledInitially) {
            const modePos = mode === 'page' ? pagePosition : mushafPosition;
            const estimatedIndex = calculateVersetsBeforeSourate(modePos.sourate) + modePos.verset - 1;
            
            console.log(`[ReadingScreen] Saut vers sourate ${modePos.sourate}`);
            
            // Afficher le loader pour les sauts de plus de 50 versets
            if (Math.abs(estimatedIndex - (flatListRef.current as any)?._listRef?._scrollMetrics?.offset / 200) > 50) {
                setIsJumpingToSourate(true);
            }
            
            isRepositioningRef.current = true;
            
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ 
                    index: estimatedIndex, 
                    animated: false,
                    viewPosition: 0.1
                });
                setTimeout(() => {
                    isRepositioningRef.current = false;
                    setIsJumpingToSourate(false);
                }, 1000);
            }, 100);
        }
    }, [mode, isInitialized, lastLoadedMode, allVersets.length, hasScrolledInitially, pagePosition, mushafPosition]);

    // Sauvegarder automatiquement la position avec debounce (2 secondes après le dernier changement)
    useEffect(() => {
        if (!user || !isInitialized) return;

        // Nettoyer le timer précédent
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        // Créer un nouveau timer
        saveTimerRef.current = setTimeout(() => {
            // Logs supprimés pour performance (appelé toutes les 2 secondes)
            currentSaveProgress(selectedSurah, currentVerse)
                .then(() => {
                    // Sauvegarde réussie
                })
                .catch((error) => {
                    console.error(`[ReadingScreen] Erreur sauvegarde (${mode}):`, error);
                });
        }, 2000); // 2 secondes de debounce

        // Cleanup
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [selectedSurah, currentVerse, user, isInitialized, currentSaveProgress, mode]);

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    // Handler pour détecter les versets visibles (page/mushaf)
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        // Ne mettre à jour que si on a déjà fait le scroll initial ET qu'on n'est pas en train de repositionner
        const currentMode = modeRef.current;
        const currentUser = userRef.current;
        const currentHasScrolled = hasScrolledInitiallyRef.current;
        const currentIsRepositioning = isRepositioningRef.current;
        
        if (viewableItems.length > 0 && (currentMode === 'page' || currentMode === 'mushaf') && currentUser && currentHasScrolled && !currentIsRepositioning) {
            const firstVisibleItem = viewableItems[0].item;
            if (firstVisibleItem) {
                // Log supprimé pour performance (appelé très fréquemment)
                // Mettre à jour la position du mode actif
                if (currentMode === 'page') {
                    setPagePosition({ sourate: firstVisibleItem.sourateNumero, verset: firstVisibleItem.versetNumero });
                } else {
                    setMushafPosition({ sourate: firstVisibleItem.sourateNumero, verset: firstVisibleItem.versetNumero });
                }
            }
        }
    }).current;

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    // Handler pour gérer les échecs de scrollToIndex (index pas encore rendu)
    const onScrollToIndexFailed = (info: { index: number; averageItemLength: number }) => {
        console.log('[ReadingScreen] scrollToIndex échoué, retry avec offset pour index:', info.index);
        // Faire un scrollToOffset approximatif
        const offset = info.index * info.averageItemLength;
        flatListRef.current?.scrollToOffset({ offset, animated: false });
        // Réessayer scrollToIndex après un court délai pour affiner la position
        setTimeout(() => {
            try {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false, viewPosition: 0.1 });
            } catch (error) {
                // Si ça échoue encore, c'est OK on a au moins scrollé approximativement
            }
            // Cacher le loader après le scroll
            setTimeout(() => setIsJumpingToSourate(false), 500);
        }, 100);
    };

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
            if (user) {
                currentSaveProgress(selectedSurah, nextVerse).catch((error) => {
                    console.error('[ReadingScreen] Erreur sauvegarde navigation:', error);
                });
            }
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
            if (user) {
                currentSaveProgress(selectedSurah, prevVerse).catch((error) => {
                    console.error('[ReadingScreen] Erreur sauvegarde navigation:', error);
                });
            }
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
            // Sauvegarder immédiatement sur le serveur
            if (user) {
                currentSaveProgress(selectedSurah, nextVerse).catch((error) => {
                    console.error('[ReadingScreen] Erreur sauvegarde verset:', error);
                });
            }
        } else if (selectedSurah < 114) {
            // Dernier verset de la sourate, passer à la sourate suivante
            console.log('[ReadingScreen] Sourate terminée, déblocage pour quiz:', selectedSurah);
            
            // Débloquer la sourate qu'on vient de finir pour le quiz
            if (user) {
                try {
                    await quizService.unlockSourate(user.id, selectedSurah);
                    console.log('[ReadingScreen] Sourate débloquée:', selectedSurah);
                    
                    // Afficher le modal de félicitation seulement en mode verse
                    if (mode === 'verse') {
                        setCompletedSourate({
                            numero: selectedSurah,
                            nom: currentSourate?.nomTraduction || '',
                        });
                        setShowCompletionModal(true);
                    } else {
                        // En mode page ou mushaf, passer directement à la sourate suivante
                        moveToNextSourate();
                    }
                } catch (error) {
                    console.error('[ReadingScreen] Erreur déblocage sourate:', error);
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
        // Sauvegarder immédiatement sur le serveur
        if (user) {
            currentSaveProgress(nextSurah, 1).catch((error) => {
                console.error('[ReadingScreen] Erreur sauvegarde sourate suivante:', error);
            });
        }
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
            currentSaveProgress(numero, 1).catch((error) => {
                console.error('[ReadingScreen] Erreur sauvegarde changement sourate:', error);
            });
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
        
        // Pour page/mushaf, scroller vers la position sélectionnée
        if ((mode === 'page' || mode === 'mushaf') && allVersets.length > 0) {
            const estimatedIndex = calculateVersetsBeforeSourate(tempSelectedSurah) + tempSelectedVerse - 1;
            
            console.log(`[ReadingScreen] Saut vers sourate ${tempSelectedSurah}`);
            
            // Toujours afficher le loader pour les sélections manuelles
            setIsJumpingToSourate(true);
            isRepositioningRef.current = true;
            
            setTimeout(() => {
                try {
                    flatListRef.current?.scrollToIndex({ 
                        index: estimatedIndex, 
                        animated: false,
                        viewPosition: 0.1
                    });
                } catch (error) {
                    console.warn('[ReadingScreen] Erreur scroll:', error);
                }
                setTimeout(() => {
                    isRepositioningRef.current = false;
                    setIsJumpingToSourate(false);
                }, 1000);
            }, 50);
        }
        
        // Sauvegarder immédiatement sur le serveur
        if (user) {
            currentSaveProgress(tempSelectedSurah, tempSelectedVerse).catch((error) => {
                console.error('[ReadingScreen] Erreur sauvegarde sélection:', error);
            });
        }
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
            return sourate ? `${sourate.numero}. ${sourate.nomTraduction} (${sourate.nomArabe})` : `Sourate ${sourateNumero}`;
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
                ref={flatListRef}
                data={allVersets}
                keyExtractor={(item) => `${item.sourateNumero}-${item.versetNumero}`}
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
                removeClippedSubviews={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfigRef}
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={onScrollToIndexFailed}
            />
        );
    };

    const renderMushafMode = () => {
        if (loadingAllVersets) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>{t('reading.loading_verses')}</Text>
                    <Text style={styles.loadingSubText}>{t('reading.mushaf_loading')}...</Text>
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
            return sourate ? `${sourate.numero}. ${sourate.nomTraduction} (${sourate.nomArabe})` : `${sourateNumero}`;
        };

        // Fonction pour savoir si c'est le premier verset d'une sourate
        const isFirstVerseOfSourate = (item: Verset, index: number) => {
            if (index === 0) return true;
            return item.sourateNumero !== allVersets[index - 1]?.sourateNumero;
        };

        const renderMushafVerse = ({ item, index }: { item: Verset; index: number }) => {
            const isFirst = isFirstVerseOfSourate(item, index);
            const sourateName = isFirst ? getSourateName(item.sourateNumero) : undefined;
            
            return (
                <View style={styles.mushafVerseContainer}>
                    {isFirst && (
                        <View style={styles.mushafSourateHeader}>
                            <Text style={styles.mushafSourateName}>{sourateName}</Text>
                            <View style={styles.mushafDivider} />
                        </View>
                    )}
                    <View style={styles.mushafVerse}>
                        <Text style={styles.mushafNumber}>{item.versetNumero}</Text>
                        <Text style={styles.mushafText}>{item.texteArabe}</Text>
                    </View>
                </View>
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
                ref={flatListRef}
                data={allVersets}
                keyExtractor={(item) => `${item.sourateNumero}-${item.versetNumero}`}
                renderItem={renderMushafVerse}
                contentContainerStyle={styles.mushafListContent}
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
                removeClippedSubviews={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfigRef}
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={onScrollToIndexFailed}
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
                    <TouchableOpacity onPress={handleOpenSelector} style={styles.selectorButton}>
                        <Text style={styles.subtitle}>
                            {mode === 'verse' ? (
                                currentSourate 
                                    ? `${currentSourate.numero}:${currentVerse} - ${currentSourate.nomTraduction} (${currentSourate.nomArabe})`
                                    : t('reading.select_surah')
                            ) : (
                                currentSourate 
                                    ? `${currentSourate.numero} - ${currentSourate.nomTraduction} (${currentSourate.nomArabe})`
                                    : t('reading.select_surah')
                            )}
                        </Text>
                        <ChevronDown color="#6b7280" size={16} />
                    </TouchableOpacity>
                </View>
                {/* Bouton bookmark uniquement pour modes page/mushaf */}
                {(mode === 'page' || mode === 'mushaf') && (
                    <TouchableOpacity 
                        style={[
                            styles.bookmarkButton,
                            isCurrentVerseBookmarked && styles.bookmarkButtonActive
                        ]}
                        onPress={async () => {
                            if (user && currentSourate) {
                                await toggleBookmark(selectedSurah, currentVerse, currentSourate.nomTraduction);
                                // Mettre à jour l'état local immédiatement
                                const newStatus = await isBookmarked(selectedSurah, currentVerse);
                                setIsCurrentVerseBookmarked(newStatus);
                            }
                        }}
                        disabled={!user}
                    >
                        {isCurrentVerseBookmarked ? (
                            <Bookmark color="#ffffff" size={20} fill="#ffffff" />
                        ) : (
                            <BookmarkPlus color="#059669" size={20} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Progress Bar */}
            {currentSourate && (
                <SurahProgressBar
                    surahName={currentSourate.nomTraduction}
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

            {/* Modal de félicitation après sourate */}
            {completedSourate && (
                <SourateCompletionModal
                    visible={showCompletionModal}
                    sourateName={completedSourate.nom}
                    sourateNumber={completedSourate.numero}
                    nextSourateName={completedSourate.numero < 114 ? sourates.find(s => s.numero === completedSourate.numero + 1)?.nomTraduction : undefined}
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

            {/* Content */}
            {mode === 'verse' ? (
                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
                    {renderVerseMode()}
                </ScrollView>
            ) : mode === 'page' ? (
                <View style={styles.pageContent}>
                    {renderPageMode()}
                </View>
            ) : (
                <View style={styles.pageContent}>
                    {renderMushafMode()}
                </View>
            )}

            {/* Loader pendant le saut vers une sourate */}
            {isJumpingToSourate && (
                <View style={styles.jumpingOverlay}>
                    <View style={styles.jumpingCard}>
                        <ActivityIndicator size="large" color="#059669" />
                        <Text style={styles.jumpingText}>Chargement de la sourate...</Text>
                    </View>
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
});
