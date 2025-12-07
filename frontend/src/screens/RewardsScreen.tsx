import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Animated, { FadeInDown, FadeInRight, ZoomIn, FadeIn } from 'react-native-reanimated';
import { spacing } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsive } from '../hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    requiredXP: number;
    gradient: readonly [string, string];
}

const RewardsScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { xp, streak } = useAuth();
    const { containerStyle } = useResponsive();
    const insets = useSafeAreaInsets();

    const level = Math.floor(xp / 100) + 1;
    const currentLevelXP = xp % 100;
    const nextLevelXP = 100;
    const progress = currentLevelXP / nextLevelXP;

    const badges: Badge[] = [
        // Beginner Achievements
        { id: '1', name: 'First Steps', description: 'Complete your first quiz', icon: 'star', unlocked: xp >= 10, requiredXP: 10, gradient: ['#667eea', '#764ba2'] },
        { id: '2', name: 'Curious Mind', description: 'Complete your first lesson', icon: 'book-open-variant', unlocked: xp >= 5, requiredXP: 5, gradient: ['#4facfe', '#00f2fe'] },
        { id: '3', name: 'Quick Learner', description: 'Earn 100 XP', icon: 'flash', unlocked: xp >= 100, requiredXP: 100, gradient: ['#f093fb', '#f5576c'] },

        // Streak Achievements
        { id: '4', name: 'Dedicated', description: 'Maintain a 7-day streak', icon: 'fire', unlocked: streak >= 7, requiredXP: 0, gradient: ['#fa709a', '#fee140'] },
        { id: '5', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'fire-circle', unlocked: streak >= 30, requiredXP: 0, gradient: ['#ff6b6b', '#ee5a6f'] },
        { id: '6', name: 'Legend', description: 'Maintain a 100-day streak', icon: 'crown', unlocked: streak >= 100, requiredXP: 0, gradient: ['#ffd700', '#ffed4e'] },

        // Level Achievements
        { id: '7', name: 'Scholar', description: 'Reach Level 5', icon: 'school', unlocked: level >= 5, requiredXP: 500, gradient: ['#30cfd0', '#330867'] },
        { id: '8', name: 'Master', description: 'Reach Level 10', icon: 'medal', unlocked: level >= 10, requiredXP: 1000, gradient: ['#a8edea', '#fed6e3'] },
        { id: '9', name: 'Grandmaster', description: 'Reach Level 20', icon: 'trophy-award', unlocked: level >= 20, requiredXP: 2000, gradient: ['#ffecd2', '#fcb69f'] },

        // XP Milestones
        { id: '10', name: 'Rising Star', description: 'Earn 500 XP', icon: 'star-circle', unlocked: xp >= 500, requiredXP: 500, gradient: ['#43e97b', '#38f9d7'] },
        { id: '11', name: 'Expert', description: 'Earn 1000 XP', icon: 'trophy', unlocked: xp >= 1000, requiredXP: 1000, gradient: ['#fa709a', '#fee140'] },
        { id: '12', name: 'Elite', description: 'Earn 5000 XP', icon: 'trophy-variant', unlocked: xp >= 5000, requiredXP: 5000, gradient: ['#667eea', '#764ba2'] },

        // Game Achievements
        { id: '13', name: 'Game Starter', description: 'Play your first game', icon: 'gamepad', unlocked: false, requiredXP: 0, gradient: ['#f093fb', '#f5576c'] },
        { id: '14', name: 'Game Master', description: 'Win 10 games', icon: 'gamepad-variant', unlocked: false, requiredXP: 0, gradient: ['#ffecd2', '#fcb69f'] },
        { id: '15', name: 'Champion', description: 'Win 50 games', icon: 'trophy-outline', unlocked: false, requiredXP: 0, gradient: ['#30cfd0', '#330867'] },

        // Exploration Achievements
        { id: '16', name: 'Explorer', description: 'Complete 10 lessons', icon: 'compass', unlocked: false, requiredXP: 0, gradient: ['#4facfe', '#00f2fe'] },
        { id: '17', name: 'Quiz Ace', description: 'Score 100% on 5 quizzes', icon: 'check-decagram', unlocked: false, requiredXP: 0, gradient: ['#43e97b', '#38f9d7'] },
        { id: '18', name: '3D Enthusiast', description: 'View 5 3D models', icon: 'cube-outline', unlocked: false, requiredXP: 0, gradient: ['#a8edea', '#fed6e3'] },
    ];

    const unlockedBadges = badges.filter((b) => b.unlocked);
    const lockedBadges = badges.filter((b) => !b.unlocked);

    return (
        <View style={styles.container}>
            {/* Premium Gradient Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2', '#5B4B8A']}
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
                            Rewards & Progress
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            Track your achievements and level up!
                        </Text>
                    </View>
                    <View style={{ width: 48 }} />
                </Animated.View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={[styles.content, containerStyle]}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: -40, flex: 1 }}
            >
                {/* Level Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                        style={styles.levelCard}
                    >
                        <View style={styles.levelHeader}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.levelCircle}
                            >
                                <MaterialCommunityIcons name="trophy-variant" size={24} color="#fff" />
                                <Text style={styles.levelNumber}>{level}</Text>
                            </LinearGradient>
                            <View style={styles.levelInfo}>
                                <Text variant="titleLarge" style={styles.levelTitle}>Level {level}</Text>
                                <View style={styles.xpRow}>
                                    <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
                                    <Text variant="bodyMedium" style={styles.levelSubtitle}>
                                        <Text style={{ color: '#667eea', fontWeight: 'bold' }}>{currentLevelXP}</Text>
                                        <Text style={{ color: '#999' }}> / {nextLevelXP} XP</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                                />
                            </View>
                        </View>

                        <View style={styles.levelFooter}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{xp}</Text>
                                <Text style={styles.statLabel}>Total XP</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{nextLevelXP - currentLevelXP}</Text>
                                <Text style={styles.statLabel}>To Next Level</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Streak Card */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                    <LinearGradient
                        colors={['#FF6B6B', '#FF8E53']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.streakCard}
                    >
                        <View style={styles.streakContent}>
                            <View style={styles.fireIconContainer}>
                                <MaterialCommunityIcons name="fire" size={56} color="#fff" />
                                <View style={styles.streakBadge}>
                                    <Text style={styles.streakNumber}>{streak}</Text>
                                </View>
                            </View>
                            <Text variant="titleLarge" style={styles.streakLabel}>Day Streak</Text>
                            <Text style={styles.streakMotivation}>
                                {streak > 0 ? '🔥 You\'re on fire! Keep it up!' : 'Start your streak today!'}
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Unlocked Badges */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            Unlocked Badges
                        </Text>
                        <View style={styles.badgeCount}>
                            <Text style={styles.badgeCountText}>{unlockedBadges.length}</Text>
                        </View>
                    </View>

                    {unlockedBadges.length === 0 ? (
                        <Animated.View entering={ZoomIn.delay(300)} style={styles.emptyState}>
                            <MaterialCommunityIcons name="trophy-outline" size={64} color="#E0E0E0" />
                            <Text style={styles.emptyText}>Start learning to unlock badges!</Text>
                        </Animated.View>
                    ) : (
                        <View style={styles.badgesGrid}>
                            {unlockedBadges.map((badge, index) => (
                                <Animated.View
                                    key={badge.id}
                                    entering={FadeInRight.delay(300 + index * 100).duration(500)}
                                    style={styles.badgeWrapper}
                                >
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={badge.gradient}
                                            style={styles.badgeCard}
                                        >
                                            <View style={styles.badgeIconContainer}>
                                                <MaterialCommunityIcons name={badge.icon as any} size={32} color="#fff" />
                                            </View>
                                            <Text style={styles.badgeName}>{badge.name}</Text>
                                            <Text style={styles.badgeDescription} numberOfLines={2}>
                                                {badge.description}
                                            </Text>
                                            <View style={styles.checkmark}>
                                                <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Locked Badges */}
                {lockedBadges.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text variant="titleLarge" style={styles.sectionTitle}>
                                Locked Badges
                            </Text>
                            <View style={[styles.badgeCount, { backgroundColor: '#E0E0E0' }]}>
                                <Text style={[styles.badgeCountText, { color: '#666' }]}>{lockedBadges.length}</Text>
                            </View>
                        </View>

                        <View style={styles.badgesGrid}>
                            {lockedBadges.map((badge, index) => (
                                <Animated.View
                                    key={badge.id}
                                    entering={FadeInRight.delay(400 + index * 100).duration(500)}
                                    style={styles.badgeWrapper}
                                >
                                    <View style={styles.lockedBadgeCard}>
                                        <View style={styles.lockedIconContainer}>
                                            <MaterialCommunityIcons name="lock" size={32} color="#999" />
                                        </View>
                                        <Text style={styles.lockedBadgeName}>{badge.name}</Text>
                                        <Text style={styles.lockedBadgeDescription} numberOfLines={2}>
                                            {badge.description}
                                        </Text>
                                        {badge.requiredXP > 0 && (
                                            <View style={styles.xpNeededBadge}>
                                                <MaterialCommunityIcons name="star-outline" size={12} color="#999" />
                                                <Text style={styles.xpNeededText}>{badge.requiredXP} XP</Text>
                                            </View>
                                        )}
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
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
        shadowColor: '#764ba2',
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
        fontSize: 32,
        letterSpacing: 0.5,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        marginTop: 4,
        fontWeight: '500',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    levelCard: {
        borderRadius: 24,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    levelCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    levelNumber: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginTop: 4,
    },
    levelInfo: {
        flex: 1,
    },
    levelTitle: {
        fontWeight: '800',
        color: '#1A1A1A',
        fontSize: 24,
    },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    levelSubtitle: {
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: spacing.lg,
    },
    progressTrack: {
        height: 14,
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderRadius: 7,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 7,
    },
    levelFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#667eea',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    streakCard: {
        borderRadius: 24,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    streakContent: {
        alignItems: 'center',
    },
    fireIconContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    streakBadge: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    streakNumber: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FF6B6B',
    },
    streakLabel: {
        fontWeight: '800',
        color: '#fff',
        marginBottom: spacing.sm,
        fontSize: 22,
    },
    streakMotivation: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionContainer: {
        marginBottom: spacing.xl,
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
    badgeCount: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeCountText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    badgeWrapper: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
        minWidth: 150,
    },
    badgeCard: {
        borderRadius: 20,
        padding: spacing.lg,
        minHeight: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        position: 'relative',
    },
    badgeIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badgeName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    badgeDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 16,
    },
    checkmark: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    lockedBadgeCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: spacing.lg,
        minHeight: 180,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    lockedIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    lockedBadgeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#999',
        marginBottom: 4,
    },
    lockedBadgeDescription: {
        fontSize: 12,
        color: '#BDBDBD',
        lineHeight: 16,
        marginBottom: spacing.sm,
    },
    xpNeededBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 'auto',
    },
    xpNeededText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xxl,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#BDBDBD',
        marginTop: spacing.md,
        fontSize: 15,
        fontWeight: '600',
    },
});

export default RewardsScreen;
