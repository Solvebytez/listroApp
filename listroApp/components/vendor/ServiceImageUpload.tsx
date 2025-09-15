import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResponsiveText } from "../UI/ResponsiveText";
import { COLORS, MARGIN, PADDING, BORDER_RADIUS } from "@/constants";

interface ServiceImageUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  showHint?: boolean;
}

export const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({
  image,
  onImageChange,
  showHint = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload service images."
      );
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to open image picker. Please try again.");
    }
  };

  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);

      // For now, we'll use the local URI as the image URL
      // In a real implementation, you would upload to your backend
      const imageUrl = imageAsset.uri;
      onImageChange(imageUrl);

      Alert.alert("Success", "Service image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          onImageChange(null);
        },
      },
    ]);
  };

  const renderImageUpload = () => {
    if (!image) {
      return (
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={handleImagePicker}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color={COLORS.primary[500]} />
          ) : (
            <>
              <Ionicons
                name="cloud-upload"
                size={48}
                color={COLORS.text.secondary}
              />
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.uploadTitle}
              >
                Upload Service Image
              </ResponsiveText>
              <ResponsiveText
                variant="body2"
                color={COLORS.text.secondary}
                style={styles.uploadInstructions}
              >
                Add a photo of your service or business
              </ResponsiveText>
              <ResponsiveText
                variant="caption2"
                color={COLORS.text.secondary}
                style={styles.uploadRequirements}
              >
                JPG, PNG up to 5MB
              </ResponsiveText>
            </>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
          <Ionicons name="close" size={16} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleImagePicker}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="pencil" size={16} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return <View style={styles.container}>{renderImageUpload()}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  uploadArea: {
    height: 200,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    padding: PADDING.lg,
  },
  uploadTitle: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.sm,
  },
  uploadInstructions: {
    textAlign: "center",
    marginBottom: MARGIN.sm,
  },
  uploadRequirements: {
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.neutral[100],
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.error[500],
    justifyContent: "center",
    alignItems: "center",
  },
  changeButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    textAlign: "center",
    marginTop: MARGIN.sm,
  },
});
