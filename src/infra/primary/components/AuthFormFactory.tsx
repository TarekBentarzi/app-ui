import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Alert } from 'react-native';
import { Mail, Lock, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AuthForm } from './AuthForm';

interface AuthFormFactoryProps {
    type: 'login' | 'register';
    onSubmit: (data: any) => Promise<void>;
    onSwitchMode: () => void;
    loading: boolean;
}

export const AuthFormFactory: React.FC<AuthFormFactoryProps> = ({
    type,
    onSubmit,
    onSwitchMode,
    loading,
}) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email || !password || (type === 'register' && !name)) {
            setError(t('auth.fill_fields'));
            return;
        }
        setError(null);
        try {
            await onSubmit({ name, email, password });
        } catch (err: any) {
            setError(err.message || t('auth.auth_failed'));
        }
    };

    const isLogin = type === 'login';

    return (
        <AuthForm
            title={isLogin ? t('auth.welcome') : t('auth.create_account')}
            subtitle={isLogin ? t('auth.login_subtitle') : t('auth.register_subtitle')}
            submitLabel={isLogin ? t('auth.login_button') : t('auth.register_button')}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            secondaryActionLabel={isLogin ? t('auth.switch_to_signup') : t('auth.switch_to_login')}
            onSecondaryAction={onSwitchMode}
        >
            {type === 'register' && (
                <View style={styles.inputWrapper}>
                    <User color="#9ca3af" size={20} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder={t('auth.full_name')}
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            )}

            <View style={styles.inputWrapper}>
                <Mail color="#9ca3af" size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('auth.email')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                />
            </View>

            <View style={styles.inputWrapper}>
                <Lock color="#9ca3af" size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('auth.password')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#9ca3af"
                />
            </View>
        </AuthForm>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#ffffff',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
});
