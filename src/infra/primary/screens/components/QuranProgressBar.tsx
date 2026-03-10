import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTotalPagesRead, TOTAL_PAGES } from '@/shared/constants/quranPages';

interface QuranProgressBarProps {
    currentSurah: number;
    totalSurahs: number;
    mode: 'verse' | 'page' | 'mushaf';
}

const getModeLabel = (mode: string) => {
    switch (mode) {
        case 'verse':
            return 'Par verset';
        case 'page':
            return 'Avec traduction';
        case 'mushaf':
            return 'Sans traduction';
        default:
            return '';
    }
};

export const QuranProgressBar = ({ currentSurah, totalSurahs, mode }: QuranProgressBarProps) => {
    // Calculer la progression basée sur les pages du Coran (604 pages)
    const pagesRead = getTotalPagesRead(currentSurah - 1); // Pages jusqu'à la sourate précédente
    const progress = TOTAL_PAGES > 0 ? (pagesRead / TOTAL_PAGES) * 100 : 0;
    
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.modeLabel}>
                    📖 Progression du Coran
                </Text>
                <Text style={styles.progressText}>
                    {Math.round(progress)}%
                </Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#d1fae5',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modeLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#047857',
        flex: 1,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#d1fae5',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#059669',
        borderRadius: 3,
    },
});
