import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    contentContainer: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileButton: {
        backgroundColor: '#059669',
    },
    streakCard: {
        backgroundColor: '#f97316',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    streakContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    streakIcon: {
        width: 56,
        height: 56,
        backgroundColor: '#ffffff',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    streakValue: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    streakRight: {
        alignItems: 'flex-end',
    },
    streakMessage: {
        color: '#ffffff',
        fontSize: 14,
    },
    signInBanner: {
        backgroundColor: '#059669',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    signInTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    signInText: {
        color: '#d1fae5',
        fontSize: 14,
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    signInButtonText: {
        color: '#059669',
        fontSize: 16,
        fontWeight: '600',
    },
    progressCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    progressItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    progressValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    progressValueGray: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    sectionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lockedCard: {
        backgroundColor: '#f3f4f6',
    },
    sectionIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    readingIcon: {
        backgroundColor: '#d1fae5',
    },
    memorizingIcon: {
        backgroundColor: '#f3e8ff',
    },
    pronunciationIcon: {
        backgroundColor: '#dbeafe',
    },
    quranIcon: {
        backgroundColor: '#dcfce7',
    },
    lockedIcon: {
        backgroundColor: '#e5e7eb',
    },
    sectionContent: {
        flex: 1,
    },
    sectionCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    lockedText: {
        color: '#9ca3af',
    },
    progressBarContainer: {
        marginTop: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    readingProgress: {
        backgroundColor: '#059669',
    },
    memorizingProgress: {
        backgroundColor: '#9333ea',
    },
    pronunciationProgress: {
        backgroundColor: '#2563eb',
    },
    progressText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    scoreContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
});
