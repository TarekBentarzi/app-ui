import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { X, Sparkles, Bug, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ReleaseNote {
    type: 'feature' | 'bugfix' | 'improvement';
    text: string;
}

interface ReleaseNotesModalProps {
    visible: boolean;
    version: string;
    notes: ReleaseNote[];
    onClose: () => void;
}

export const ReleaseNotesModal = ({
    visible,
    version,
    notes,
    onClose,
}: ReleaseNotesModalProps) => {
    const { t } = useTranslation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
        }
    }, [visible, fadeAnim, slideAnim]);

    const getIcon = (type: ReleaseNote['type']) => {
        switch (type) {
            case 'feature':
                return <Sparkles color="#059669" size={20} />;
            case 'bugfix':
                return <Bug color="#dc2626" size={20} />;
            case 'improvement':
                return <Zap color="#f59e0b" size={20} />;
        }
    };

    const getLabel = (type: ReleaseNote['type']) => {
        switch (type) {
            case 'feature':
                return t('release_notes.features');
            case 'bugfix':
                return t('release_notes.bug_fixes');
            case 'improvement':
                return t('release_notes.improvements');
        }
    };

    const groupedNotes = {
        feature: notes.filter(n => n.type === 'feature'),
        bugfix: notes.filter(n => n.type === 'bugfix'),
        improvement: notes.filter(n => n.type === 'improvement'),
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View 
                    style={[
                        styles.modalContent,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.versionBadge}>
                                <Sparkles color="#ffffff" size={16} />
                            </View>
                            <View>
                                <Text style={styles.title}>{t('release_notes.whats_new')}</Text>
                                <Text style={styles.version}>Version {version}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <X color="#6b7280" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView 
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {groupedNotes.feature.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    {getIcon('feature')}
                                    <Text style={styles.sectionTitle}>{getLabel('feature')}</Text>
                                </View>
                                {groupedNotes.feature.map((note, index) => (
                                    <View key={`feature-${index}`} style={styles.noteItem}>
                                        <View style={styles.bullet} />
                                        <Text style={styles.noteText}>{note.text}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {groupedNotes.improvement.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    {getIcon('improvement')}
                                    <Text style={styles.sectionTitle}>{getLabel('improvement')}</Text>
                                </View>
                                {groupedNotes.improvement.map((note, index) => (
                                    <View key={`improvement-${index}`} style={styles.noteItem}>
                                        <View style={styles.bullet} />
                                        <Text style={styles.noteText}>{note.text}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {groupedNotes.bugfix.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    {getIcon('bugfix')}
                                    <Text style={styles.sectionTitle}>{getLabel('bugfix')}</Text>
                                </View>
                                {groupedNotes.bugfix.map((note, index) => (
                                    <View key={`bugfix-${index}`} style={styles.noteItem}>
                                        <View style={styles.bullet} />
                                        <Text style={styles.noteText}>{note.text}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.understoodButton}
                            onPress={onClose}
                        >
                            <Text style={styles.understoodButtonText}>
                                {t('release_notes.understood')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    versionBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#059669',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    version: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        flex: 1,
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingLeft: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#9ca3af',
        marginTop: 7,
        marginRight: 12,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: '#4b5563',
    },
    footer: {
        padding: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    understoodButton: {
        backgroundColor: '#059669',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    understoodButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
