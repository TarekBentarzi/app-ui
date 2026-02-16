import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    showText?: boolean;
    text?: string;
    height?: number;
}

export const ProgressBar = ({
    progress,
    color = '#059669',
    showText = false,
    text,
    height = 8
}: ProgressBarProps) => {
    const percentage = Math.min(Math.max(progress * 100, 0), 100);

    return (
        <View style={styles.container}>
            <View style={[styles.background, { height }]}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: color,
                            height
                        }
                    ]}
                />
            </View>
            {showText && (
                <Text style={styles.text}>{text || `${Math.round(percentage)}%`}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    background: {
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        borderRadius: 4,
    },
    text: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
});
