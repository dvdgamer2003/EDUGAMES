import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, StatusBar, Dimensions, Platform, Image } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { spacing } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Mobile3DModelViewerProps {
    visible: boolean;
    title: string;
    modelSource: any;
    onClose: () => void;
}

const getHtmlContent = (modelUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box;
        }
        body { 
            margin: 0; 
            overflow: hidden; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        model-viewer { 
            width: 100vw; 
            height: 100vh;
            --poster-color: transparent;
        }
        model-viewer::part(default-progress-bar) {
            background-color: rgba(255,255,255,0.3);
        }
        model-viewer::part(default-progress-bar-fill) {
            background-color: #fff;
        }
        .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.95);
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            display: none;
        }
        .error-message.show {
            display: block;
        }
    </style>
</head>
<body>
    <model-viewer
        id="model-viewer"
        src="${modelUrl}"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        auto-rotate-delay="1000"
        rotation-per-second="30deg"
        shadow-intensity="1"
        shadow-softness="0.8"
        exposure="1"
        camera-orbit="0deg 75deg 105%"
        min-camera-orbit="auto auto 50%"
        max-camera-orbit="auto auto 200%"
        interpolation-decay="200"
        loading="eager"
    ></model-viewer>
    <div id="error" class="error-message">
        <h3 style="color: #FF6B6B; margin-bottom: 8px;">Failed to load model</h3>
        <p style="color: #666; font-size: 14px;">Please check your connection</p>
    </div>
    <script>
        const modelViewer = document.querySelector('#model-viewer');
        const errorDiv = document.querySelector('#error');
        
        modelViewer.addEventListener('error', (event) => {
            console.error('Model loading error:', event);
            errorDiv.classList.add('show');
        });
        
        modelViewer.addEventListener('load', () => {
            console.log('Model loaded successfully');
            errorDiv.classList.remove('show');
        });
    </script>
</body>
</html>
`;

const Mobile3DModelViewer: React.FC<Mobile3DModelViewerProps> = ({ visible, title, modelSource, onClose }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Resolve asset URI
    const modelUri = Image.resolveAssetSource(modelSource).uri;
    const htmlContent = getHtmlContent(modelUri);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* Compact Header */}
                <LinearGradient
                    colors={['#6A5AE0', '#8B7AFF']}
                    style={[styles.header, { paddingTop: insets.top + 8 }]}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.titleContainer}>
                            <MaterialCommunityIcons name="cube-outline" size={24} color="#fff" />
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* 3D Model Display Area */}
                <View style={styles.viewerContainer}>
                    {loading && !error && (
                        <Animated.View entering={FadeIn} style={styles.loadingContainer}>
                            <LinearGradient
                                colors={['#6A5AE0', '#8B7AFF']}
                                style={styles.loadingGradient}
                            >
                                <MaterialCommunityIcons name="cube-scan" size={64} color="#fff" />
                                <Text style={styles.loadingText}>Loading 3D Model...</Text>
                                <View style={styles.progressBar}>
                                    <View style={styles.progressFill} />
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    )}

                    {error && (
                        <Animated.View entering={FadeIn} style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle" size={64} color="#FF6B6B" />
                            <Text style={styles.errorTitle}>Failed to Load Model</Text>
                            <Text style={styles.errorText}>
                                {retryCount > 0 ? `Retry attempt ${retryCount}/3 failed. ` : ''}
                                Please check your connection and try again
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setError(false);
                                    setRetryCount(prev => prev + 1);
                                }}
                                style={styles.retryButton}
                            >
                                <LinearGradient
                                    colors={['#6A5AE0', '#8B7AFF']}
                                    style={styles.retryGradient}
                                >
                                    <Text style={styles.retryText}>Retry</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    <WebView
                        source={{
                            html: htmlContent,
                            baseUrl: Platform.OS === 'android' ? 'file:///android_asset/' : undefined
                        }}
                        style={styles.webview}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('WebView error:', nativeEvent);
                            setLoading(false);
                            setError(true);
                        }}
                        androidLayerType="hardware"
                        androidHardwareAccelerationDisabled={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        allowUniversalAccessFromFileURLs={true}
                        mixedContentMode="always"
                        opacity={0.99}
                    />
                </View>

                {/* Touch Controls Hint */}
                {!loading && !error && (
                    <Animated.View entering={FadeIn.delay(500)} style={styles.controlsHint}>
                        <View style={styles.hintCard}>
                            <MaterialCommunityIcons name="gesture-swipe" size={20} color="#6A5AE0" />
                            <Text style={styles.hintText}>Swipe to rotate • Pinch to zoom</Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        shadowColor: '#6A5AE0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerContainer: {
        flex: 1,
        position: 'relative',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: '#F5F7FA',
    },
    loadingGradient: {
        padding: spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        minWidth: 200,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    progressBar: {
        width: 150,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        width: '60%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    errorContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: '#F5F7FA',
        padding: spacing.xl,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    retryButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    retryGradient: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    retryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    controlsHint: {
        position: 'absolute',
        bottom: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        alignItems: 'center',
    },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 24,
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    hintText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
});

export default Mobile3DModelViewer;
