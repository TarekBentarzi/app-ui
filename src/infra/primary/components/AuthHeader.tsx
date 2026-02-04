import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserDTO } from '@/application/dto/UserDTO';

interface Props {
    user: UserDTO | null;
    onSignInPress: () => void;
    onSignOutPress: () => void;
}

export const AuthHeader: React.FC<Props> = ({ user, onSignInPress, onSignOutPress }) => {
    return (
        <View style={styles.header}>
            <View style={styles.container}>
                {user ? (
                    <View style={styles.userSection}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <TouchableOpacity style={styles.signOutButton} onPress={onSignOutPress}>
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
                        <Text style={styles.signInText}>Sign In</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
        paddingTop: 50, // For notch compatibility
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userName: {
        marginRight: 10,
        fontWeight: '600',
        color: '#333',
    },
    signInButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    signInText: {
        color: '#fff',
        fontWeight: '600',
    },
    signOutButton: {
        borderLeftWidth: 1,
        borderLeftColor: '#ddd',
        paddingLeft: 10,
    },
    signOutText: {
        color: '#ff3b30',
        fontWeight: '600',
    },
});
