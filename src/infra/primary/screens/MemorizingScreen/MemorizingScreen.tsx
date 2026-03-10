import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface MemorizingScreenProps {
    navigation: any;
}

export const MemorizingScreen = ({ navigation }: MemorizingScreenProps) => {
    // Rediriger vers QuizListScreen
    useEffect(() => {
        navigation.replace('QuizList');
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#9333ea" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
