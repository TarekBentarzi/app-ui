import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface AuthFormProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    submitLabel: string;
    onSubmit: () => Promise<void>;
    loading: boolean;
    error: string | null;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    title,
    subtitle,
    children,
    submitLabel,
    onSubmit,
    loading,
    error,
    secondaryActionLabel,
    onSecondaryAction,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.inputsContainer}>
                {children}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={onSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{submitLabel}</Text>
                )}
            </TouchableOpacity>

            {secondaryActionLabel && onSecondaryAction && (
                <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction} disabled={loading}>
                    <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#059669',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    secondaryButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        color: '#059669',
        fontWeight: '600',
    },
});
