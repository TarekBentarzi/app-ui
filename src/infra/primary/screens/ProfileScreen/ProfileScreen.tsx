import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ArrowLeft, User, LogOut, Settings, Bell, Shield } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserProgress } from '@/shared/contexts/UserProgressContext';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';

interface ProfileScreenProps {
    navigation: any;
}

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();
    const { resetProgress } = useUserProgress();

    const handleSignOut = () => {
        // Sur web, window.confirm fonctionne mieux que Alert.alert
        const confirmLogout = typeof window !== 'undefined' && window.confirm 
            ? window.confirm(t('profile.sign_out_confirm'))
            : true;
            
        if (confirmLogout) {
            (async () => {
                console.log('[ProfileScreen] Déconnexion...');
                await signOut();
                console.log('[ProfileScreen] Déconnexion terminée, navigation vers Welcome');
                navigation.navigate('Welcome');
            })();
        }
    };

    const handleReset = () => {
        Alert.alert(
            t('profile.reset_progress'),
            t('profile.reset_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.reset'),
                    style: 'destructive',
                    onPress: () => resetProgress()
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    testID="back-button"
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#374151" size={20} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            </View>

            {/* User Info */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <User color="#059669" size={48} />
                    </View>
                </View>
                <Text style={styles.userName}>{user?.name || t('profile.guest')}</Text>
                <Text style={styles.userEmail}>{user?.email || t('profile.signin_to_sync')}</Text>
            </View>

            {/* Settings Sections */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.account_settings')}</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#dbeafe' }]}>
                        <Settings color="#2563eb" size={20} />
                    </View>
                    <Text style={styles.menuText}>{t('profile.preferences')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                        <Bell color="#d97706" size={20} />
                    </View>
                    <Text style={styles.menuText}>{t('profile.notifications')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#d1fae5' }]}>
                        <Shield color="#059669" size={20} />
                    </View>
                    <Text style={styles.menuText}>{t('profile.privacy')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.danger_zone')}</Text>

                <TouchableOpacity testID="reset-progress-button" style={styles.menuItem} onPress={handleReset}>
                    <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
                        <Shield color="#dc2626" size={20} />
                    </View>
                    <Text style={[styles.menuText, { color: '#dc2626' }]}>{t('profile.reset_progress')}</Text>
                </TouchableOpacity>

                <TouchableOpacity testID="sign-out-button" style={styles.menuItem} onPress={handleSignOut}>
                    <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
                        <LogOut color="#dc2626" size={20} />
                    </View>
                    <Text style={[styles.menuText, { color: '#dc2626' }]}>{t('profile.sign_out')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    testID="nuclear-reset-button"
                    style={[styles.menuItem, { marginTop: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#dc2626' }]}
                    onPress={() => {
                        Alert.alert(t('profile.nuclear_reset'), t('profile.nuclear_confirm'), [
                            { text: t('common.cancel'), style: 'cancel' },
                            { text: t('common.nuke'), onPress: () => { AuthStorage.clearUser(); navigation.navigate('Welcome'); } }
                        ]);
                    }}
                >
                    <View style={[styles.menuIcon, { backgroundColor: '#000' }]}>
                        <Shield color="#fff" size={20} />
                    </View>
                    <Text style={[styles.menuText, { color: '#000', fontWeight: 'bold' }]}>FORCE NUCLEAR RESET</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>{t('profile.version', { version: '1.0.0' })}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 16,
    },
    profileCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 96,
        height: 96,
        backgroundColor: '#d1fae5',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#6b7280',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
    },
    versionText: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 16,
    },
});
