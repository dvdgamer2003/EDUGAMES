import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GradientBackground from '../../components/ui/GradientBackground';
import CustomCard from '../../components/ui/CustomCard';
import api from '../../services/api';

const TeacherClassroomScreen = () => {
    const navigation = useNavigation();
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teacher/content');
            setContent(response.data);
        } catch (error) {
            console.error('Failed to fetch content', error);
            Alert.alert('Error', 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchContent();
        setRefreshing(false);
    };

    return (
        <GradientBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Classroom Preview</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Alert.alert(
                                'Create Content',
                                'What would you like to create?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'New Quiz',
                                        onPress: () => (navigation as any).navigate('TeacherQuizCreator')
                                    },
                                    {
                                        text: 'New Chapter',
                                        onPress: () => (navigation as any).navigate('TeacherContentManager')
                                    }
                                ]
                            );
                        }}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                        }
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Created Content</Text>
                        </View>

                        {content.length > 0 ? (
                            content.map((item, index) => (
                                <CustomCard key={index} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.iconContainer, {
                                            backgroundColor: item.type === 'quiz' ? '#FCE7F3' : '#D1FAE5'
                                        }]}>
                                            <MaterialCommunityIcons
                                                name={item.type === 'quiz' ? 'clipboard-text-outline' : 'book-open-page-variant'}
                                                size={24}
                                                color={item.type === 'quiz' ? '#EC4899' : '#059669'}
                                            />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>{item.title}</Text>
                                            <Text style={styles.cardSubtitle}>
                                                {item.subject} • Class {item.classNumber}
                                            </Text>
                                        </View>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { flex: 1, marginRight: 8 }]}
                                            onPress={() => {
                                                if (item.type === 'quiz') {
                                                    (navigation as any).navigate('Quiz', { quizData: item, previewMode: true });
                                                } else {
                                                    (navigation as any).navigate('TeacherChapterViewer', { chapter: item });
                                                }
                                            }}
                                        >
                                            <Text style={styles.actionButtonText}>
                                                {item.type === 'quiz' ? 'Preview' : 'Read'}
                                            </Text>
                                            <Ionicons name="eye-outline" size={16} color="#fff" />
                                        </TouchableOpacity>

                                        {item.type === 'quiz' && (
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: '#6366F1', marginRight: 8 }]}
                                                onPress={() => (navigation as any).navigate('TeacherQuizCreator', { quizToEdit: item })}
                                            >
                                                <Ionicons name="create-outline" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Delete Content',
                                                    'Are you sure you want to delete this?',
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'Delete',
                                                            style: 'destructive',
                                                            onPress: async () => {
                                                                try {
                                                                    if (item.type === 'quiz') {
                                                                        await api.delete(`/teacher/quiz/${item._id}`);
                                                                    } else {
                                                                        // Implement delete for chapter
                                                                        await api.delete(`/teacher/chapter/${item._id}`);
                                                                    }
                                                                    fetchContent();
                                                                } catch (error) {
                                                                    Alert.alert('Error', 'Failed to delete content');
                                                                }
                                                            }
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </CustomCard>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="notebook-check-outline" size={60} color="rgba(255,255,255,0.5)" />
                                <Text style={styles.emptyText}>No content created yet!</Text>
                                <Text style={styles.emptySubtext}>Create quizzes or chapters to see them here.</Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    list: {
        paddingBottom: 20,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        opacity: 0.9,
    },
    card: {
        marginBottom: 15,
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 5,
    },
});

export default TeacherClassroomScreen;
