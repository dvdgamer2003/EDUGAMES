import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn, useAnimatedStyle, withRepeat, withTiming, useSharedValue, Easing, FadeIn } from 'react-native-reanimated';
import { useSync } from '../context/SyncContext';
import { getQueueItems, clearQueue, QueueItem, subscribeToQueue } from '../offline/syncQueue';
import { spacing } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const SyncScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { isSyncing, isOffline, pendingItems, syncNow } = useSync();
    const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { containerStyle } = useResponsive();

    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isSyncing) {
            rotation.value = withRepeat(
                withTiming(360, { duration: 1000, easing: Easing.linear }),
                -1
            );
        } else {
            rotation.value = 0;
        }
    }, [isSyncing]);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    const loadQueueItems = async () => {
        const items = await getQueueItems();
        setQueueItems(items);
    };

    useEffect(() => {
        loadQueueItems();

        const unsubscribe = subscribeToQueue((items) => {
            setQueueItems(items);
            console.log('[SyncScreen] Queue updated:', items.length, 'items');
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        loadQueueItems();
    }, [isSyncing]);

    const handleManualSync = async () => {
        await syncNow();
        await loadQueueItems();
    };

    const handleClearQueue = async () => {
        await clearQueue();
        await loadQueueItems();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadQueueItems();
        setRefreshing(false);
    };

    const getTypeLabel = (type: QueueItem['type']) => {
        switch (type) {
            case 'SUBMIT_QUIZ_RESULT': return 'Quiz Result';
            case 'SUBMIT_GAME_RESULT': return 'Game Result';
            case 'GENERIC_SYNC': return 'Generic Data';
            case 'SYNC_XP': return 'XP Sync';
            case 'SYNC_CHAPTER_PROGRESS': return 'Chapter Progress';
            default: return type;
        }
    };

    const getTypeIcon = (type: QueueItem['type']) => {
        switch (type) {
            case 'SUBMIT_QUIZ_RESULT': return 'school-outline';
            case 'SUBMIT_GAME_RESULT': return 'gamepad-variant-outline';
            case 'GENERIC_SYNC': return 'sync';
            case 'SYNC_XP': return 'star-outline';
            case 'SYNC_CHAPTER_PROGRESS': return 'book-check-outline';
            default: return 'file-document-outline';
        }
    };

    const getTypeGradient = (type: QueueItem['type']): readonly [string, string] => {
        switch (type) {
            case 'SUBMIT_QUIZ_RESULT': return ['#667eea', '#764ba2'];
            case 'SUBMIT_GAME_RESULT': return ['#f093fb', '#f5576c'];
            case 'GENERIC_SYNC': return ['#30cfd0', '#330867'];
            case 'SYNC_XP': return ['#fa709a', '#fee140'];
            case 'SYNC_CHAPTER_PROGRESS': return ['#43e97b', '#38f9d7'];
            default: return ['#a8edea', '#fed6e3'];
        }
    };

    const retryCount = queueItems.filter((item) => item.retryCount > 0).length;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isOffline ? ['#FF6B6B', '#FF8E53'] : ['#4CAF50', '#66BB6A', '#81C784']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 16 }]}
            >
                <View style={[styles.decorativeCircle, { top: -40, right: -30, width: 120, height: 120 }]} />
                <View style={[styles.decorativeCircle, { bottom: -20, left: -20, width: 80, height: 80 }]} />

                <Animated.View entering={FadeIn.duration(600)} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text variant="headlineLarge" style={styles.screenTitle}>
                            Sync Status
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {isOffline ? 'Offline Mode' : 'Connected & Synced'}
                        </Text>
                    </View>
                    <View style={{ width: 48 }} />
                </Animated.View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={[styles.content, containerStyle]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: -40, flex: 1 }}
            >
                <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                    <LinearGradient
                        colors={isOffline
                            ? ['rgba(255, 107, 107, 0.95)', 'rgba(255, 142, 83, 0.85)']
                            : ['rgba(76, 175, 80, 0.95)', 'rgba(102, 187, 106, 0.85)']
                        }
                        style={styles.statusCard}
                    >
                        <View style={styles.statusRow}>
                            <Animated.View style={isSyncing ? animatedIconStyle : {}}>
                                <View style={styles.statusIconContainer}>
                                    <MaterialCommunityIcons
                                        name={isSyncing ? 'sync' : (isOffline ? 'cloud-off-outline' : 'cloud-check-outline')}
                                        size={48}
                                        color="#fff"
                                    />
                                </View>
                            </Animated.View>
                            <View style={styles.statusTextContainer}>
                                <Text variant="headlineSmall" style={styles.statusTitle}>
                                    {isSyncing ? 'Syncing...' : (isOffline ? 'Offline Mode' : 'All Synced')}
                                </Text>
                                <Text variant="bodyMedium" style={styles.statusSubtitle}>
                                    {isSyncing
                                        ? 'Uploading your progress...'
                                        : (isOffline ? 'Changes will sync when online' : 'Your data is up to date')}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.statsGrid}>
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statCol}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.statCard}
                        >
                            <MaterialCommunityIcons name="clock-outline" size={32} color="#fff" />
                            <Text style={styles.statNumber}>{queueItems.length}</Text>
                            <Text style={styles.statLabel}>Pending Items</Text>
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.statCol}>
                        <LinearGradient
                            colors={retryCount > 0 ? ['#FF9800', '#F57C00'] : ['#30cfd0', '#330867']}
                            style={styles.statCard}
                        >
                            <MaterialCommunityIcons name="refresh" size={32} color="#fff" />
                            <Text style={styles.statNumber}>{retryCount}</Text>
                            <Text style={styles.statLabel}>Retrying</Text>
                        </LinearGradient>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={handleManualSync}
                        disabled={isSyncing || isOffline || queueItems.length === 0}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isSyncing || isOffline || queueItems.length === 0
                                ? ['#BDBDBD', '#9E9E9E']
                                : ['#667eea', '#764ba2']
                            }
                            style={styles.syncButton}
                        >
                            {isSyncing && (
                                <Animated.View style={animatedIconStyle}>
                                    <MaterialCommunityIcons name="sync" size={24} color="#fff" />
                                </Animated.View>
                            )}
                            {!isSyncing && <MaterialCommunityIcons name="sync" size={24} color="#fff" />}
                            <Text style={styles.syncButtonText}>
                                {isSyncing ? 'Syncing...' : 'Sync Now'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {queueItems.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClearQueue}
                            disabled={isSyncing}
                            activeOpacity={0.8}
                        >
                            <View style={styles.clearButton}>
                                <MaterialCommunityIcons name="delete-sweep-outline" size={24} color="#FF6B6B" />
                                <Text style={styles.clearButtonText}>Clear Queue</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                <View style={styles.sectionHeader}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Queue Items</Text>
                    {queueItems.length > 0 && (
                        <View style={styles.itemCount}>
                            <Text style={styles.itemCountText}>{queueItems.length}</Text>
                        </View>
                    )}
                </View>

                {queueItems.length === 0 ? (
                    <Animated.View entering={ZoomIn.delay(500)} style={styles.emptyState}>
                        <LinearGradient
                            colors={['#E8F5E9', '#F1F8E9']}
                            style={styles.emptyGradient}
                        >
                            <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
                            <Text variant="titleMedium" style={styles.emptyText}>All caught up!</Text>
                            <Text variant="bodyMedium" style={styles.emptySubtext}>No pending items to sync</Text>
                        </LinearGradient>
                    </Animated.View>
                ) : (
                    <View style={styles.listContainer}>
                        {queueItems.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay(500 + (index * 100)).duration(500)}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                                    style={styles.itemCard}
                                >
                                    <LinearGradient
                                        colors={getTypeGradient(item.type)}
                                        style={styles.itemIconContainer}
                                    >
                                        <MaterialCommunityIcons name={getTypeIcon(item.type)} size={24} color="#fff" />
                                    </LinearGradient>
                                    <View style={styles.itemContent}>
                                        <Text variant="titleSmall" style={styles.itemTitle}>{getTypeLabel(item.type)}</Text>
                                        <View style={styles.itemMeta}>
                                            <MaterialCommunityIcons name="clock-outline" size={14} color="#999" />
                                            <Text variant="bodySmall" style={styles.itemTime}>
                                                {new Date(item.timestamp).toLocaleTimeString()} • {new Date(item.timestamp).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    {item.retryCount > 0 && (
                                        <View style={styles.retryBadge}>
                                            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#FF9800" />
                                            <Text style={styles.retryText}>Retry {item.retryCount}</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </Animated.View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingBottom: 60,
        paddingHorizontal: spacing.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    decorativeCircle: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 1000,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    screenTitle: {
        fontWeight: '900',
        color: '#fff',
        fontSize: 28,
        letterSpacing: 0.5,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        marginTop: 2,
        fontWeight: '500',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    statusCard: {
        borderRadius: 24,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusTitle: {
        color: '#fff',
        fontWeight: '900',
        marginBottom: 4,
        fontSize: 24,
    },
    statusSubtitle: {
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCol: {
        flex: 1,
    },
    statCard: {
        padding: spacing.lg,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    statNumber: {
        fontSize: 40,
        fontWeight: '900',
        color: '#fff',
        marginVertical: spacing.sm,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    actionButtons: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.sm,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.sm,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#FFE0E0',
    },
    clearButtonText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    sectionTitle: {
        fontWeight: '800',
        color: '#1A1A1A',
        fontSize: 22,
    },
    itemCount: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    itemCountText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    listContainer: {
        gap: spacing.md,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    itemIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '700',
        color: '#1A1A1A',
        fontSize: 16,
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemTime: {
        color: '#999',
        fontSize: 12,
    },
    retryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF3E0',
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: 12,
    },
    retryText: {
        color: '#FF9800',
        fontSize: 11,
        fontWeight: '700',
    },
    emptyState: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    emptyGradient: {
        alignItems: 'center',
        padding: spacing.xxl * 2,
    },
    emptyText: {
        color: '#4CAF50',
        marginTop: spacing.lg,
        fontWeight: '800',
        fontSize: 20,
    },
    emptySubtext: {
        color: '#81C784',
        marginTop: spacing.sm,
        fontSize: 15,
        fontWeight: '500',
    },
});

export default SyncScreen;
