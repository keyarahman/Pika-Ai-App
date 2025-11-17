import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type ImageToVideoSectionProps = {
    selectedAsset: ImagePicker.ImagePickerAsset | null;
    prompt: string;
    onAssetChange: (asset: ImagePicker.ImagePickerAsset | null) => void;
    onPromptChange: (prompt: string) => void;
    onPickImage: () => Promise<ImagePicker.ImagePickerAsset | null>;
    onTakePhoto?: () => Promise<ImagePicker.ImagePickerAsset | null>;
};

export function ImageToVideoSection({
    selectedAsset,
    prompt,
    onAssetChange,
    onPromptChange,
    onPickImage,
    onTakePhoto,
}: ImageToVideoSectionProps) {
    const handleUploadImage = useCallback(async () => {
        const asset = await onPickImage();
        if (asset) {
            onAssetChange(asset);
        }
    }, [onPickImage, onAssetChange]);

    const handleTakePhoto = useCallback(async () => {
        if (onTakePhoto) {
            const asset = await onTakePhoto();
            if (asset) {
                onAssetChange(asset);
            }
        }
    }, [onTakePhoto, onAssetChange]);

    return (
        <>
            <View style={styles.uploadCard}>
                {selectedAsset ? (
                    <>
                        <Image source={{ uri: selectedAsset.uri }} style={styles.uploadPreview} contentFit="cover" />
                        <View style={styles.uploadOverlay}>
                            <Pressable
                                style={styles.changeImageButton}
                                onPress={handleUploadImage}>
                                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                                <Text style={styles.changeImageText}>Change Image</Text>
                            </Pressable>
                        </View>
                    </>
                ) : (
                    <>
                        <Pressable style={styles.uploadSection} onPress={handleUploadImage}>
                            <View style={styles.stackedIconContainer}>
                                <View style={[styles.stackedCard, styles.stackedCard3]} />
                                <View style={[styles.stackedCard, styles.stackedCard2]} />
                                <View style={[styles.stackedCard, styles.stackedCard1]}>
                                    <Ionicons name="camera" size={24} color="#FFFFFF" />
                                    <View style={styles.plusIcon}>
                                        <Ionicons name="add" size={16} color="#FFFFFF" />
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.uploadTitle}>Upload your image</Text>
                        </Pressable>

                        <View style={styles.separatorContainer}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>OR</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <Pressable style={styles.takePhotoButton} onPress={handleTakePhoto}>
                            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.takePhotoText}>Take a photo</Text>
                        </Pressable>
                    </>
                )}
            </View>

            <View style={styles.promptContainer}>
                <TextInput
                    style={styles.promptInput}
                    placeholder="Describe the scene you want to see and choose the camera movements from the options below."
                    placeholderTextColor="#6B6D85"
                    value={prompt}
                    onChangeText={onPromptChange}
                    multiline
                    textAlignVertical="top"
                />
                <Pressable style={styles.promptAction} android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="videocam-outline" size={18} color="#FFFFFF" />
                </Pressable>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    uploadCard: {
        width: '100%',
        minHeight: 280,
        borderRadius: 24,
        backgroundColor: '#1A1824',
        padding: 24,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    uploadSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    stackedIconContainer: {
        width: 80,
        height: 80,
        marginBottom: 20,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stackedCard: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#252233',
        borderWidth: 1,
        borderColor: '#2F2C3B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stackedCard1: {
        top: 0,
        left: 10,
        zIndex: 3,
        backgroundColor: '#2F2C3B',
    },
    stackedCard2: {
        top: 8,
        left: 5,
        zIndex: 2,
        opacity: 0.7,
    },
    stackedCard3: {
        top: 16,
        left: 0,
        zIndex: 1,
        opacity: 0.5,
    },
    plusIcon: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#7135FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1A1824',
    },
    uploadTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        gap: 12,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2F2C3B',
    },
    separatorText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    takePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: '#252233',
    },
    takePhotoText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    uploadPreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(113, 53, 255, 0.9)',
    },
    changeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    promptContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    promptInput: {
        width: '100%',
        minHeight: 120,
        borderRadius: 16,
        backgroundColor: '#181523',
        padding: 14,
        paddingRight: 50,
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
        borderWidth: 1,
        borderColor: '#252233',
    },
    promptAction: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#252233',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
