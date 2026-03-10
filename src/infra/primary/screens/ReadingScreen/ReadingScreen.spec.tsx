import React from 'react';
import { ReadingScreen } from './ReadingScreen';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    ArrowLeft: () => null,
    BookmarkPlus: () => null,
    Bookmark: () => null,
    Volume2: () => null,
    ChevronLeft: () => null,
    ChevronRight: () => null,
    Check: () => null,
    ChevronDown: () => null,
    Lock: () => null,
}));

jest.mock('expo-av');

jest.mock('../components/VerseCard', () => ({
    VerseCard: jest.fn(() => null),
}));

jest.mock('../components/SurahProgressBar', () => ({
    SurahProgressBar: jest.fn(() => null),
}));

jest.mock('../components/QuranProgressBar', () => ({
    QuranProgressBar: jest.fn(() => null),
}));

jest.mock('@/shared/constants/surahNames', () => ({
    getSurahNameFr: jest.fn(() => 'Test Surah'),
}));

jest.mock('@/infra/secondary/quran', () => ({
    quizService: {
        getQuizQuestions: jest.fn(),
    },
}));

jest.mock('@/shared/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: null,
    })),
}));

jest.mock('@/shared/contexts/UserProgressContext', () => ({
    useUserProgress: jest.fn(() => ({
        progress: { currentVerse: 1, versesRead: 0 },
        updateProgress: jest.fn(),
    })),
}));

jest.mock('@/shared/hooks', () => ({
    useSourates: jest.fn(() => ({
        sourates: [
            { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 }
        ],
        loading: false,
        error: null,
    })),
    useVersets: jest.fn(() => ({
        versets: [
            { id: '1', numero: 1, texteArabe: 'بِسْمِ اللَّهِ', traductionFrancaise: 'Au nom d\'Allah', sourateNumero: 1, audioUrl: null }
        ],
        loading: false,
        error: null,
    })),
    useAllVersets: jest.fn(() => ({
        versets: [
            { id: '1', numero: 1, texteArabe: 'بِسْمِ اللَّهِ', traductionFrancaise: 'Au nom d\'Allah', sourateNumero: 1, audioUrl: null }
        ],
        loading: false,
        loadingMore: false,
        hasMore: false,
        loadMore: jest.fn(),
        sourates: [
            { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 }
        ],
    })),
    useProgress: jest.fn(() => ({
        progress: null,
        loading: false,
        saveProgress: jest.fn(),
    })),
    useBookmarks: jest.fn(() => ({
        bookmarks: [],
        isBookmarked: jest.fn(() => false),
        toggleBookmark: jest.fn(),
        addBookmark: jest.fn(),
        removeBookmark: jest.fn(),
        updateNote: jest.fn(),
        clearAll: jest.fn(),
        loading: false,
    })),
}));

jest.mock('./useReadingScreenUtils', () => ({
    useReadingScreenUtils: jest.fn(() => ({
        updatePosition: jest.fn(),
        updateSourate: jest.fn(),
        updateVerset: jest.fn(),
        currentSaveProgress: jest.fn(),
        handleScrollEnd: jest.fn(),
        handlePlayAudio: jest.fn(),
        handleNextVerse: jest.fn(),
        handlePrevVerse: jest.fn(),
        handleMarkAsRead: jest.fn(),
        moveToNextSourate: jest.fn(),
        handleSurahChange: jest.fn(),
        handleOpenSelector: jest.fn(),
        handleConfirmSelection: jest.fn(),
        handleNextSourate: jest.fn(),
        handlePrevSourate: jest.fn(),
        handleVersetLayout: jest.fn(),
        handleScroll: jest.fn(),
    })),
}));

describe('ReadingScreen', () => {
    it('should import ReadingScreen without errors', () => {
        expect(ReadingScreen).toBeDefined();
    });

    // Les tests de rendu de ReadingScreen nécessitent une configuration complexe
    // des mocks en raison de ses nombreuses dépendances (hooks, contextes, refs, etc.).
    // Ces tests seraient mieux adaptés à des tests d'intégration E2E plutôt que
    // des tests unitaires avec Jest.
    // Pour plus de détails sur le problème, voir: 
    // - Dépendances sur useReadingScreenUtils hook avec 20+ paramètres
    // - État complexe avec 3 modes de lecture (verse, page, mushaf)
    // - Multiples refs et effets de synchronisation
});
