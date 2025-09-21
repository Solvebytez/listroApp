import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
} from "../../../constants";
import { ResponsiveText, GlobalStatusBar } from "@/components";
// Import SearchPromotionBanner component
import { SearchPromotionBanner } from "@/components/user/SearchPromotionBanner";
import {
  usePopularServices,
  useInfiniteServiceListingsWithExclusion,
  flattenInfiniteServiceListings,
} from "../../../hooks/useServiceListings";

// Get screen dimensions
const { width: screenWidth } = Dimensions.get("window");

// Main filter categories
const mainFilterOptions = [
  { id: "sort", label: "Sort Options", icon: "swap-vertical-outline" },
  { id: "category", label: "Category Filters", icon: "grid-outline" },
  { id: "price", label: "Price Range Filters", icon: "cash-outline" },
  { id: "rating", label: "Rating Filters", icon: "star-outline" },
  { id: "availability", label: "Availability", icon: "time-outline" },
  { id: "hours", label: "Business Hours", icon: "business-outline" },
];

// Sub-filter options for each main category
const subFilterOptions = {
  sort: [
    { id: "top-rated", label: "Top Rated", icon: "star" },
    { id: "price-low-high", label: "Price: Low to High", icon: "arrow-up" },
    { id: "price-high-low", label: "Price: High to Low", icon: "arrow-down" },
    { id: "newest", label: "Newest First", icon: "calendar" },
    { id: "oldest", label: "Oldest First", icon: "calendar-outline" },
    { id: "most-popular", label: "Most Popular", icon: "people" },
    { id: "most-reviewed", label: "Most Reviewed", icon: "chatbubbles" },
  ],
  category: [
    { id: "all", label: "All Categories", icon: "grid" },
    { id: "fitness", label: "Fitness", icon: "fitness" },
    { id: "beauty", label: "Beauty", icon: "sparkles" },
    { id: "home", label: "Home", icon: "home" },
    { id: "professional", label: "Professional", icon: "briefcase" },
    { id: "education", label: "Education", icon: "school" },
    { id: "food", label: "Food", icon: "restaurant" },
    { id: "transport", label: "Transport", icon: "car" },
    { id: "tech", label: "Tech", icon: "laptop" },
    { id: "entertainment", label: "Entertainment", icon: "musical-notes" },
  ],
  price: [
    { id: "any", label: "Any Price", icon: "cash" },
    { id: "under-500", label: "Under ₹500", icon: "cash-outline" },
    { id: "500-1000", label: "₹500 - ₹1000", icon: "cash-outline" },
    { id: "1000-2500", label: "₹1000 - ₹2500", icon: "cash-outline" },
    { id: "2500-5000", label: "₹2500 - ₹5000", icon: "cash-outline" },
    { id: "above-5000", label: "Above ₹5000", icon: "cash-outline" },
  ],
  rating: [
    { id: "any", label: "Any Rating", icon: "star-outline" },
    { id: "4.5+", label: "4.5+ Stars", icon: "star" },
    { id: "4.0+", label: "4.0+ Stars", icon: "star" },
    { id: "3.5+", label: "3.5+ Stars", icon: "star" },
    { id: "3.0+", label: "3.0+ Stars", icon: "star" },
    { id: "below-3", label: "Below 3 Stars", icon: "star-outline" },
  ],
  availability: [
    { id: "now", label: "Available Now", icon: "time" },
    { id: "today", label: "Today", icon: "calendar" },
    { id: "this-week", label: "This Week", icon: "calendar-outline" },
    { id: "weekend", label: "Weekend Only", icon: "calendar-outline" },
    { id: "any-time", label: "Any Time", icon: "time-outline" },
  ],
  hours: [
    { id: "open-now", label: "Open Now", icon: "checkmark-circle" },
    { id: "24-7", label: "24/7 Available", icon: "moon" },
    { id: "weekdays", label: "Weekdays Only", icon: "business" },
    { id: "weekends", label: "Weekends Only", icon: "calendar-outline" },
  ],
};

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("sort");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    sort: "top-rated",
    category: "all",
    price: "any",
    rating: "any",
    availability: "any-time",
    hours: "any",
  });
  const insets = useSafeAreaInsets();

  // Debounce search text to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch top-rated services by default
  const {
    data: topRatedServices,
    isLoading: topRatedLoading,
    error: topRatedError,
  } = usePopularServices(10, true);

  // Use infinite query for all services with pagination and search
  const {
    data: infiniteServicesData,
    isLoading: servicesLoading,
    error: servicesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteServiceListingsWithExclusion(
    {
      limit: 10,
      isActive: true,
      sortBy: "rating",
      sortOrder: "desc",
      search: debouncedSearchText.trim() || undefined, // Add debounced search parameter
    },
    true
  );

  // Flatten infinite query data
  const allServices = flattenInfiniteServiceListings(infiniteServicesData);

  // Always use infinite query data for FlatList to enable infinite scrolling
  const searchResults = allServices || [];

  const handleCloseSearch = () => {
    router.back();
  };

  // Skeleton loading component for service cards
  const ServiceCardSkeleton = () => (
    <View style={styles.cardContainer}>
      <View style={styles.searchResultCard}>
        <View style={[styles.imageContainer, styles.skeletonImage]} />
        <View style={styles.resultDetails}>
          <View
            style={[styles.skeletonText, { width: "60%", marginBottom: 6 }]}
          />
          <View
            style={[styles.skeletonText, { width: "80%", marginBottom: 4 }]}
          />
          <View
            style={[styles.skeletonText, { width: "70%", marginBottom: 6 }]}
          />
          <View
            style={[styles.skeletonText, { width: "40%", marginBottom: 6 }]}
          />
          <View style={[styles.skeletonText, { width: "30%" }]} />
        </View>
      </View>
    </View>
  );

  // Memoize the service item render function to prevent unnecessary re-renders
  const renderServiceItem = useMemo(
    () =>
      ({ item: service }: { item: any }) => {
        // Get the first service for pricing
        const firstService = service.services?.[0];
        const price = firstService?.price || firstService?.discountPrice;
        const discountPrice = firstService?.discountPrice;
        const discountPercentage =
          discountPrice && price
            ? Math.round(((price - discountPrice) / price) * 100)
            : 0;

        return (
          <View style={styles.cardContainer}>
            <View style={styles.searchResultCard}>
              <View style={styles.imageContainer}>
                <Image
                  source={
                    service.image
                      ? { uri: service.image }
                      : require("../../../assets/user.png")
                  }
                  style={styles.resultImage}
                />
                {/* Heart Icon */}
                <TouchableOpacity style={styles.heartIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.resultDetails}>
                {/* Category */}
                <ResponsiveText
                  variant="caption2"
                  weight="medium"
                  color={COLORS.primary[500]}
                  style={styles.categoryText}
                >
                  {service.categoryPath?.join(" > ") ||
                    service.category?.name ||
                    "General"}
                </ResponsiveText>

                {/* Service Title */}
                <ResponsiveText
                  variant="body2"
                  weight="bold"
                  color={COLORS.text.primary}
                  style={styles.serviceTitle}
                  numberOfLines={1}
                >
                  {service.title}
                </ResponsiveText>

                {/* Sub Services */}
                {service.services && service.services.length > 0 && (
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.text.secondary}
                    style={styles.subServicesText}
                    numberOfLines={1}
                  >
                    {service.services
                      .map((subService: any) => subService.name)
                      .join(", ")}
                  </ResponsiveText>
                )}

                {/* Rating and Reviews */}
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color={COLORS.warning[500]} />
                  <ResponsiveText
                    variant="caption2"
                    weight="medium"
                    color={COLORS.text.primary}
                    style={styles.ratingText}
                  >
                    {service.rating?.toFixed(1) || "0.0"} (
                    {service.totalReviews || 0})
                  </ResponsiveText>
                </View>

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <View style={styles.discountContainer}>
                    <Ionicons
                      name="diamond"
                      size={10}
                      color={COLORS.primary[500]}
                    />
                    <ResponsiveText
                      variant="caption2"
                      weight="bold"
                      color={COLORS.primary[500]}
                      style={styles.discountText}
                    >
                      -{discountPercentage}%
                    </ResponsiveText>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      },
    []
  );

  // Memoize the promotion banner to prevent re-rendering
  const promotionBanner = useMemo(
    () => (
      <View style={styles.promotionContainer}>
        <SearchPromotionBanner />
      </View>
    ),
    []
  );

  // Memoize the list header to prevent unnecessary re-renders
  const renderListHeader = useMemo(
    () => (
      <>
        {/* Promotion Banner Slider */}
        {promotionBanner}

        {/* Search Results Header */}
        <View style={styles.searchResultsContainer}>
          <ResponsiveText
            variant="h5"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.resultsCount}
          >
            {debouncedSearchText
              ? `${
                  searchResults?.length || 0
                } results for "${debouncedSearchText}"`
              : `${searchResults?.length || 0} services`}
          </ResponsiveText>
        </View>
      </>
    ),
    [promotionBanner, debouncedSearchText, searchResults?.length]
  );

  // Memoize the list footer to prevent unnecessary re-renders
  const renderListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingContainer}>
          <ResponsiveText>Loading more services...</ResponsiveText>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  return (
    <>
      <GlobalStatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary[500]}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.container}>
          {/* Top Navigation Bar */}
          <View
            style={[
              styles.searchHeader,
              { paddingTop: insets.top + MARGIN.sm },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCloseSearch}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color={COLORS.text.light}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search for service"
                placeholderTextColor={COLORS.text.light}
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>
          </View>

          {/* Horizontal Filter Bar */}
          <View style={styles.filterBarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBarContent}
            >
              {mainFilterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    activeFilter === option.id && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setActiveFilter(option.id);
                    setShowFilterPanel(true);
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={
                      activeFilter === option.id
                        ? COLORS.white
                        : COLORS.text.secondary
                    }
                  />
                  <ResponsiveText
                    variant="caption2"
                    weight="medium"
                    color={
                      activeFilter === option.id
                        ? COLORS.white
                        : COLORS.text.secondary
                    }
                    style={styles.filterOptionText}
                  >
                    {option.label}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Modal */}
          <Modal
            visible={showFilterPanel}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowFilterPanel(false)}
          >
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <ResponsiveText variant="h3" weight="bold">
                  {
                    mainFilterOptions.find((opt) => opt.id === activeFilter)
                      ?.label
                  }
                </ResponsiveText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFilterPanel(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContentContainer}
              >
                {subFilterOptions[
                  activeFilter as keyof typeof subFilterOptions
                ]?.map((subOption) => (
                  <TouchableOpacity
                    key={subOption.id}
                    style={[
                      styles.modalSubFilterOption,
                      selectedFilters[
                        activeFilter as keyof typeof selectedFilters
                      ] === subOption.id && styles.modalSubFilterOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        [activeFilter]: subOption.id,
                      }));
                      setShowFilterPanel(false);
                    }}
                  >
                    <View style={styles.modalSubFilterLeft}>
                      <View
                        style={[
                          styles.modalSubFilterIcon,
                          selectedFilters[
                            activeFilter as keyof typeof selectedFilters
                          ] === subOption.id && styles.modalSubFilterIconActive,
                        ]}
                      >
                        <Ionicons
                          name={subOption.icon as any}
                          size={20}
                          color={
                            selectedFilters[
                              activeFilter as keyof typeof selectedFilters
                            ] === subOption.id
                              ? COLORS.white
                              : COLORS.text.secondary
                          }
                        />
                      </View>
                      <ResponsiveText
                        variant="body1"
                        weight="medium"
                        color={
                          selectedFilters[
                            activeFilter as keyof typeof selectedFilters
                          ] === subOption.id
                            ? COLORS.primary[500]
                            : COLORS.text.primary
                        }
                        style={styles.modalSubFilterOptionText}
                      >
                        {subOption.label}
                      </ResponsiveText>
                    </View>
                    {selectedFilters[
                      activeFilter as keyof typeof selectedFilters
                    ] === subOption.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={COLORS.primary[500]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </Modal>

          {/* Scrollable Content with Infinite Loading */}
          {servicesLoading &&
          (!topRatedServices?.data?.listings ||
            topRatedServices.data.listings.length === 0) ? (
            <View style={styles.loadingContainer}>
              <ResponsiveText>Loading services...</ResponsiveText>
            </View>
          ) : servicesError ? (
            <View style={styles.loadingContainer}>
              <ResponsiveText>
                Error loading services. Please try again.
              </ResponsiveText>
            </View>
          ) : (
            <FlatList
              style={styles.scrollableContent}
              data={
                (servicesLoading && searchResults.length === 0) ||
                (debouncedSearchText && servicesLoading)
                  ? Array(6).fill(null)
                  : searchResults
              }
              renderItem={({ item, index }) =>
                (servicesLoading && searchResults.length === 0) ||
                (debouncedSearchText && servicesLoading) ? (
                  <ServiceCardSkeleton key={`skeleton-${index}`} />
                ) : (
                  renderServiceItem({ item })
                )
              }
              keyExtractor={(item, index) =>
                (servicesLoading && searchResults.length === 0) ||
                (debouncedSearchText && servicesLoading)
                  ? `skeleton-${index}`
                  : `${item?.id}-${index}`
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContentContainer}
              ListHeaderComponent={renderListHeader}
              ListFooterComponent={renderListFooter}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.1}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING.screen,
    paddingTop: MARGIN.sm,
    paddingBottom: MARGIN.md,
    backgroundColor: COLORS.primary[200],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxxl,
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 24,
    marginLeft: MARGIN.md,
    marginRight: 0,
  },
  searchIcon: {
    marginRight: MARGIN.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.body2,
    color: COLORS.primary[200],
  },
  promotionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: PADDING.screen,
    marginTop: MARGIN.md, // Gap at top
    marginBottom: MARGIN.md, // Gap at bottom
    padding: 0, // Remove padding to let banner fill container
    overflow: "hidden", // Ensure banner respects container bounds
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1, // Ensure container takes full height
    paddingBottom: 20, // Add some bottom padding for better UX
  },
  searchResultsContainer: {
    paddingHorizontal: PADDING.screen,
    paddingBottom: MARGIN.sm,
  },
  resultsCount: {
    marginBottom: MARGIN.xs,
  },
  loadingContainer: {
    padding: PADDING.md,
    alignItems: "center",
  },
  searchResultCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: PADDING.screen,
    height: 140,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContainer: {
    backgroundColor: "#F8F9FA",
    paddingVertical: MARGIN.sm,
  },
  imageContainer: {
    position: "relative",
    width: 120,
    height: 140,
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  heartIcon: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultDetails: {
    flex: 1,
    padding: PADDING.md,
    justifyContent: "space-between",
  },
  categoryText: {
    marginBottom: 6,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  serviceTitle: {
    marginBottom: 4,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  subServicesText: {
    marginBottom: 6,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 3,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountText: {
    marginLeft: 3,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  // Skeleton loading styles
  skeletonImage: {
    backgroundColor: COLORS.neutral[200],
    borderRadius: 0,
  },
  skeletonText: {
    height: 12,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 6,
  },
  // Filter bar styles
  filterBarContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingVertical: MARGIN.sm,
  },
  filterBarContent: {
    paddingHorizontal: PADDING.screen,
    gap: MARGIN.sm,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    gap: MARGIN.xs,
    minWidth: 80,
    justifyContent: "center",
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary[200],
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING.screen,
    paddingVertical: PADDING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: PADDING.screen,
    paddingVertical: PADDING.md,
  },
  // Modal sub-filter option styles
  modalSubFilterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: PADDING.lg,
    paddingHorizontal: PADDING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: MARGIN.sm,
    backgroundColor: COLORS.neutral[50],
  },
  modalSubFilterOptionActive: {
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  modalSubFilterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: MARGIN.md,
  },
  modalSubFilterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubFilterIconActive: {
    backgroundColor: COLORS.primary[500],
  },
  modalSubFilterOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
});
