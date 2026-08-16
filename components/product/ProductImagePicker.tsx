import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUploadProductImage } from '@/hooks/useUploadProductImage';
import { ApiRequestError } from '@/types';

interface ProductImagePickerProps {
  /** A photo the user picked/took — null means none set, fall back to placeholderUri. */
  imageUri: string | null;
  /** Auto-generated preview shown when no photo has been picked yet. */
  placeholderUri: string | null;
  onChange: (url: string | null) => void;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

export function ProductImagePicker({ imageUri, placeholderUri, onChange }: ProductImagePickerProps) {
  const uploadImage = useUploadProductImage();
  const displayUri = imageUri ?? placeholderUri;

  const pickAndUpload = async (source: 'camera' | 'gallery') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        source === 'camera'
          ? 'Allow camera access to take a product photo.'
          : 'Allow photo library access to choose a product photo.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    try {
      const url = await uploadImage.mutateAsync({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });
      onChange(url);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Could not upload the photo. Please try again.';
      Alert.alert('Upload failed', message);
    }
  };

  const handlePress = () => {
    const options: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
      { text: 'Take Photo', onPress: () => pickAndUpload('camera') },
      { text: 'Choose from Gallery', onPress: () => pickAndUpload('gallery') },
    ];
    if (imageUri) {
      options.push({ text: 'Remove Photo', style: 'destructive', onPress: () => onChange(null) });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Product Photo', undefined, options);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={uploadImage.isPending}
      className="items-center py-4"
      accessibilityRole="button"
      accessibilityLabel={imageUri ? 'Change product photo' : 'Add product photo'}
    >
      <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800">
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text className="text-xs text-gray-400 dark:text-gray-500">Preview</Text>
        )}
        {uploadImage.isPending ? (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : (
          <View className="absolute bottom-1 right-1 h-7 w-7 items-center justify-center rounded-full bg-primary-500">
            <Ionicons name="camera" size={14} color="#ffffff" />
          </View>
        )}
      </View>
      <Text className="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400">
        {imageUri ? 'Change Photo' : 'Add Photo'}
      </Text>
    </Pressable>
  );
}
