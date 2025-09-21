import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
} from "../../constants";
import { ResponsiveText } from "../UI/ResponsiveText";
import { useActivePromotions } from "../../hooks/usePromotions";
import { Promotion } from "../../services/promotion";

// Get screen dimensions
const { width: screenWidth } = Dimensions.get("window");

// Calculate banner dimensions (adjust for better image fit)
const BANNER_WIDTH = screenWidth; // Full width
const BANNER_HEIGHT = BANNER_WIDTH * (1 / 3); // 3:1 aspect ratio for better image display
const BANNER_SPACING = 0; // No spacing for full width

// Default advertising banner component
const DefaultAdvertisingBanner: React.FC = () => {
  const handlePress = () => {
    // Navigate to advertising/partnership page
    router.push("/(dashboard)/(vendor)/advertising");
  };

  return (
    <TouchableOpacity style={styles.bannerCard} onPress={handlePress}>
      <View style={styles.defaultBannerContent}>
        {/* Left side - Text content */}
        <View style={styles.defaultBannerText}>
          <ResponsiveText
            variant="caption1"
            weight="medium"
            color={COLORS.white}
            style={styles.defaultBannerSubtitle}
          >
            Grow your business
          </ResponsiveText>
          <ResponsiveText
            variant="h4"
            weight="bold"
            color={COLORS.white}
            style={styles.defaultBannerTitle}
          >
            Start Advertising
          </ResponsiveText>
          <ResponsiveText
            variant="caption1"
            weight="medium"
            color={COLORS.white}
            style={styles.defaultBannerSubtitle}
          >
            on Listro
          </ResponsiveText>
        </View>

        {/* Right side - Business person image */}
        <View style={styles.defaultBannerImage}>
          <Ionicons name="person" size={60} color={COLORS.white} />
        </View>

        {/* Navigation arrow - Circular button */}
        <TouchableOpacity style={styles.navigationButton} onPress={handlePress}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Individual promotion banner component
const PromotionBannerCard: React.FC<{
  promotion: Promotion;
  customHeight?: number;
  resizeMode?: "contain" | "cover" | "stretch";
  customAspectRatio?: number;
  autoSizeToImage?: boolean;
}> = ({
  promotion,
  customHeight,
  resizeMode = "contain",
  customAspectRatio,
  autoSizeToImage = false,
}) => {
  const [imageAspectRatio, setImageAspectRatio] = React.useState<number | null>(
    null
  );
  const handlePress = () => {
    // Navigate to promotion details or service listings
    if (promotion.serviceListings.length > 0) {
      // Navigate to first service listing
      router.push(
        `/(dashboard)/service-details?id=${promotion.serviceListings[0].id}`
      );
    } else {
      // Navigate to search with promotion filter
      router.push(`/(dashboard)/(user)/search?promotion=${promotion.id}`);
    }
  };

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;
    setImageAspectRatio(aspectRatio);
  };

  const bannerCardStyle = {
    ...styles.bannerCard,
    height:
      customHeight ||
      (autoSizeToImage && imageAspectRatio
        ? BANNER_WIDTH / imageAspectRatio
        : BANNER_HEIGHT),
  };

  return (
    <TouchableOpacity style={bannerCardStyle} onPress={handlePress}>
      {promotion.bannerImage ? (
        <Image
          source={{ uri: promotion.bannerImage }}
          style={styles.bannerImage}
          resizeMode={resizeMode}
          onLoad={handleImageLoad}
        />
      ) : (
        <View style={styles.placeholderBanner}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.white}
            style={styles.placeholderText}
          >
            {promotion.title}
          </ResponsiveText>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Main banner slider component
export const PromotionBannerSlider: React.FC<{
  showIndicators?: boolean;
  customHeight?: number;
  customMarginTop?: number;
  resizeMode?: "contain" | "cover" | "stretch";
  customAspectRatio?: number;
  autoSizeToImage?: boolean;
}> = ({
  showIndicators = true,
  customHeight,
  customMarginTop,
  resizeMode = "contain",
  customAspectRatio,
  autoSizeToImage = false,
}) => {
  // All hooks must be called at the top, before any conditional returns
  const {
    data: activePromotions,
    isLoading,
    error,
    refetch: refetchPromotions,
  } = useActivePromotions(true);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);
  const autoSlideTimer = React.useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = React.useRef(new Animated.Value(0)).current;

  // Auto-slide functions
  const startAutoSlide = React.useCallback(() => {
    if (!activePromotions || activePromotions.length <= 1) return;

    stopAutoSlide(); // Clear any existing timer
    autoSlideTimer.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % activePromotions.length;
        goToSlide(nextIndex);
        return nextIndex;
      });
    }, 5000); // 5 seconds delay

    // Start progress animation
    progressAnimation.setValue(0);
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();
  }, [activePromotions?.length, progressAnimation]);

  const stopAutoSlide = React.useCallback(() => {
    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
      autoSlideTimer.current = null;
    }
    progressAnimation.stopAnimation();
  }, [progressAnimation]);

  const goToSlide = React.useCallback(
    (index: number) => {
      if (flatListRef.current && activePromotions) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
        });
        setCurrentIndex(index);
        stopAutoSlide();
        startAutoSlide();
      }
    },
    [activePromotions, startAutoSlide, stopAutoSlide]
  );

  const goToPrevious = React.useCallback(() => {
    if (activePromotions) {
      const prevIndex =
        currentIndex === 0 ? activePromotions.length - 1 : currentIndex - 1;
      goToSlide(prevIndex);
    }
  }, [currentIndex, activePromotions, goToSlide]);

  const goToNext = React.useCallback(() => {
    if (activePromotions) {
      const nextIndex = (currentIndex + 1) % activePromotions.length;
      goToSlide(nextIndex);
    }
  }, [currentIndex, activePromotions, goToSlide]);

  // Start auto-slide when component mounts or promotions change
  React.useEffect(() => {
    if (activePromotions && activePromotions.length > 1) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [activePromotions, startAutoSlide, stopAutoSlide]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => stopAutoSlide();
  }, [stopAutoSlide]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingBanner}>
          <ResponsiveText
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.loadingText}
          >
            Loading promotions...
          </ResponsiveText>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBanner}>
          <ResponsiveText
            variant="body2"
            color={COLORS.error[500]}
            style={styles.errorText}
          >
            Failed to load promotions
          </ResponsiveText>
        </View>
      </View>
    );
  }

  // Show default banner if no promotions available
  if (!activePromotions || activePromotions.length === 0) {
    return (
      <View style={styles.container}>
        <DefaultAdvertisingBanner />
      </View>
    );
  }

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  // Handle touch interactions
  const handleTouchStart = () => {
    stopAutoSlide();
  };

  const handleTouchEnd = () => {
    // Restart auto-slide after 5 seconds of no interaction
    setTimeout(() => {
      if (activePromotions && activePromotions.length > 1) {
        startAutoSlide();
      }
    }, 5000);
  };

  const containerStyle = {
    ...styles.container,
    marginTop:
      customMarginTop !== undefined
        ? customMarginTop
        : styles.container.marginTop,
  };

  return (
    <View style={containerStyle}>
      <FlatList
        ref={flatListRef}
        data={activePromotions}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + BANNER_SPACING * 2}
        snapToAlignment="center"
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <PromotionBannerCard
            promotion={item}
            customHeight={customHeight}
            resizeMode={resizeMode}
            customAspectRatio={customAspectRatio}
            autoSizeToImage={autoSizeToImage}
          />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Slide indicators */}
      {showIndicators && activePromotions && activePromotions.length > 1 && (
        <View style={styles.paginationContainer}>
          {activePromotions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
              onPress={() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToIndex({
                    index: index,
                    animated: true,
                  });
                }
                // Reset and restart progress animation
                progressAnimation.setValue(0);
                Animated.timing(progressAnimation, {
                  toValue: 1,
                  duration: 5000,
                  useNativeDriver: false,
                }).start();
              }}
            >
              {index === currentIndex && (
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 26], // From 0 to 100% of active indicator width (26px)
                      }),
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: MARGIN.md, // Default margin for home screen
    marginHorizontal: -PADDING.screen, // Negative margin to extend beyond screen padding
    position: "relative", // Add relative positioning for absolute children
  },
  flatListContent: {
    paddingHorizontal: 0, // No padding for full width
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: BORDER_RADIUS.lg, // Add border radius for better appearance
    marginHorizontal: 0, // No margin for full width
    overflow: "hidden",
    position: "relative",
    // No shadow
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  placeholderBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.primary[500],
    justifyContent: "center",
    alignItems: "center",
    padding: PADDING.lg,
    // No border radius
  },
  placeholderText: {
    textAlign: "center",
    marginBottom: MARGIN.sm,
  },
  placeholderSubtext: {
    textAlign: "center",
  },
  defaultBannerContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2C5F5F", // Dark teal color
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.xl,
    paddingVertical: PADDING.lg,
    position: "relative",
  },
  defaultBannerText: {
    flex: 1,
    justifyContent: "center",
    paddingRight: PADDING.md,
  },
  defaultBannerSubtitle: {
    marginBottom: MARGIN.xs,
    fontSize: FONT_SIZE.caption1,
  },
  defaultBannerTitle: {
    marginBottom: MARGIN.xs,
    fontSize: FONT_SIZE.h4,
    fontWeight: "bold",
  },
  defaultBannerImage: {
    marginRight: PADDING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButton: {
    position: "absolute",
    right: PADDING.md,
    top: "50%",
    transform: [{ translateY: -15 }],
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingBanner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: BANNER_SPACING / 2,
  },
  loadingText: {
    textAlign: "center",
  },
  errorBanner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: COLORS.error[50],
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: BANNER_SPACING / 2,
  },
  errorText: {
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    paddingHorizontal: PADDING.screen,
  },
  paginationDot: {
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.neutral[300],
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.neutral[300], // Gray background for active indicator
    width: 26, // Active indicator is wider (26px)
    height: 4,
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: COLORS.primary[500],
    borderRadius: 2,
  },
});

export default PromotionBannerSlider;
