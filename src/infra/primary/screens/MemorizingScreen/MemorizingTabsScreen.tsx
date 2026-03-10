import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Trophy, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { QuizListScreen } from '../QuizScreen/QuizListScreen';
import { VerseReadingScreen } from '../VerseReadingScreen/VerseReadingScreen';

interface MemorizingTabsScreenProps {
    navigation: any;
}

type Tab = 'quiz' | 'reading';

export const MemorizingTabsScreen = ({ navigation }: MemorizingTabsScreenProps) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('reading');

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
                <Text style={styles.title}>{t('memorizing.title')}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reading' && styles.tabActive]}
                    onPress={() => setActiveTab('reading')}
                >
                    <BookOpen 
                        color={activeTab === 'reading' ? '#9333ea' : '#6b7280'} 
                        size={20} 
                    />
                    <Text style={[styles.tabText, activeTab === 'reading' && styles.tabTextActive]}>
                        {t('memorizing.tabs.reading')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'quiz' && styles.tabActive]}
                    onPress={() => setActiveTab('quiz')}
                >
                    <Trophy 
                        color={activeTab === 'quiz' ? '#9333ea' : '#6b7280'} 
                        size={20} 
                    />
                    <Text style={[styles.tabText, activeTab === 'quiz' && styles.tabTextActive]}>
                        {t('memorizing.tabs.quiz')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'reading' ? (
                    <VerseReadingScreen navigation={navigation} />
                ) : (
                    <QuizListScreen navigation={navigation} hideHeader={true} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    placeholder: {
        width: 40,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#9333ea',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#9333ea',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
});
