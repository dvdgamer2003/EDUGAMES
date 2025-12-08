import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import videoService, { Video } from '../../services/videoService';
import { useAuth } from '../../context/AuthContext';

const TeacherVideoManagerScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('Mathematics');
    const [classNum, setClassNum] = useState('6');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];
    const classes = ['6', '7', '8', '9', '10'];

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const response = await videoService.getVideos(); // Fetch all, backend might filter by creator if needed
            setVideos(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load videos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAddVideo = async () => {
        if (!title || !url || !subject || !classNum) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await videoService.createVideo({
                title,
                url,
                description,
                subject,
                class: parseInt(classNum),
            });
            Alert.alert('Success', 'Video added successfully');
            setModalVisible(false);
            resetForm();
            loadVideos();
        } catch (error) {
            Alert.alert('Error', 'Failed to add video. Check URL.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteVideo = (id: string) => {
        setVideoToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!videoToDelete) return;

        setIsSubmitting(true);
        try {
            console.log('Deleting video with ID:', videoToDelete);
            await videoService.deleteVideo(videoToDelete);
            setVideos(prev => prev.filter(v => v._id !== videoToDelete)); // Optimistic update

            // Only show toast/alert if needed, or just close modal
            // Alert.alert('Success', 'Video deleted successfully'); 
        } catch (error: any) {
            console.error('Delete error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete video';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSubmitting(false);
            setDeleteModalVisible(false);
            setVideoToDelete(null);
        }
    };

    const resetForm = () => {
        setTitle('');
        setUrl('');
        setDescription('');
        setSubject('Mathematics');
        setClassNum('6');
    };

    const renderVideoItem = ({ item }: { item: Video }) => (
        <View style={styles.videoCard}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.videoMeta}>{item.subject} • Class {item.class}</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        onPress={() => handleDeleteVideo(item._id)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Videos</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={24} color="#4A00E0" />
                </TouchableOpacity>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color="#4A00E0" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={item => item._id}
                    renderItem={renderVideoItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        loadVideos();
                    }}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No videos added yet. Tap + to add.</Text>
                    }
                />
            )}

            {/* Add Video Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Video</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={styles.label}>Title*</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter video title" />

                        <Text style={styles.label}>YouTube URL*</Text>
                        <TextInput style={styles.input} value={url} onChangeText={setUrl} placeholder="https://youtube.com/watch?v=..." autoCapitalize="none" />

                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="Video description (optional)" />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Class*</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                                    {classes.map(c => (
                                        <TouchableOpacity
                                            key={c}
                                            style={[styles.chip, classNum === c && styles.activeChip]}
                                            onPress={() => setClassNum(c)}
                                        >
                                            <Text style={[styles.chipText, classNum === c && styles.activeChipText]}>{c}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <Text style={styles.label}>Subject*</Text>
                        <View style={styles.wrapGrid}>
                            {subjects.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.chip, subject === s && styles.activeChip]}
                                    onPress={() => setSubject(s)}
                                >
                                    <Text style={[styles.chipText, subject === s && styles.activeChipText]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
                            onPress={handleAddVideo}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Add Video</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContent}>
                        <View style={styles.deleteIconContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF5252" />
                        </View>
                        <Text style={styles.deleteModalTitle}>Delete Video?</Text>
                        <Text style={styles.deleteModalText}>
                            Are you sure you want to delete this video? This action cannot be undone.
                        </Text>
                        <View style={styles.deleteModalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setDeleteModalVisible(false)}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmDeleteBtn]}
                                onPress={confirmDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    addButton: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: { padding: 20, gap: 16 },
    videoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 10,
        elevation: 2,
    },
    thumbnail: { width: 100, height: 70, borderRadius: 8, backgroundColor: '#eee' },
    videoInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    videoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    videoMeta: { fontSize: 12, color: '#666', marginBottom: 8 },
    actionRow: { flexDirection: 'row' },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
    deleteText: { color: '#FF5252', fontSize: 12, marginLeft: 4, fontWeight: '600' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    formContent: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row', marginBottom: 16 },
    chipContainer: { flexDirection: 'row' },
    wrapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        marginBottom: 8,
    },
    activeChip: { backgroundColor: '#4A00E0' },
    chipText: { color: '#666', fontSize: 13 },
    activeChipText: { color: '#fff', fontWeight: 'bold' },
    submitBtn: {
        backgroundColor: '#4A00E0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledBtn: { opacity: 0.7 },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Delete Modal
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    deleteModalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        elevation: 5,
    },
    deleteIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    deleteModalText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    deleteModalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F5F5F5',
    },
    confirmDeleteBtn: {
        backgroundColor: '#FF5252',
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16,
    },
    confirmDeleteBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default TeacherVideoManagerScreen;
