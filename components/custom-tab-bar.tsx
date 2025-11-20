import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HORIZONTAL_PADDING = 20 * 2;
const CONTAINER_HORIZONTAL_PADDING = 12 * 2;
const ESTIMATED_CONTAINER_WIDTH = SCREEN_WIDTH - TAB_BAR_HORIZONTAL_PADDING - CONTAINER_HORIZONTAL_PADDING;

type TabConfig = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const TAB_CONFIG: Record<string, TabConfig> = {
    index: { label: 'AI Effects', icon: 'sparkles' },
    explore: { label: 'Explore', icon: 'compass' },
    'my-creations': { label: 'My Creations', icon: 'film' },
};


export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const [containerWidth, setContainerWidth] = useState(ESTIMATED_CONTAINER_WIDTH);
    const animatedIndex = useRef(new Animated.Value(state.index)).current;
    const tabCount = state.routes.length;
    const animationRange = useMemo(() => state.routes.map((_, idx) => idx), [state.routes]);
    const layoutMeasuredRef = useRef(false);

    useEffect(() => {
        Animated.spring(animatedIndex, {
            toValue: state.index,
            stiffness: 180,
            damping: 18,
            mass: 0.8,
            useNativeDriver: true,
        }).start();
    }, [state.index, animatedIndex]);

    const itemWidth = useMemo(() => {
        if (!containerWidth || tabCount === 0) return 0;
        return containerWidth / tabCount;
    }, [containerWidth, tabCount]);

    const highlightWidth = useMemo(() => {
        if (itemWidth <= 0) return 0;
        return Math.max(itemWidth - 12, 0);
    }, [itemWidth]);

    const handleLayout = (event: LayoutChangeEvent) => {
        const measuredWidth = event.nativeEvent.layout.width;
        // Only update if significantly different to prevent micro-adjustments
        if (!layoutMeasuredRef.current || Math.abs(measuredWidth - containerWidth) > 3) {
            setContainerWidth(measuredWidth);
            layoutMeasuredRef.current = true;
        }
    };

    return (
        <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.container} onLayout={handleLayout}>
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.activeHalo,
                        {
                            width: highlightWidth || (ESTIMATED_CONTAINER_WIDTH / tabCount - 12),
                            opacity: highlightWidth > 0 ? 1 : 0,
                            transform: [
                                {
                                    translateX: Animated.multiply(
                                        animatedIndex,
                                        itemWidth || (ESTIMATED_CONTAINER_WIDTH / tabCount)
                                    ),
                                },
                            ],
                        },
                    ]}
                />
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const { options } = descriptors[route.key];
                    const config = TAB_CONFIG[route.name];

                    if (!config) return null;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    const rawLabel = options.tabBarLabel ?? options.title ?? config.label;
                    const label = typeof rawLabel === 'string' ? rawLabel : config.label;
                    const iconScale = animatedIndex.interpolate({
                        inputRange: animationRange,
                        outputRange: animationRange.map((i) => (i === index ? 1 : 0.92)),
                        extrapolate: 'clamp',
                    });

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={typeof label === 'string' ? label : undefined}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.item}>
                            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconScale }] }]}>
                                <Ionicons
                                    name={config.icon}
                                    size={18}
                                    color={isFocused ? '#FFFFFF' : '#8C8FA3'}
                                />
                            </Animated.View>
                            <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
                                {label as string}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#201F24',
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        overflow: 'hidden', borderWidth: .1, borderColor: '#33313C'
    },
    item: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        marginHorizontal: 6,
        gap: 4,
    },
    iconWrapper: {
        marginBottom: 4,
    },
    label: {
        color: '#8C8FA3',
        fontSize: 13,
        fontWeight: '600',
    },
    labelActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    activeHalo: {
        position: 'absolute',
        top: 6,
        bottom: 6,
        left: 6,
        borderRadius: 50,
        backgroundColor: '#414045',
    },
});

