import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Platform
} from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Video } from '../services/videoService';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { video } = route.params as { video: Video };
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';

    const playerRef = useRef<YoutubeIframeRef>(null);
    const [playing, setPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [volume, setVolume] = useState(100); // 0-100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    // Web-specific rendering to avoid bridge issues
    if (Platform.OS === 'web') {
        return (
            <View style={[styles.container, { backgroundColor: '#000' }]}>
                {/* Minimal Header Overlay */}
                <View style={[styles.headerOverlay, { top: 20, left: 20 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.playerWrapper}>
                    {React.createElement('iframe', {
                        width: "100%",
                        height: width * 0.5625,
                        src: `https://www.youtube.com/embed/${video.videoId}?autoplay=1&controls=1`,
                        frameBorder: "0",
                        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                        allowFullScreen: true,
                        style: { border: 'none' }
                    })}
                </View>

                <ScrollView
                    style={[styles.infoContainer, { backgroundColor: isDark ? '#121212' : '#fff' }]}
                    contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                >
                    <Text style={[styles.videoTitle, { color: isDark ? '#fff' : '#1A1A1A' }]}>{video.title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaText, { color: isDark ? '#aaa' : '#666' }]}>
                            {video.subject} • Class {video.class}
                        </Text>
                        <Text style={[styles.metaText, { color: isDark ? '#aaa' : '#666' }]}>
                            {new Date(video.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    {video.description && (
                        <View>
                            <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#1A1A1A' }]}>Description</Text>
                            <Text style={[styles.descText, { color: isDark ? '#ddd' : '#444' }]}>
                                {video.description}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
        }
        if (state === 'playing') {
            setLoading(false);
        }
    }, []);

    const togglePlaying = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const changePlaybackRate = () => {
        const rates = [0.5, 1, 1.25, 1.5, 2];
        const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
        setPlaybackRate(rates[nextIndex]);
    };

    const seekTo = (value: number) => {
        playerRef.current?.seekTo(value, true);
        setCurrentTime(value);
    };

    // Helper to format time (seconds -> mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Update progress interval
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (playing && !loading) {
            interval = setInterval(async () => {
                try {
                    const elapsed = await playerRef.current?.getCurrentTime();
                    const total = await playerRef.current?.getDuration();
                    if (elapsed) setCurrentTime(elapsed);
                    if (total) setDuration(total);
                } catch (error) {
                    // Ignore polling errors during init
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [playing, loading]);

    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
            <StatusBar hidden />

            {/* Minimal Header Overlay */}
            <View style={[styles.headerOverlay, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Video Player Container */}
            <View style={styles.playerWrapper}>
                <YoutubePlayer
                    ref={playerRef}
                    height={width * 0.5625} // 16:9 Aspect Ratio
                    width={width}
                    videoId={video.videoId}
                    play={playing}
                    playbackRate={playbackRate}
                    volume={isMuted ? 0 : volume}
                    onChangeState={onStateChange}
                    onReady={() => setLoading(false)}
                    initialPlayerParams={{
                        modestbranding: true,
                        rel: false,
                        preventFullScreen: false, // Allow generic fullscreen if needed
                    }}
                />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2196F3" />
                    </View>
                )}
            </View>

            {/* Video Info ScrollView */}
            <ScrollView
                style={[styles.infoContainer, { backgroundColor: isDark ? '#121212' : '#fff' }]}
                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
            >
                <Text style={[styles.videoTitle, { color: isDark ? '#fff' : '#1A1A1A' }]}>{video.title}</Text>
                <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: isDark ? '#aaa' : '#666' }]}>
                        {video.subject} • Class {video.class}
                    </Text>
                    <Text style={[styles.metaText, { color: isDark ? '#aaa' : '#666' }]}>
                        {new Date(video.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.divider} />

                {video.description && (
                    <View>
                        <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#1A1A1A' }]}>Description</Text>
                        <Text style={[styles.descText, { color: isDark ? '#ddd' : '#444' }]}>
                            {video.description}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerOverlay: {
        position: 'absolute',
        left: 20,
        zIndex: 100,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    playerWrapper: {
        marginTop: 60, // Space for header overlay or status bar
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#000',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timeText: {
        color: '#fff',
        fontSize: 12,
        fontVariant: ['tabular-nums'],
    },
    paramControls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 10,
    },
    playBtnLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtn: {
        padding: 10,
    },
    speedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoContainer: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -10, // Slight overlap
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 28,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        opacity: 0.2,
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    descText: {
        fontSize: 14,
        lineHeight: 22,
    },
});

export default VideoPlayerScreen;
