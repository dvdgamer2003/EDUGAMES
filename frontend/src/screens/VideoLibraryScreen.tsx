import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    StatusBar,
    RefreshControl,
    useWindowDimensions,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import videoService, { Video } from '../services/videoService';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

const VideoLibraryScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { user } = useAuth();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];

    // Responsive Logic
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;
    const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;
    const gap = 20; // Spacing between cards
    const padding = 20; // Container padding
    // Calculate card width: (Total Width - Padding - Gaps) / Columns
    const cardWidth = (width - (padding * 2) - (gap * (numColumns - 1))) / numColumns;
    const thumbnailHeight = cardWidth * 0.5625; // 16:9 Ratio

    const loadVideos = useCallback(async () => {
        try {
            const params: any = {};
            if (user?.selectedClass) params.class = user.selectedClass;
            if (selectedSubject) params.subject = selectedSubject;

            const response = await videoService.getVideos(params);
            setVideos(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.selectedClass, selectedSubject]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    const onRefresh = () => {
        setRefreshing(true);
        loadVideos();
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderVideoItem = ({ item }: { item: Video }) => (
        <TouchableOpacity
            style={[
                styles.videoCard,
                {
                    backgroundColor: isDark ? '#1E1E1E' : '#fff',
                    width: cardWidth,
                    marginBottom: gap, // Bottom margin for grid rows
                    // Remove individual margin right, gap handled by columnWrapperStyle or manual calculation in flex wrap if needed, 
                    // but FlatList columnWrapperStyle is better for gaps.
                }
            ]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('VideoPlayer', { video: item })}
        >
            <View style={[styles.thumbnailContainer, { height: thumbnailHeight }]}>
                <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.thumbnailGradient}
                />
                <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                        <MaterialCommunityIcons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
                    </View>
                </View>
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>YouTube</Text>
                </View>
            </View>

            <View style={styles.videoInfo}>
                <View style={[styles.subjectTag, { backgroundColor: getSubjectColor(item.subject) }]}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
                <Text style={[styles.videoTitle, { color: isDark ? '#fff' : '#1A1A1A' }]} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="school-outline" size={14} color={isDark ? '#aaa' : '#666'} />
                        <Text style={[styles.metaText, { color: isDark ? '#aaa' : '#666' }]}>
                            Class {item.class}
                        </Text>
                    </View>
                    <Text style={[styles.metaText, { color: isDark ? '#aaa' : '#666' }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getSubjectColor = (subject: string) => {
        const colors: Record<string, string> = {
            'Mathematics': '#FF5252', // Red
            'Science': '#448AFF', // Blue
            'English': '#7C4DFF', // Purple
            'Social Studies': '#FF9800', // Orange
            'Hindi': '#E91E63', // Pink
            'Computer': '#00BCD4', // Cyan
        };
        return colors[subject] || '#607D8B';
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F7FA' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Modern Header */}
            <LinearGradient
                colors={isDark ? ['#1f1c2c', '#928dab'] : ['#2563EB', '#60A5FA']} // Rich Blue Gradient
                style={[styles.header, { paddingTop: insets.top + 16 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Video Library</Text>
                    {/* Placeholder for balance */}
                    <View style={{ width: 28 }} />
                </View>

                {/* Search Bar - Floating Effect */}
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#666" style={{ marginRight: 12 }} />
                    <TextInput
                        placeholder="Search for topics, chapters..."
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* Subject Filters */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={['All', ...subjects]}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                (selectedSubject === item || (item === 'All' && !selectedSubject)) && styles.activeFilterChip
                            ]}
                            onPress={() => setSelectedSubject(item === 'All' ? null : item)}
                        >
                            <Text style={[
                                styles.filterText,
                                (selectedSubject === item || (item === 'All' && !selectedSubject)) && styles.activeFilterText
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Video List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    key={numColumns} // Force re-render on column change
                    data={filteredVideos}
                    keyExtractor={(item) => item._id}
                    renderItem={renderVideoItem}
                    numColumns={numColumns}
                    columnWrapperStyle={numColumns > 1 && { gap: gap }} // Native gap support for columns
                    contentContainerStyle={[styles.listContent, { paddingHorizontal: padding }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="youtube-tv" size={80} color="#ccc" />
                            <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#666' }]}>
                                No videos found.
                            </Text>
                            <Text style={{ color: '#999', marginTop: 8 }}>Try searching or changing filters.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filterContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    filterList: {
        paddingHorizontal: 20,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 24,
        backgroundColor: '#E0E7FF', // Light Indigo
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeFilterChip: {
        backgroundColor: '#2563EB', // Primary Blue
        elevation: 2,
    },
    filterText: {
        color: '#4F46E5', // Indigo 600
        fontWeight: '600',
        fontSize: 14,
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        paddingVertical: 12,
        paddingBottom: 40,
    },
    videoCard: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    thumbnailContainer: {
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    durationText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    videoInfo: {
        padding: 16,
    },
    subjectTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    subjectText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 24,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default VideoLibraryScreen;
