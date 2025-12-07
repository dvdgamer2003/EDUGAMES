import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator, ProgressBar, Surface, IconButton } from 'react-native-paper';
import { learnService } from '../../services/learnService';
import { progressService } from '../../services/progressService';
import GradientBackground from '../../components/ui/GradientBackground';
import { spacing, gradients, borderRadius } from '../../theme';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';

const ChapterListScreen = ({ route, navigation }: any) => {
    const { subjectId, subjectName } = route.params;
    const theme = useTheme();
    const { isDark } = useAppTheme();
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isFocused = useIsFocused();

    const styles = createStyles(isDark);

    useEffect(() => {
        if (isFocused) {
            loadChapters();
        }
    }, [isFocused]);

    const loadChapters = async () => {
        try {
            const data = await learnService.getChapters(subjectId);
            // Fetch subchapters for each chapter to show preview
            const chaptersWithSub = await Promise.all(data.map(async (chapter: any) => {
                try {
                    const subchapters = await learnService.getSubchapters(chapter._id);
                    return { ...chapter, subchapters };
                } catch (e) {
                    return { ...chapter, subchapters: [] };
                }
            }));
            setChapters(chaptersWithSub);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const ChapterCard = ({ item, index }: { item: any; index: number }) => {
        const [progress, setProgress] = useState<number>(0);
        const topicCount = item.subchapters?.length || 0;

        // Load progress for this chapter
        useEffect(() => {
            const loadProgress = async () => {
                const chapterProgress = await progressService.getChapterProgress(item._id);
                // Set progress to 1 (100%) if completed, otherwise 0
                setProgress(chapterProgress?.completed ? 1 : 0);
            };
            loadProgress();
        }, [item._id]);

        return (
            <Animated.View entering={FadeInDown.delay(index * 80).duration(500)} layout={Layout.springify()}>
                <TouchableOpacity
                    onPress={() => {
                        if (item.subchapters && item.subchapters.length > 0) {
                            navigation.navigate('Subchapter', { subchapterId: item.subchapters[0]._id });
                        }
                    }}
                    activeOpacity={0.9}
                >
                    <Surface style={styles.chapterCard} elevation={3}>
                        {/* Chapter Number Badge */}
                        <View style={styles.chapterBadge}>
                            <LinearGradient
                                colors={progress > 0 ? ['#4CAF50', '#66BB6A'] : ['#6A5AE0', '#8B7AFF']}
                                style={styles.badgeGradient}
                            >
                                <Text style={styles.chapterNumber}>{index + 1}</Text>
                            </LinearGradient>
                        </View>

                        {/* Chapter Content */}
                        <View style={styles.chapterContent}>
                            <View style={styles.chapterHeader}>
                                <View style={styles.chapterTitleRow}>
                                    <Text variant="titleMedium" style={styles.chapterTitle} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    {progress === 1 && (
                                        <View style={styles.completedBadge}>
                                            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                                        </View>
                                    )}
                                </View>

                                {/* Topic Count */}
                                <View style={styles.topicCountContainer}>
                                    <MaterialCommunityIcons name="book-outline" size={16} color="#888" />
                                    <Text style={styles.topicCount}>
                                        {topicCount} Topic{topicCount !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Section */}
                            <View style={styles.progressSection}>
                                <View style={styles.progressInfo}>
                                    <Text style={styles.progressLabel}>Progress</Text>
                                    <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                                </View>
                                <ProgressBar
                                    progress={progress}
                                    color={progress === 1 ? '#4CAF50' : '#6A5AE0'}
                                    style={styles.progressBar}
                                />
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            const chapterContent = await learnService.getChapterContent(item._id);
                                            console.log('[ChapterList] Opening lesson:', {
                                                chapterId: item._id,
                                                subjectId,
                                                title: item.name
                                            });
                                            navigation.navigate('LessonReader', {
                                                title: item.name,
                                                content: chapterContent.combinedContent,
                                                xpReward: 20,
                                                chapterId: item._id,
                                                subjectId: subjectId,
                                                classId: route.params.classId || 'class-6', // Get from route or default
                                            });
                                        } catch (error) {
                                            console.error('Error loading chapter content:', error);
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="book-open-variant" size={18} color="#6A5AE0" />
                                    <Text style={styles.secondaryButtonText}>Read</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => {
                                        if (item.subchapters && item.subchapters.length > 0) {
                                            navigation.navigate('Subchapter', { subchapterId: item.subchapters[0]._id });
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#6A5AE0', '#8B7AFF']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.primaryButtonGradient}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            {progress > 0 ? 'Continue' : 'Start'}
                                        </Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Surface>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderChapterCard = ({ item, index }: any) => {
        return <ChapterCard item={item} index={index} />;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading chapters...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Enhanced Header */}
            <LinearGradient
                colors={['#6A5AE0', '#8B7AFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerBackground}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text variant="headlineSmall" style={styles.headerTitle}>
                                {subjectName}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.contentContainer}>
                {/* Info Card */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.infoCardContainer}>
                    <Surface style={styles.infoCard} elevation={2}>
                        <View style={styles.infoIconContainer}>
                            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9A62" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Learn at Your Pace</Text>
                            <Text style={styles.infoText}>
                                Complete chapters to unlock achievements and earn XP!
                            </Text>
                        </View>
                    </Surface>
                </Animated.View>

                {/* Chapters List */}
                <FlatList
                    data={chapters}
                    renderItem={renderChapterCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="book-open-page-variant-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No chapters available for this subject yet.</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#0F172A' : '#F5F5F7',
    },
    headerBackground: {
        paddingTop: spacing.xl + 10,
        paddingBottom: spacing.xxl + 10,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: '#6A5AE0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    headerContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginTop: -spacing.xl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#0F172A' : '#F5F5F7',
    },
    loadingText: {
        marginTop: spacing.md,
        color: isDark ? '#94A3B8' : '#888',
        fontSize: 14,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: '800',
        textAlign: 'center',
        fontSize: 22,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        marginTop: 2,
        fontWeight: '500',
    },
    infoCardContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
    infoCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: 16,
        backgroundColor: isDark ? '#1E293B' : '#FFF5F0',
        borderLeftWidth: 4,
        borderLeftColor: '#FF9A62',
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#F1F5F9' : '#1A1A1A',
        marginBottom: 2,
    },
    infoText: {
        fontSize: 12,
        color: isDark ? '#CBD5E1' : '#666',
        lineHeight: 18,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: 40,
        gap: spacing.md,
    },
    chapterCard: {
        borderRadius: 20,
        backgroundColor: isDark ? '#1E293B' : '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        flexDirection: 'row',
    },
    chapterBadge: {
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#0F172A' : '#F8F8F8',
    },
    badgeGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6A5AE0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    chapterNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    chapterContent: {
        flex: 1,
        padding: spacing.md + 2,
    },
    chapterHeader: {
        marginBottom: spacing.sm,
    },
    chapterTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    chapterTitle: {
        flex: 1,
        fontWeight: '700',
        fontSize: 17,
        color: isDark ? '#F1F5F9' : '#1A1A1A',
        lineHeight: 24,
    },
    completedBadge: {
        marginLeft: 8,
    },
    topicCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    topicCount: {
        fontSize: 13,
        color: isDark ? '#94A3B8' : '#888',
        fontWeight: '600',
    },
    progressSection: {
        marginBottom: spacing.md,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        color: isDark ? '#94A3B8' : '#888',
        fontWeight: '600',
    },
    progressPercent: {
        fontSize: 12,
        color: '#6A5AE0',
        fontWeight: '700',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: isDark ? '#334155' : '#F0F0F0',
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: spacing.sm,
        borderRadius: 12,
        backgroundColor: isDark ? '#334155' : '#F0EDFF',
        gap: 6,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6A5AE0',
    },
    primaryButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#6A5AE0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: spacing.sm,
        gap: 6,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
        gap: spacing.md,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default ChapterListScreen;
