import { useCallback, RefObject, Dispatch, SetStateAction } from 'react';
import { Audio } from 'expo-av';
import { ScrollView } from 'react-native';
import { quizService } from '@/infra/secondary/quran';

type ReadingMode = 'verse' | 'page' | 'mushaf';

interface UseReadingScreenUtilsParams {
    mode: ReadingMode;
    selectedSurah: number;
    currentVerse: number;
    totalVerses: number;
    user: any;
    localProgress: any;
    versePosition: { sourate: number; verset: number };
    pagePosition: { sourate: number; verset: number };
    mushafPosition: { sourate: number; verset: number };
    setVersePosition: Dispatch<SetStateAction<{ sourate: number; verset: number }>>;
    setPagePosition: Dispatch<SetStateAction<{ sourate: number; verset: number }>>;
    setMushafPosition: Dispatch<SetStateAction<{ sourate: number; verset: number }>>;
    saveVerseProgress: (sourate: number, verset: number) => Promise<any>;
    savePageProgress: (sourate: number, verset: number) => Promise<any>;
    saveMushafProgress: (sourate: number, verset: number) => Promise<any>;
    updateProgress: (updates: any) => void;
    sound: Audio.Sound | undefined;
    setSound: (sound: Audio.Sound | undefined) => void;
    playingVersetId: string | null;
    setPlayingVersetId: (id: string | null) => void;
    setTempSelectedSurah: (num: number) => void;
    setTempSelectedVerse: (num: number) => void;
    setShowSelectorModal: (show: boolean) => void;
    tempSelectedSurah: number;
    tempSelectedVerse: number;
    pageVersetPositionsRef: RefObject<Map<number, number>>;
    mushafVersetPositionsRef: RefObject<Map<number, number>>;
    pageScrollViewRef: RefObject<ScrollView | null>;
    mushafScrollViewRef: RefObject<ScrollView | null>;
    pageLastSavedPositionRef: RefObject<{ sourate: number; verset: number }>;
    mushafLastSavedPositionRef: RefObject<{ sourate: number; verset: number }>;
    verseLastSavedPositionRef: RefObject<{ sourate: number; verset: number }>;
    isAutoScrollingRef: RefObject<boolean>;
    hasInitiallyScrolledRef: RefObject<{ verse: boolean; page: boolean; mushaf: boolean }>;
}

