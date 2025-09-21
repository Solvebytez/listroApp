import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Share,
  Dimensions,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ResponsiveText,
  ResponsiveCard,
  ResponsiveButton,
  GlobalStatusBar,
} from "@/components";
import { useUser } from "@/hooks/useUser";
import { serviceService, ServiceListing } from "@/services/service";
import { useQuery } from "@tanstack/react-query";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
} from "@/constants";

const { width: screenWidth } = Dimensions.get("window");

interface ServiceDetailsScreenProps {}

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useUser();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "services" | "reviews" | "location"
  >("services");

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const [imageContainerHeight, setImageContainerHeight] = useState(300);
  const headerHeight = 100;

  // Calculate dynamic margin based on actual image container height
  const dynamicMarginTop = imageContainerHeight + 10; // Actual height + 20px gap

  // Fetch service details
  const {
    data: service,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["serviceDetails", id],
    queryFn: () => serviceService.getServiceListingById(id!),
    enabled: !!id,
  });

  // Check if user owns this service
  const isOwner = user && service && user.id === service.vendor?.user?.id;
  const isVendor = user?.role === "VENDOR";
  const isUser = user?.role === "USER";

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
    Alert.alert(
      "Favorite",
      isFavorite ? "Removed from favorites" : "Added to favorites"
    );
  };

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this service: ${service?.title}\n${service?.description}`,
        title: service?.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle edit service (vendor only)
  const handleEditService = () => {
    router.push(`/(dashboard)/(vendor)/edit-listing?id=${id}`);
  };

  // Handle toggle service status (vendor only)
  const handleToggleServiceStatus = () => {
    const isActive = service?.status === "ACTIVE";
    Alert.alert(
      "Toggle Service",
      `Are you sure you want to ${
        isActive ? "turn off" : "turn on"
      } this service?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // TODO: Implement service status toggle
            Alert.alert("Success", "Service status updated");
          },
        },
      ]
    );
  };

  // Handle book service (user only)
  const handleBookService = () => {
    Alert.alert(
      "Book Service",
      "Booking functionality will be implemented soon!",
      [{ text: "OK" }]
    );
  };

  // Handle enquiry
  const handleEnquiry = () => {
    Alert.alert("Enquiry", "Enquiry functionality will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  // Get price range from services
  const getPriceRange = () => {
    if (!service?.services || service.services.length === 0) return "₹0 - ₹0";
    const prices = service.services.map((s) => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return `₹${minPrice} - ₹${maxPrice}`;
  };

  // Get service count
  const getServiceCount = () => {
    return service?.services?.length || 0;
  };

  // Animation calculations
  const imageScale = scrollY.interpolate({
    inputRange: [0, imageContainerHeight],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, imageContainerHeight * 0.7],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [imageContainerHeight - 50, imageContainerHeight],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, 0],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [imageContainerHeight - 30, imageContainerHeight],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Loading state
  if (isLoading) {
    return (
      <>
        <GlobalStatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary[500]}
          translucent={false}
        />
        <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ResponsiveText variant="h6" color={COLORS.text.secondary}>
                Loading service details...
              </ResponsiveText>
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <>
        <GlobalStatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary[500]}
          translucent={false}
        />
        <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
          <View style={styles.container}>
            <View style={styles.errorContainer}>
              <ResponsiveText variant="h6" color={COLORS.error[600]}>
                Failed to load service details
              </ResponsiveText>
              <ResponsiveButton
                title="Try Again"
                variant="primary"
                onPress={() => router.back()}
                style={styles.retryButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <GlobalStatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary[500]}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <View style={styles.container}>
          {/* Fixed Header Overlay */}
          <Animated.View
            style={[
              styles.fixedHeaderOverlay,
              {
                backgroundColor: headerBackgroundOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["transparent", COLORS.primary[200]],
                  extrapolate: "clamp",
                }),
                transform: [{ translateY: headerTranslateY }],
                paddingTop: insets.top + MARGIN.sm,
                paddingBottom: MARGIN.xs + 5,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>

              <Animated.View
                style={[styles.headerTitleContainer, { opacity: titleOpacity }]}
              >
                <ResponsiveText
                  variant="h5"
                  weight="bold"
                  color={COLORS.white}
                  numberOfLines={1}
                >
                  {service?.title || "Service Details"}
                </ResponsiveText>
              </Animated.View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleToggleFavorite}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? COLORS.error[500] : COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Fixed Image Container */}
          {service.image && (
            <View
              style={styles.fixedImageContainer}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setImageContainerHeight(height);
              }}
            >
              <Animated.Image
                source={{ uri: service.image }}
                style={[
                  styles.serviceImage,
                  {
                    transform: [{ scale: imageScale }],
                    opacity: imageOpacity,
                  },
                ]}
              />
            </View>
          )}

          {/* Scrollable Content */}
          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {/* Service Details Card */}
            <View style={[styles.detailsCard, { marginTop: dynamicMarginTop }]}>
              {/* Title and Price Range */}
              <View style={styles.titleRow}>
                <View style={styles.titleContainer}>
                  <ResponsiveText variant="h3" style={styles.serviceTitle}>
                    {service.title}
                  </ResponsiveText>
                </View>
                <View style={styles.priceRangeContainer}>
                  <ResponsiveText variant="h5" style={styles.priceRange}>
                    {getPriceRange()}
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption1"
                    style={styles.priceRangeLabel}
                  >
                    Price Range
                  </ResponsiveText>
                </View>
              </View>

              {/* Rating and Status */}
              <View style={styles.ratingRow}>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color="#FF8C00"
                        style={styles.star}
                      />
                    ))}
                  </View>
                  <ResponsiveText variant="body2" style={styles.ratingText}>
                    4.7 (89 review)
                  </ResponsiveText>
                </View>
                <ResponsiveText variant="body2" style={styles.statusText}>
                  {service.status === "ACTIVE" ? "Open Now" : "Closed"}
                </ResponsiveText>
              </View>

              {/* Description */}
              <ResponsiveText variant="body1" style={styles.description}>
                {service.description}
              </ResponsiveText>

              {/* Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "services" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("services")}
                >
                  <ResponsiveText
                    variant="body2"
                    style={[
                      styles.tabText,
                      activeTab === "services" && styles.activeTabText,
                    ]}
                  >
                    Services {getServiceCount()}
                  </ResponsiveText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "reviews" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("reviews")}
                >
                  <ResponsiveText
                    variant="body2"
                    style={[
                      styles.tabText,
                      activeTab === "reviews" && styles.activeTabText,
                    ]}
                  >
                    Reviews (89)
                  </ResponsiveText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "location" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("location")}
                >
                  <ResponsiveText
                    variant="body2"
                    style={[
                      styles.tabText,
                      activeTab === "location" && styles.activeTabText,
                    ]}
                  >
                    Location
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Services List */}
            {activeTab === "services" && (
              <View style={styles.servicesList}>
                {service.services?.map((serviceItem, index) => (
                  <View key={serviceItem.id} style={styles.serviceItem}>
                    <View style={styles.serviceInfo}>
                      <ResponsiveText variant="h6" style={styles.serviceName}>
                        {serviceItem.name}
                      </ResponsiveText>
                      <ResponsiveText
                        variant="body2"
                        style={styles.serviceDescription}
                      >
                        {serviceItem.description}
                      </ResponsiveText>

                      <View style={styles.serviceMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={COLORS.text.secondary}
                          />
                          <ResponsiveText
                            variant="caption1"
                            style={styles.metaText}
                          >
                            60 min.
                          </ResponsiveText>
                        </View>
                        <View style={styles.metaItem}>
                          <View style={styles.categoryDot} />
                          <ResponsiveText
                            variant="caption1"
                            style={styles.metaText}
                          >
                            {service.categoryPath?.[0] || "Service"}
                          </ResponsiveText>
                        </View>
                      </View>
                    </View>

                    <View style={styles.servicePriceContainer}>
                      <ResponsiveText variant="h6" style={styles.servicePrice}>
                        ₹{serviceItem.price}
                      </ResponsiveText>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Reviews Tab Content */}
            {activeTab === "reviews" && (
              <View style={styles.tabContent}>
                <ResponsiveText variant="body1" style={styles.tabPlaceholder}>
                  Reviews will be displayed here
                </ResponsiveText>
              </View>
            )}

            {/* Location Tab Content */}
            {activeTab === "location" && (
              <View style={styles.tabContent}>
                {service.address && (
                  <View style={styles.locationContent}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={COLORS.primary[600]}
                    />
                    <ResponsiveText variant="body2" style={styles.addressText}>
                      {service.address.address}
                    </ResponsiveText>
                  </View>
                )}
              </View>
            )}

            {/* Additional Content for Scroll Testing */}
            <View style={styles.additionalContent}>
              <ResponsiveText variant="h5" style={styles.sectionTitle}>
                About This Service
              </ResponsiveText>
              <ResponsiveText variant="body1" style={styles.contentText}>
                Experience the ultimate in relaxation and wellness with our
                premium spa services. Our skilled therapists are trained in the
                latest techniques to provide you with an unforgettable
                experience. We use only the finest products and maintain the
                highest standards of hygiene and safety.
              </ResponsiveText>

              <ResponsiveText variant="h5" style={styles.sectionTitle}>
                What to Expect
              </ResponsiveText>
              <ResponsiveText variant="body1" style={styles.contentText}>
                When you visit our spa, you'll be greeted by our friendly staff
                and guided through a consultation to understand your needs. Our
                treatment rooms are designed for maximum comfort and relaxation,
                featuring calming music and aromatherapy to enhance your
                experience.
              </ResponsiveText>

              <ResponsiveText variant="h5" style={styles.sectionTitle}>
                Our Facilities
              </ResponsiveText>
              <ResponsiveText variant="body1" style={styles.contentText}>
                • Private treatment rooms with individual climate control •
                Relaxation lounge with complimentary refreshments • Modern
                shower facilities with premium amenities • Free WiFi and
                charging stations • Complimentary parking for all guests
              </ResponsiveText>

              <ResponsiveText variant="h5" style={styles.sectionTitle}>
                Booking Information
              </ResponsiveText>
              <ResponsiveText variant="body1" style={styles.contentText}>
                We recommend booking your appointment at least 24 hours in
                advance to ensure availability. All treatments include a
                consultation, the main service, and post-treatment care
                instructions. Please arrive 15 minutes early for your
                appointment to allow time for check-in and preparation.
              </ResponsiveText>

              <ResponsiveText variant="h5" style={styles.sectionTitle}>
                Cancellation Policy
              </ResponsiveText>
              <ResponsiveText variant="body1" style={styles.contentText}>
                We understand that plans can change. Please provide at least 4
                hours notice for cancellations to avoid any charges. Same-day
                cancellations or no-shows may be subject to a 50% service
                charge. We appreciate your understanding and cooperation.
              </ResponsiveText>

              <ResponsiveText variant="h5" style={styles.sectionTitle}>
                Customer Reviews
              </ResponsiveText>
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <ResponsiveText variant="body1" style={styles.reviewerName}>
                    Sarah Johnson
                  </ResponsiveText>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color="#FF8C00"
                      />
                    ))}
                  </View>
                </View>
                <ResponsiveText variant="body2" style={styles.reviewText}>
                  "Absolutely amazing experience! The staff was professional and
                  the facilities were spotless. I felt completely relaxed and
                  rejuvenated. Highly recommend!"
                </ResponsiveText>
              </View>

              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <ResponsiveText variant="body1" style={styles.reviewerName}>
                    Michael Chen
                  </ResponsiveText>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color="#FF8C00"
                      />
                    ))}
                  </View>
                </View>
                <ResponsiveText variant="body2" style={styles.reviewText}>
                  "Best spa in the city! The deep tissue massage was exactly
                  what I needed. The therapist was skilled and attentive to my
                  needs. Will definitely be back!"
                </ResponsiveText>
              </View>

              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <ResponsiveText variant="body1" style={styles.reviewerName}>
                    Emily Rodriguez
                  </ResponsiveText>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color="#FF8C00"
                      />
                    ))}
                  </View>
                </View>
                <ResponsiveText variant="body2" style={styles.reviewText}>
                  "Perfect for a girls' day out! We had the facial treatment and
                  it was incredible. The products used were high quality and my
                  skin felt amazing afterwards. Great value for money!"
                </ResponsiveText>
              </View>
            </View>

            {/* Bottom Spacing */}
          </Animated.ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* User Actions */}
            {isUser && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.enquiryButton}
                  onPress={handleEnquiry}
                >
                  <ResponsiveText
                    variant="body1"
                    style={styles.enquiryButtonText}
                  >
                    Enquiry Now
                  </ResponsiveText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookService}
                >
                  <ResponsiveText variant="body1" style={styles.bookButtonText}>
                    Book Now
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
            )}

            {/* Vendor Actions - Own Service */}
            {isVendor && isOwner && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.enquiryButton}
                  onPress={handleToggleServiceStatus}
                >
                  <ResponsiveText
                    variant="body1"
                    style={styles.enquiryButtonText}
                  >
                    {service.status === "ACTIVE" ? "Turn Off" : "Turn On"}
                  </ResponsiveText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleEditService}
                >
                  <ResponsiveText variant="body1" style={styles.bookButtonText}>
                    Edit Service
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
            )}

            {/* Vendor Actions - Other's Service */}
            {isVendor && !isOwner && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.enquiryButton}
                  onPress={handleEnquiry}
                >
                  <ResponsiveText
                    variant="body1"
                    style={styles.enquiryButtonText}
                  >
                    Enquiry Now
                  </ResponsiveText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookService}
                >
                  <ResponsiveText variant="body1" style={styles.bookButtonText}>
                    Book Now
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: PADDING.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: PADDING.lg,
  },
  retryButton: {
    marginTop: MARGIN.md,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 20, // Small bottom spacing
  },

  // Image Section
  imageContainer: {
    position: "relative",
    height: 300,
  },
  fixedImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  fixedHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING.screen,
    zIndex: 3,
    backgroundColor: "transparent",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: 12,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    flexShrink: 0,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDots: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeDot: {
    backgroundColor: COLORS.black,
  },

  // Details Card
  detailsCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
    marginRight: 20,
  },
  serviceTitle: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    fontSize: 24,
    lineHeight: 28,
  },
  priceRangeContainer: {
    alignItems: "flex-end",
  },
  priceRange: {
    color: "#4A90E2",
    fontWeight: "bold",
    fontSize: 18,
  },
  priceRangeLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  statusText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  description: {
    color: COLORS.text.secondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: COLORS.white,
  },
  activeTab: {
    backgroundColor: "#4A90E2",
  },
  tabText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.white,
  },

  // Services List
  servicesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    color: COLORS.text.primary,
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  serviceDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
  },
  servicePriceContainer: {
    alignItems: "flex-end",
  },
  servicePrice: {
    color: "#4A90E2",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Tab Content
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabPlaceholder: {
    color: COLORS.text.secondary,
    textAlign: "center",
    paddingVertical: 40,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 20,
  },
  addressText: {
    flex: 1,
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  // Additional Content
  additionalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    marginTop: 20,
  },
  contentText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  reviewItem: {
    backgroundColor: COLORS.neutral[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    color: COLORS.text.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },

  // Action Buttons
  actionButtonsContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area bottom
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  enquiryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  enquiryButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  bookButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
