import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { MODEL_REGISTRY } from '../data/modelRegistry';
import { spacing } from '../theme';
import Mobile3DModelViewer from '../components/learn/Mobile3DModelViewer';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - spacing.lg * 2 - spacing.md) / 2;

const CATEGORIES = ['All', 'Physics', 'Chemistry', 'Biology', 'Astronomy'];

const MobileModelListScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedModel, setSelectedModel] = useState<{ name: string; fileName: string } | null>(null);
    const [viewerVisible, setViewerVisible] = useState(false);

    const models = Object.keys(MODEL_REGISTRY).map((key, index) => ({
        name: key,
        id: key,
        fileName: MODEL_REGISTRY[key as keyof typeof MODEL_REGISTRY],
        category: getCategoryForModel(key),
        gradientColors: getGradientForIndex(index),
    }));

    function getCategoryForModel(name: string): string {
        if (name.toLowerCase().includes('atom') || name.toLowerCase().includes('molecule')) return 'Chemistry';
        if (name.toLowerCase().includes('cell') || name.toLowerCase().includes('dna')) return 'Biology';
        if (name.toLowerCase().includes('planet') || name.toLowerCase().includes('solar')) return 'Astronomy';
        return 'Physics';
    }

    function getGradientForIndex(index: number): string[] {
        const gradients = [
            ['#9C27B0', '#BA68C8'],
            ['#2196F3', '#42A5F5'],
            ['#00BCD4', '#26C6DA'],
            ['#4CAF50', '#66BB6A'],
            ['#FF9800', '#FFB74D'],
            ['#E91E63', '#F06292'],
        ];
        return gradients[index % gradients.length];
    }

    const filteredModels = models.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleModelPress = (model: any) => {
        setSelectedModel({ name: model.name, fileName: model.fileName });
        setViewerVisible(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Premium Header */}
            <LinearGradient
                colors={['#6A5AE0', '#8B7AFF', '#9D8FFF']}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Decorative Circles */}
                <View style={[styles.decorativeCircle, { top: -40, right: -30, width: 120, height: 120 }]} />
                <View style={[styles.decorativeCircle, { bottom: -20, left: -20, width: 80, height: 80 }]} />

                {/* Header Content */}
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>3D Models</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search models..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Category Filters */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.categoriesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                    >
                        {CATEGORIES.map((category, index) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setSelectedCategory(category)}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category && styles.categoryChipActive
                                ]}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === category && styles.categoryTextActive
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Models Grid */}
                <View style={styles.content}>
                    <View style={styles.modelsGrid}>
                        {filteredModels.map((model, index) => (
                            <Animated.View
                                key={model.id}
                                entering={FadeInRight.delay(index * 80)}
                                style={styles.modelCardWrapper}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => handleModelPress(model)}
                                >
                                    <LinearGradient
                                        colors={[...model.gradientColors, model.gradientColors[1] + 'CC'] as any}
                                        style={styles.modelCard}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.modelIconContainer}>
                                            <View style={styles.modelIconBg}>
                                                <MaterialCommunityIcons name="cube-outline" size={32} color="#fff" />
                                            </View>
                                        </View>
                                        <Text style={styles.modelName} numberOfLines={2}>{model.name}</Text>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryBadgeText}>{model.category}</Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {filteredModels.length === 0 && (
                        <Animated.View entering={FadeInDown} style={styles.emptyState}>
                            <MaterialCommunityIcons name="cube-off-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No models found</Text>
                            <Text style={styles.emptySubtext}>Try a different search or category</Text>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            {/* 3D Model Viewer */}
            {selectedModel && (
                <Mobile3DModelViewer
                    visible={viewerVisible}
                    title={selectedModel.name}
                    modelSource={selectedModel.fileName}
                    onClose={() => setViewerVisible(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        shadowColor: '#6A5AE0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        padding: 0,
    },
    categoriesContainer: {
        paddingVertical: spacing.md,
    },
    categoriesScroll: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryChipActive: {
        backgroundColor: '#6A5AE0',
        borderColor: '#6A5AE0',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    categoryTextActive: {
        color: '#fff',
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    modelsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    modelCardWrapper: {
        width: cardWidth,
        marginBottom: spacing.md,
    },
    modelCard: {
        padding: spacing.md,
        borderRadius: 20,
        minHeight: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    modelIconContainer: {
        marginBottom: spacing.sm,
    },
    modelIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modelName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.sm,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        minHeight: 40,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 'auto',
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: spacing.sm,
    },
});

export default MobileModelListScreen;
