import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import type { Verset } from '@/infra/secondary/quran';

interface VerseCardProps {
    verset: Verset;
    showTranslation: boolean;
    playingVersetId: string | null;
    onPlayAudio: (versetId: string, audioUrl: string | null) => void;
    isFirstOfSourate: boolean;
    sourateName?: string;
}

export const VerseCard = memo(({ 
    verset, 
    showTranslation, 
    playingVersetId, 
    onPlayAudio,
    isFirstOfSourate,
    sourateName 
}: VerseCardProps) => {
    return (
        <>
            {/* Séparateur de sourate */}
            {isFirstOfSourate && sourateName && (
                <View style={styles.sourateHeader}>
                    <View style={styles.sourateHeaderLine} />
                    <Text style={styles.sourateHeaderText}>{sourateName}</Text>
                    <View style={styles.sourateHeaderLine} />
                </View>
            )}
            
            {/* Verset */}
            <View style={styles.pageVerseCard}>
                <View style={styles.pageVerseHeader}>
                    <View style={styles.smallVerseNumber}>
                        <Text style={styles.smallNumberText}>{verset.versetNumero}</Text>
                    </View>
                    {verset.audioUrl && (
                        <TouchableOpacity
                            style={[
                                styles.smallAudioButton,
                                playingVersetId === verset.id && styles.smallAudioButtonPlaying,
                            ]}
                            onPress={() => onPlayAudio(verset.id, verset.audioUrl)}
                        >
                            <Volume2 
                                color={playingVersetId === verset.id ? "#ffffff" : "#059669"} 
                                size={16} 
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.pageArabicText}>{verset.texteArabe}</Text>
                {showTranslation && verset.traduction && (
                    <Text style={styles.pageTranslationText}>{verset.traduction}</Text>
                )}
            </View>
        </>
    );
}, (prevProps, nextProps) => {
    // Optimisation: ne re-render que si ces props changent
    return (
        prevProps.verset.id === nextProps.verset.id &&
        prevProps.showTranslation === nextProps.showTranslation &&
        prevProps.playingVersetId === nextProps.playingVersetId &&
        prevProps.isFirstOfSourate === nextProps.isFirstOfSourate
    );
});

VerseCard.displayName = 'VerseCard';

const styles = StyleSheet.create({
    pageVerseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pageVerseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    smallVerseNumber: {
        width: 32,
        height: 32,
        backgroundColor: '#d1fae5',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
    },
    smallAudioButton: {
        width: 32,
        height: 32,
        backgroundColor: '#d1fae5',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallAudioButtonPlaying: {
        backgroundColor: '#059669',
    },
    pageArabicText: {
        fontSize: 22,
        lineHeight: 40,
        textAlign: 'right',
        color: '#1f2937',
        marginBottom: 8,
        writingDirection: 'rtl',
    },
    pageTranslationText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    sourateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    sourateHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1fae5',
    },
    sourateHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
        paddingHorizontal: 12,
        textAlign: 'center',
    },
});
