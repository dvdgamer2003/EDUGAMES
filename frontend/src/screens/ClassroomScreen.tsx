import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, gradients, spacing, borderRadius } from '../theme';

const ClassroomScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('stream');

    // Mock Data
    const teachers = [
        { id: 1, name: 'Mrs. Sharma', subject: 'Mathematics', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Mr. Gupta', subject: 'Science', avatar: 'https://i.pravatar.cc/150?img=11' },
    ];

    const announcements = [
        { id: 1, teacher: 'Mrs. Sharma', date: '2 hrs ago', content: 'Don\'t forget to complete the Geometry quiz by tomorrow!', priority: 'high' },
        { id: 2, teacher: 'Mr. Gupta', date: 'Yesterday', content: 'New Science experiment kits have arrived. Collect them from the lab.', priority: 'normal' },
    ];

    const liveClasses = [
        { id: 1, subject: 'Math', topic: 'Quadratic Equations', time: '10:00 AM', status: 'live' },
        { id: 2, subject: 'Physics', topic: 'Laws of Motion', time: '02:00 PM', status: 'upcoming' },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={[styles.header, { paddingTop: insets.top + spacing.md }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Classroom</Text>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats or Welcome */}
                <View style={styles.welcomeParams}>
                    <Text style={styles.className}>Class 10-A</Text>
                    <Text style={styles.schoolName}>Rural High School</Text>
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                {/* Live Now Section */}
                {liveClasses.some(c => c.status === 'live') && (
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.liveSection}>
                        <LinearGradient
                            colors={['#FF416C', '#FF4B2B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.liveCard}
                        >
                            <View style={styles.liveBadge}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE NOW</Text>
                            </View>
                            <Text style={styles.liveSubject}>{liveClasses.find(c => c.status === 'live')?.subject}</Text>
                            <Text style={styles.liveTopic}>{liveClasses.find(c => c.status === 'live')?.topic}</Text>
                            <TouchableOpacity style={styles.joinButton}>
                                <Text style={styles.joinButtonText}>Join Class</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Animated.View>
                )}

                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Teachers Horizontal Scroll */}
                    <Text style={styles.sectionTitle}>My Teachers</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teachersRow}>
                        {teachers.map((teacher, index) => (
                            <Animated.View key={teacher.id} entering={FadeInDown.delay(200 + index * 50)} style={styles.teacherCard}>
                                <Image source={{ uri: teacher.avatar }} style={styles.teacherAvatar} />
                                <Text style={styles.teacherName}>{teacher.name}</Text>
                                <Text style={styles.teacherSubject}>{teacher.subject}</Text>
                            </Animated.View>
                        ))}
                    </ScrollView>

                    {/* Announcements */}
                    <Text style={styles.sectionTitle}>Announcements</Text>
                    {announcements.map((item, index) => (
                        <Animated.View key={item.id} entering={FadeInDown.delay(300 + index * 100)} style={styles.announcementCard}>
                            <View style={styles.announcementHeader}>
                                <View style={styles.announcementAuthor}>
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: item.priority === 'high' ? '#FFEBEE' : '#E3F2FD' }]}>
                                        <Text style={{ color: item.priority === 'high' ? '#D32F2F' : '#1976D2', fontWeight: 'bold' }}>
                                            {item.teacher.charAt(0)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.authorName}>{item.teacher}</Text>
                                        <Text style={styles.dateText}>{item.date}</Text>
                                    </View>
                                </View>
                                {item.priority === 'high' && (
                                    <View style={styles.highPriorityBadge}>
                                        <Text style={styles.priorityText}>Important</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.announcementContent}>{item.content}</Text>
                        </Animated.View>
                    ))}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingBottom: spacing.xl * 1.5,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    notificationButton: {
        padding: spacing.xs,
    },
    welcomeParams: {
        alignItems: 'center',
    },
    className: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    schoolName: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    contentContainer: {
        flex: 1,
        marginTop: -40,
        paddingHorizontal: spacing.lg,
    },
    liveSection: {
        marginBottom: spacing.lg,
    },
    liveCard: {
        padding: spacing.lg,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#FF4B2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: spacing.sm,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginRight: 6,
    },
    liveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    liveSubject: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
        marginBottom: 2,
    },
    liveTopic: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    joinButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#FF4B2B',
        fontWeight: 'bold',
        fontSize: 14,
    },
    scrollContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    teachersRow: {
        marginBottom: spacing.md,
    },
    teacherCard: {
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        marginRight: spacing.md,
        width: 120,
        elevation: 2,
    },
    teacherAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: spacing.sm,
        backgroundColor: '#eee',
    },
    teacherName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    teacherSubject: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        elevation: 2,
    },
    announcementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    announcementAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    authorName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    highPriorityBadge: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 10,
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    announcementContent: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
});

export default ClassroomScreen;
