import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, Trophy, Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface WelcomeScreenProps {
    onContinue: () => void;
}

export const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
    const { t } = useTranslation();

    return (
        <LinearGradient
            colors={['#059669', '#14b8a6']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo/Icon */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <BookOpen color="#059669" size={56} />
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{t('welcome.title')}</Text>
                    <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <BookOpen color="#059669" size={24} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>{t('welcome.features.read.title')}</Text>
                            <Text style={styles.featureDescription}>{t('welcome.features.read.description')}</Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Trophy color="#f59e0b" size={24} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>{t('welcome.features.memorize.title')}</Text>
                            <Text style={styles.featureDescription}>{t('welcome.features.memorize.description')}</Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Mic color="#3b82f6" size={24} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>{t('welcome.features.pronunciation.title')}</Text>
                            <Text style={styles.featureDescription}>{t('welcome.features.pronunciation.description')}</Text>
                        </View>
                    </View>
                </View>

                {/* CTA Button */}
                <TouchableOpacity style={styles.button} onPress={onContinue}>
                    <Text style={styles.buttonText}>{t('welcome.get_started')}</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    {t('welcome.footer')}
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logoContainer: {
        marginBottom: 32,
    },
    logoBox: {
        width: 96,
        height: 96,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    titleContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 20,
        color: '#d1fae5',
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 32,
        gap: 16,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 16,
        gap: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#d1fae5',
    },
    button: {
        width: '100%',
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669',
    },
    footerText: {
        fontSize: 14,
        color: '#d1fae5',
    },
});
