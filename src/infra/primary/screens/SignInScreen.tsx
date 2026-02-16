import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/contexts/AuthContext';
import { AuthFormFactory } from '../components/AuthFormFactory';

interface SignInScreenProps {
    navigation: any;
}

export const SignInScreen = ({ navigation }: SignInScreenProps) => {
    const { t } = useTranslation();
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAuth = async (data: any) => {
        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(data);
                Alert.alert(t('common.success'), t('auth.register_success'));
            } else {
                await signIn(data.email, data.password);
                Alert.alert(t('common.success'), t('auth.login_success'));
            }
            navigation.navigate('MainMenu');
        } catch (error: any) {
            console.error(error);
            Alert.alert(t('common.error'), error.message || t('auth.auth_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#374151" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                <AuthFormFactory
                    type={isSignUp ? 'register' : 'login'}
                    onSubmit={handleAuth}
                    onSwitchMode={() => setIsSignUp(!isSignUp)}
                    loading={loading}
                />
            </View>

            <View style={styles.socialContainer}>
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t('auth.social_continue')}</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>{t('auth.google')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>{t('auth.facebook')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        paddingVertical: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    formContainer: {
        flex: 1,
    },
    socialContainer: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1d5db',
    },
    dividerText: {
        fontSize: 14,
        color: '#9ca3af',
        paddingHorizontal: 8,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
});