export const useReadingScreenUtils = (params: UseReadingScreenUtilsParams) => {
    const {
        mode,
        selectedSurah,
        currentVerse,
        totalVerses,
        user,
        localProgress,
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
    } = params;

    // Fonction stable pour sauvegarder selon le mode actuel (ET synchroniser UserProgressContext)
    const currentSaveProgress = useCallback(async (sourate: number, verset: number) => {
        // Sauvegarder dans ProgressStorage (par mode)
        let result;
        if (mode === 'verse') {
            result = await saveVerseProgress(sourate, verset);
        } else if (mode === 'page') {
            result = await savePageProgress(sourate, verset);
        } else {
            result = await saveMushafProgress(sourate, verset);
        }
        
        // Synchroniser UserProgressContext (ne pas écraser versesRead)
        updateProgress({
            currentSurah: sourate,
            currentVerse: verset,
        });
        
        return result;
    }, [mode, saveVerseProgress, savePageProgress, saveMushafProgress, updateProgress]);

    // Fonctions helper pour mettre à jour la position selon le mode actif
    const updatePosition = useCallback((sourate: number, verset: number) => {
        if (mode === 'verse') {
            setVersePosition({ sourate, verset });
        } else if (mode === 'page') {
            setPagePosition({ sourate, verset });
        } else {
            setMushafPosition({ sourate, verset });
        }
    }, [mode, setVersePosition, setPagePosition, setMushafPosition]);

    const updateSourate = useCallback((sourate: number) => {
        if (mode === 'verse') {
            setVersePosition(prev => ({ ...prev, sourate }));
        } else if (mode === 'page') {
            setPagePosition(prev => ({ ...prev, sourate }));
        } else {
            setMushafPosition(prev => ({ ...prev, sourate }));
        }
    }, [mode, setVersePosition, setPagePosition, setMushafPosition]);

    const updateVerset = useCallback((verset: number) => {
        if (mode === 'verse') {
            setVersePosition(prev => ({ ...prev, verset }));
        } else if (mode === 'page') {
            setPagePosition(prev => ({ ...prev, verset }));
        } else {
            setMushafPosition(prev => ({ ...prev, verset }));
        }
    }, [mode, setVersePosition, setPagePosition, setMushafPosition]);

    // Sauvegarder immédiatement quand le scroll s'arrête
    const handleScrollEnd = useCallback(() => {
        if (mode === 'verse') {
            return;
        }

        // Utiliser les refs spécifiques selon le mode
        const currentLastSavedRef = mode === 'page' ? pageLastSavedPositionRef : mushafLastSavedPositionRef;
        
        if (currentLastSavedRef.current && 
            currentLastSavedRef.current.sourate === selectedSurah && 
            currentLastSavedRef.current.verset === currentVerse) {
            return;
        }

        currentSaveProgress(selectedSurah, currentVerse)
            .then(() => {
                if (currentLastSavedRef.current) {
                    currentLastSavedRef.current = { sourate: selectedSurah, verset: currentVerse };
                }
            });
    }, [mode, selectedSurah, currentVerse, currentSaveProgress, pageLastSavedPositionRef, mushafLastSavedPositionRef]);

    const handlePlayAudio = useCallback(async (versetId: string, audioUrl: string | null) => {
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
            // Error playing audio
        }
    }, [playingVersetId, sound, setSound, setPlayingVersetId]);

    // Navigation automatique avec sauvegarde
    const handleNextVerse = useCallback(() => {
        if (currentVerse < totalVerses) {
            const nextVerse = currentVerse + 1;
            updateVerset(nextVerse);
            // Mettre à jour uniquement les stats (currentSurah/currentVerse sont synchronisés par currentSaveProgress)
            updateProgress({
                versesRead: Math.max(localProgress.versesRead, nextVerse),
            });
            currentSaveProgress(selectedSurah, nextVerse);
        }
    }, [currentVerse, totalVerses, selectedSurah, updateVerset, updateProgress, localProgress, currentSaveProgress]);

    const handlePrevVerse = useCallback(() => {
        if (currentVerse > 1) {
            const prevVerse = currentVerse - 1;
            updateVerset(prevVerse);
            // currentSaveProgress synchronise déjà currentSurah/currentVerse
            currentSaveProgress(selectedSurah, prevVerse);
        }
    }, [currentVerse, selectedSurah, updateVerset, currentSaveProgress]);

    const moveToNextSourate = useCallback(() => {
        const nextSurah = selectedSurah + 1;
        updatePosition(nextSurah, 1);
        // Mettre à jour uniquement les stats
        updateProgress({
            versesRead: localProgress.versesRead + 1,
        });
        // Sauvegarder immédiatement (synchronise currentSurah/currentVerse automatiquement)
        currentSaveProgress(nextSurah, 1);
    }, [selectedSurah, updatePosition, updateProgress, localProgress, currentSaveProgress]);

    const handleMarkAsRead = useCallback(async () => {
        if (currentVerse < totalVerses) {
            // Passer au verset suivant dans la même sourate
            const nextVerse = currentVerse + 1;
            updateVerset(nextVerse);
            // Mettre à jour uniquement les stats
            updateProgress({
                versesRead: Math.max(localProgress.versesRead, currentVerse),
            });
            // Sauvegarder immédiatement (synchronise currentSurah/currentVerse automatiquement)
            currentSaveProgress(selectedSurah, nextVerse);
        } else if (selectedSurah < 114) {
            // Dernier verset de la sourate, passer à la sourate suivante
            
            // Débloquer la sourate qu'on vient de finir pour le quiz
            if (user) {
                try {
                    await quizService.unlockSourate(user.id, selectedSurah);
                    // Passer directement à la sourate suivante (pas de modal de quiz en lecture)
                    moveToNextSourate();
                } catch (error) {
                    // En cas d'erreur, passer quand même à la sourate suivante
                    moveToNextSourate();
                }
            } else {
                moveToNextSourate();
            }
        }
    }, [currentVerse, totalVerses, selectedSurah, user, updateVerset, updateProgress, localProgress, currentSaveProgress, moveToNextSourate]);

    const handleSurahChange = useCallback((numero: number) => {
        updatePosition(numero, 1);
        // Sauvegarder immédiatement (gère automatiquement anonyme et connecté)
        currentSaveProgress(numero, 1);
    }, [updatePosition, currentSaveProgress]);

    const handleOpenSelector = useCallback(() => {
        setTempSelectedSurah(selectedSurah);
        setTempSelectedVerse(currentVerse);
        setShowSelectorModal(true);
    }, [selectedSurah, currentVerse, setTempSelectedSurah, setTempSelectedVerse, setShowSelectorModal]);

    const handleConfirmSelection = useCallback(() => {
        const isChangingSurah = tempSelectedSurah !== selectedSurah;
        const isChangingVerse = tempSelectedVerse !== currentVerse;
        
        // Si aucun changement, juste fermer le modal
        if (!isChangingSurah && !isChangingVerse) {
            setShowSelectorModal(false);
            return;
        }
        
        // Mettre à jour la position
        updatePosition(tempSelectedSurah, tempSelectedVerse);
        setShowSelectorModal(false);
        
        // Réinitialiser le flag de scroll pour permettre le scroll vers la nouvelle position
        // IMPORTANT: Faire cela même si on reste sur la même sourate
        if (mode !== 'verse') {
            const modeKey = mode as keyof typeof hasInitiallyScrolledRef.current;
            if (hasInitiallyScrolledRef.current) {
                hasInitiallyScrolledRef.current[modeKey] = false;
            }
            
            // Fonction pour tenter de scroller avec retry
            const attemptScroll = (retries = 5) => {
                const currentScrollView = mode === 'page' ? pageScrollViewRef : mushafScrollViewRef;
                const currentVersetPositions = mode === 'page' ? pageVersetPositionsRef : mushafVersetPositionsRef;
                
                if (!currentScrollView.current) {
                    if (retries > 0) {
                        setTimeout(() => attemptScroll(retries - 1), 200);
                    }
                    return;
                }
                
                // Attendre que les positions soient calculées
                if (!currentVersetPositions.current || currentVersetPositions.current.size === 0) {
                    if (retries > 0) {
                        setTimeout(() => attemptScroll(retries - 1), 200);
                    }
                    return;
                }
                
                const targetY = currentVersetPositions.current.get(tempSelectedVerse);
                if (targetY !== undefined) {
                    if (isAutoScrollingRef.current !== undefined) {
                        isAutoScrollingRef.current = true;
                    }
                    currentScrollView.current.scrollTo({ y: targetY, animated: true });
                    if (hasInitiallyScrolledRef.current) {
                        hasInitiallyScrolledRef.current[modeKey] = true;
                    }
                    
                    // Réactiver handleScroll après le scroll
                    setTimeout(() => {
                        if (isAutoScrollingRef.current !== undefined) {
                            isAutoScrollingRef.current = false;
                        }
                    }, 500);
                } else if (retries > 0) {
                    // Si la position du verset n'est pas encore calculée, réessayer
                    setTimeout(() => attemptScroll(retries - 1), 200);
                }
            };
            
            // Lancer le scroll avec un délai initial pour laisser le temps aux versets de se rendre
            setTimeout(() => attemptScroll(), isChangingSurah ? 500 : 300);
        }
        
        // Sauvegarder avec un petit délai pour s'assurer que la position est bien mise à jour
        setTimeout(() => {
            currentSaveProgress(tempSelectedSurah, tempSelectedVerse);
        }, 100);
    }, [
        tempSelectedSurah,
        tempSelectedVerse,
        selectedSurah,
        currentVerse,
        mode,
        updatePosition,
        setShowSelectorModal,
        currentSaveProgress,
        pageScrollViewRef,
        mushafScrollViewRef,
        pageVersetPositionsRef,
        mushafVersetPositionsRef,
        isAutoScrollingRef,
        hasInitiallyScrolledRef,
    ]);

    // Navigation entre sourates (pour modes page et mushaf)
    const handleNextSourate = useCallback(() => {
        if (selectedSurah < 114) {
            const nextSourate = selectedSurah + 1;
            updateSourate(nextSourate);
            updateVerset(1); // Recommencer au verset 1
            currentSaveProgress(nextSourate, 1);
        }
    }, [selectedSurah, updateSourate, updateVerset, currentSaveProgress]);

    const handlePrevSourate = useCallback(() => {
        if (selectedSurah > 1) {
            const prevSourate = selectedSurah - 1;
            updateSourate(prevSourate);  
            updateVerset(1); // Commencer au verset 1
            currentSaveProgress(prevSourate, 1);
        }
    }, [selectedSurah, updateSourate, updateVerset, currentSaveProgress]);

    // Gestion de la sauvegarde automatique au scroll
    const handleVersetLayout = useCallback((versetNumero: number, layout: { y: number }, targetMode: ReadingMode) => {
        // Utiliser la Map spécifique au mode passé en paramètre (pas le mode actuel!)
        if (targetMode === 'page' && pageVersetPositionsRef.current) {
            pageVersetPositionsRef.current.set(versetNumero, layout.y);
        } else if (targetMode === 'mushaf' && mushafVersetPositionsRef.current) {
            mushafVersetPositionsRef.current.set(versetNumero, layout.y);
        }
    }, [pageVersetPositionsRef, mushafVersetPositionsRef]);

    const handleScroll = useCallback((event: any) => {
        // Ne rien faire en mode verse (il utilise la navigation par boutons)
        if (mode === 'verse') return;

        // Ne rien faire si on est en train de scroller automatiquement
        if (isAutoScrollingRef.current) return;

        const scrollY = event.nativeEvent.contentOffset.y;
        
        // Utiliser la bonne Map selon le mode actif
        const currentVersetPositions = mode === 'page' ? pageVersetPositionsRef.current : mushafVersetPositionsRef.current;
        
        if (!currentVersetPositions) return;

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
    }, [mode, isAutoScrollingRef, pageVersetPositionsRef, mushafVersetPositionsRef, setPagePosition, setMushafPosition]);

    return {
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
    };
};
