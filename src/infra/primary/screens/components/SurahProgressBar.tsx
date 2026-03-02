import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SurahProgressBarProps {
    surahName: string;
    surahNumber: number;
    currentVerse: number;
    totalVerses: number;
}

export const SurahProgressBar = ({ surahName, surahNumber, currentVerse, totalVerses }: SurahProgressBarProps) => {
    const progress = totalVerses > 0 ? (currentVerse / totalVerses) * 100 : 0;
    
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.surahInfo}>
                    {surahNumber}. {surahName}
                </Text>
                <Text style={styles.progressText}>
                    {currentVerse}/{totalVerses} ({Math.round(progress)}%)
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
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    surahInfo: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#059669',
        borderRadius: 3,
    },
});
