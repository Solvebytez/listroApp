import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ResponsiveText,
  ResponsiveCard,
  ResponsiveButton,
  GlobalStatusBar,
  AppHeader,
  DropdownCategorySelector,
  BusinessAddressForm,
  BusinessAddressList,
  ServiceImageUpload,
} from "@/components";
import { useBusinessAddresses } from "@/hooks/useBusinessAddresses";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
} from "@/constants";

interface FormData {
  title: string;
  contactNumber: string;
  whatsappNumber: string;
  categoryId: string | null;
  categoryPath: string[];
  description: string;
  image: string | null;
  selectedAddressId: string | null;
}

// Remove old static categories - now using dynamic CategorySelector

export default function AddListingScreen() {
  const router = useRouter();
  const { data: existingAddresses = [] } = useBusinessAddresses();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    contactNumber: "",
    whatsappNumber: "",
    categoryId: null,
    categoryPath: [],
    description: "",
    image: null,
    selectedAddressId: null,
  });
  const [categoryError, setCategoryError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showMultipleServices, setShowMultipleServices] = useState(false);
  const [multipleServices, setMultipleServices] = useState([
    {
      id: 1,
      name: "",
      description: "",
      price: "",
      discountPrice: "",
    },
  ]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategorySelect = (
    categoryId: string | null,
    categoryPath: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      categoryPath,
    }));
    setCategoryError(""); // Clear any previous error
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    Alert.alert(
      "Preview",
      "Preview functionality will show how the listing will appear to users"
    );
  };

  const handleMultipleServiceChange = (
    id: number,
    field: string,
    value: string
  ) => {
    setMultipleServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const addNewService = () => {
    const newId = Math.max(...multipleServices.map((s) => s.id)) + 1;
    setMultipleServices((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        description: "",
        price: "",
        discountPrice: "",
      },
    ]);
  };

  const removeService = (id: number) => {
    if (multipleServices.length > 1) {
      setMultipleServices((prev) =>
        prev.filter((service) => service.id !== id)
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a shop name");
      return;
    }
    if (!formData.categoryId) {
      setCategoryError("Please select a service category");
      Alert.alert("Error", "Please select a service category");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a service description");
      return;
    }
    if (!formData.contactNumber.trim()) {
      Alert.alert("Error", "Please enter a contact number");
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      Alert.alert("Error", "Please enter a WhatsApp number");
      return;
    }

    // Validate that at least one service is added
    const hasValidServices = multipleServices.some(
      (service) =>
        service.name.trim() &&
        service.description.trim() &&
        service.price.trim()
    );

    if (!hasValidServices) {
      Alert.alert(
        "Error",
        "Please add at least one service with name, description, and price"
      );
      return;
    }
    if (!formData.selectedAddressId) {
      Alert.alert("Error", "Please select a business address");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement actual API call to create listing
      // await serviceService.createListing(formData);

      Alert.alert("Success", "Your listing has been created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creating listing:", error);
      Alert.alert("Error", "Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GlobalStatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary[500]}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <View style={styles.container}>
          {/* Header */}
          <AppHeader
            onBackPress={() => router.back()}
            title="Add New Listing"
            subtext="Create a new service offering"
            rightActionButton={{
              iconName: "eye",
              onPress: handlePreview,
              backgroundColor: COLORS.primary[300],
              iconColor: COLORS.white,
            }}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Service Images Section */}
            <ResponsiveCard variant="elevated" style={styles.formCard}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.sectionTitle}
              >
                Service Image
              </ResponsiveText>

              <ServiceImageUpload
                image={formData.image}
                onImageChange={(image) =>
                  setFormData((prev) => ({ ...prev, image }))
                }
                showHint={true}
              />
            </ResponsiveCard>

            {/* Listing Details Section */}
            <ResponsiveCard variant="elevated" style={styles.formCard}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.sectionTitle}
              >
                Listing Details
              </ResponsiveText>
              <ResponsiveText
                variant="body2"
                color={COLORS.text.secondary}
                style={styles.sectionSubtitle}
              >
                Provide detailed information about your service
              </ResponsiveText>

              {/* Shop Name Input */}
              <View style={styles.inputGroup}>
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  Shop Name *
                </ResponsiveText>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your shop name"
                  placeholderTextColor={COLORS.text.secondary}
                  value={formData.title}
                  onChangeText={(text) => handleInputChange("title", text)}
                  maxLength={100}
                />
              </View>

              {/* Contact Number Input */}
              <View style={styles.inputGroup}>
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  Contact Number *
                </ResponsiveText>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your contact number"
                  placeholderTextColor={COLORS.text.secondary}
                  value={formData.contactNumber}
                  onChangeText={(text) =>
                    handleInputChange("contactNumber", text)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              {/* WhatsApp Number Input */}
              <View style={styles.inputGroup}>
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  WhatsApp Number *
                </ResponsiveText>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your WhatsApp number"
                  placeholderTextColor={COLORS.text.secondary}
                  value={formData.whatsappNumber}
                  onChangeText={(text) =>
                    handleInputChange("whatsappNumber", text)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              {/* Dynamic Category Selector */}
              <DropdownCategorySelector
                selectedCategoryId={formData.categoryId}
                onCategorySelect={handleCategorySelect}
                error={categoryError}
                maxLevels={5}
              />

              {/* Description Text Area */}
              <View style={styles.inputGroup}>
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  Detailed Description *
                </ResponsiveText>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your service in detail. Include what makes it special, benefits, duration, what to expect..."
                    placeholderTextColor={COLORS.text.secondary}
                    value={formData.description}
                    onChangeText={(text) =>
                      handleInputChange("description", text)
                    }
                    multiline
                    numberOfLines={6}
                    maxLength={1000}
                    textAlignVertical="top"
                  />
                  <View style={styles.characterCounter}>
                    <ResponsiveText
                      variant="caption2"
                      color={COLORS.text.secondary}
                    >
                      {formData.description.length}/1000 characters
                    </ResponsiveText>
                  </View>
                </View>
              </View>
            </ResponsiveCard>

            {/* Business Address Section */}
            <View style={styles.addAddressSection}>
              {/* Show selected address if one is selected */}
              {formData.selectedAddressId &&
                (() => {
                  const selectedAddress = existingAddresses.find(
                    (addr) => addr.id === formData.selectedAddressId
                  );
                  return selectedAddress ? (
                    <ResponsiveCard
                      variant="elevated"
                      style={styles.selectedAddressCard}
                    >
                      <ResponsiveText
                        variant="h6"
                        weight="bold"
                        style={styles.selectedAddressTitle}
                      >
                        Selected Address
                      </ResponsiveText>
                      <ResponsiveText
                        variant="body1"
                        weight="medium"
                        style={styles.addressName}
                      >
                        {selectedAddress.name}
                      </ResponsiveText>
                      <ResponsiveText
                        variant="body2"
                        color={COLORS.text.secondary}
                        style={styles.addressDetails}
                      >
                        {selectedAddress.address}
                      </ResponsiveText>
                      <ResponsiveText
                        variant="body2"
                        color={COLORS.text.secondary}
                        style={styles.addressDetails}
                      >
                        {selectedAddress.city}, {selectedAddress.state}{" "}
                        {selectedAddress.zipCode}
                      </ResponsiveText>
                      {selectedAddress.description && (
                        <ResponsiveText
                          variant="body2"
                          color={COLORS.text.secondary}
                          style={styles.addressDescription}
                        >
                          {selectedAddress.description}
                        </ResponsiveText>
                      )}
                    </ResponsiveCard>
                  ) : null;
                })()}

              {/* Address Button */}
              <ResponsiveButton
                title={
                  formData.selectedAddressId ? "Change Address" : "Add Address"
                }
                variant="outline"
                size="medium"
                fullWidth
                onPress={() => setShowAddressModal(true)}
                leftIcon={
                  <Ionicons
                    name={formData.selectedAddressId ? "pencil" : "add"}
                    size={16}
                    color={COLORS.primary[300]}
                  />
                }
              />
            </View>

            {/* Add Multiple Services Button */}
            <View style={styles.addMultipleServicesSection}>
              <ResponsiveButton
                title={
                  showMultipleServices
                    ? "Hide Multiple Services"
                    : "Add Multiple Services"
                }
                variant="outline"
                size="medium"
                fullWidth
                onPress={() => setShowMultipleServices(!showMultipleServices)}
                leftIcon={
                  <Ionicons
                    name={showMultipleServices ? "remove-circle" : "add-circle"}
                    size={16}
                    color={COLORS.primary[300]}
                  />
                }
              />
            </View>

            {/* Multiple Services Form */}
            {showMultipleServices && (
              <View style={styles.multipleServicesContainer}>
                <ResponsiveText
                  variant="h6"
                  weight="bold"
                  color={COLORS.text.primary}
                  style={styles.multipleServicesTitle}
                >
                  Multiple Services
                </ResponsiveText>
                <ResponsiveText
                  variant="body2"
                  color={COLORS.text.secondary}
                  style={styles.multipleServicesSubtitle}
                >
                  Add multiple service options with different pricing
                </ResponsiveText>

                {multipleServices.map((service, index) => (
                  <ResponsiveCard
                    key={service.id}
                    variant="elevated"
                    style={styles.serviceCard}
                  >
                    <View style={styles.serviceCardHeader}>
                      <ResponsiveText
                        variant="h6"
                        weight="bold"
                        color={COLORS.text.primary}
                      >
                        Service {index + 1}
                      </ResponsiveText>
                      {multipleServices.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeServiceButton}
                          onPress={() => removeService(service.id)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color={COLORS.error[500]}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Service Name */}
                    <View style={styles.inputGroup}>
                      <ResponsiveText
                        variant="inputLabel"
                        weight="medium"
                        color={COLORS.text.primary}
                        style={styles.inputLabel}
                      >
                        Service Name *
                      </ResponsiveText>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter service name"
                        placeholderTextColor={COLORS.text.secondary}
                        value={service.name}
                        onChangeText={(text) =>
                          handleMultipleServiceChange(service.id, "name", text)
                        }
                      />
                    </View>

                    {/* Service Description */}
                    <View style={styles.inputGroup}>
                      <ResponsiveText
                        variant="inputLabel"
                        weight="medium"
                        color={COLORS.text.primary}
                        style={styles.inputLabel}
                      >
                        Service Description *
                      </ResponsiveText>
                      <TextInput
                        style={styles.textArea}
                        placeholder="Describe this service"
                        placeholderTextColor={COLORS.text.secondary}
                        value={service.description}
                        onChangeText={(text) =>
                          handleMultipleServiceChange(
                            service.id,
                            "description",
                            text
                          )
                        }
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Price and Discount Row */}
                    <View style={styles.priceRow}>
                      {/* Service Price */}
                      <View style={[styles.inputGroup, styles.priceInputGroup]}>
                        <ResponsiveText
                          variant="inputLabel"
                          weight="medium"
                          color={COLORS.text.primary}
                          style={styles.inputLabel}
                        >
                          Price *
                        </ResponsiveText>
                        <TextInput
                          style={styles.textInput}
                          placeholder="0.00"
                          placeholderTextColor={COLORS.text.secondary}
                          value={service.price}
                          onChangeText={(text) =>
                            handleMultipleServiceChange(
                              service.id,
                              "price",
                              text
                            )
                          }
                          keyboardType="numeric"
                        />
                      </View>

                      {/* Discount Price */}
                      <View style={[styles.inputGroup, styles.priceInputGroup]}>
                        <ResponsiveText
                          variant="inputLabel"
                          weight="medium"
                          color={COLORS.text.primary}
                          style={styles.inputLabel}
                        >
                          Discount Price
                        </ResponsiveText>
                        <TextInput
                          style={styles.textInput}
                          placeholder="0.00"
                          placeholderTextColor={COLORS.text.secondary}
                          value={service.discountPrice}
                          onChangeText={(text) =>
                            handleMultipleServiceChange(
                              service.id,
                              "discountPrice",
                              text
                            )
                          }
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </ResponsiveCard>
                ))}

                {/* Add New Service Button */}
                <ResponsiveButton
                  title="Add Another Service"
                  variant="outline"
                  size="medium"
                  fullWidth
                  onPress={addNewService}
                  leftIcon={
                    <Ionicons
                      name="add"
                      size={16}
                      color={COLORS.primary[300]}
                    />
                  }
                  style={styles.addAnotherServiceButton}
                />
              </View>
            )}

            {/* Bottom Spacing for Fixed Button */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Fixed Bottom Button */}
          <View style={styles.fixedBottomButton}>
            <ResponsiveButton
              title="Create Listing"
              variant="primary"
              size="large"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
            />
          </View>

          {/* Address Modal */}
          <Modal
            visible={showAddressModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowAddressModal(false)}
          >
            <SafeAreaView style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowAddressModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
                <ResponsiveText
                  variant="h5"
                  weight="bold"
                  color={COLORS.text.primary}
                >
                  Select Addresses
                </ResponsiveText>
                <View style={styles.modalPlaceholder} />
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Existing Addresses Section */}
                <ResponsiveCard variant="elevated" style={styles.modalCard}>
                  <ResponsiveText
                    variant="h6"
                    weight="bold"
                    color={COLORS.text.primary}
                    style={styles.modalSectionTitle}
                  >
                    Existing Addresses
                  </ResponsiveText>

                  <BusinessAddressList
                    selectedAddressId={formData.selectedAddressId}
                    onAddressSelect={(addressId) => {
                      setFormData((prev) => ({
                        ...prev,
                        selectedAddressId: addressId,
                      }));
                    }}
                    onAddressDeselect={() => {
                      setFormData((prev) => ({
                        ...prev,
                        selectedAddressId: null,
                      }));
                    }}
                  />
                </ResponsiveCard>

                {/* Add New Address Section */}
                <ResponsiveCard variant="elevated" style={styles.modalCard}>
                  {showAddressForm ? (
                    <BusinessAddressForm
                      existingAddresses={existingAddresses}
                      onSuccess={() => {
                        setShowAddressForm(false);
                        // The BusinessAddressList will automatically refresh due to query invalidation
                      }}
                      onCancel={() => setShowAddressForm(false)}
                    />
                  ) : (
                    <View>
                      <ResponsiveText
                        variant="h6"
                        weight="bold"
                        color={COLORS.text.primary}
                        style={styles.modalSectionTitle}
                      >
                        Add New Address
                      </ResponsiveText>
                      <ResponsiveButton
                        title="Add New Address"
                        variant="primary"
                        size="medium"
                        onPress={() => setShowAddressForm(true)}
                        leftIcon={
                          <Ionicons name="add" size={16} color={COLORS.white} />
                        }
                        style={styles.addNewAddressButton}
                      />
                    </View>
                  )}
                </ResponsiveCard>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <ResponsiveButton
                  title="Cancel"
                  variant="danger"
                  size="medium"
                  onPress={() => setShowAddressModal(false)}
                  style={styles.modalCancelButton}
                  textStyle={styles.modalCancelButtonText}
                />
                <ResponsiveButton
                  title={`Done${formData.selectedAddressId ? " (1)" : ""}`}
                  variant="primary"
                  size="medium"
                  onPress={() => setShowAddressModal(false)}
                  style={styles.modalDoneButton}
                />
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING.screen,
    paddingBottom: 100, // Space for fixed button
  },
  formCard: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
  sectionTitle: {
    marginBottom: MARGIN.sm,
  },
  sectionSubtitle: {
    marginBottom: MARGIN.lg,
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
  inputGroup: {
    marginBottom: MARGIN.lg,
  },
  inputLabel: {
    marginBottom: MARGIN.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginTop: MARGIN.xs,
    zIndex: 1000,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary[50],
  },
  textAreaContainer: {
    position: "relative",
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingTop: 8,
    paddingBottom: 32, // Space for character counter
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    minHeight: 120,
  },
  compactTextArea: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: 12,
    paddingBottom: 32,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    minHeight: 120,
  },
  characterCounter: {
    position: "absolute",
    bottom: PADDING.sm,
    right: PADDING.md,
  },
  fixedBottomButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: PADDING.screen,
    paddingVertical: PADDING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    width: "100%",
  },
  bottomSpacing: {
    height: 100,
  },
  // Add Address Section Styles
  addAddressSection: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.md,
    alignItems: "center",
  },
  // Selected Address Card Styles
  selectedAddressCard: {
    width: "100%",
    marginBottom: MARGIN.md,
    padding: PADDING.md,
  },
  selectedAddressTitle: {
    marginBottom: MARGIN.sm,
    color: COLORS.primary[500],
  },
  addressName: {
    marginBottom: MARGIN.xs,
  },
  addressDetails: {
    marginBottom: MARGIN.xs,
  },
  addressDescription: {
    marginTop: MARGIN.xs,
    fontStyle: "italic",
  },
  // Add Multiple Services Section Styles
  addMultipleServicesSection: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.md,
    alignItems: "center",
  },
  // Multiple Services Form Styles
  multipleServicesContainer: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.lg,
  },
  multipleServicesTitle: {
    marginBottom: MARGIN.sm,
  },
  multipleServicesSubtitle: {
    marginBottom: MARGIN.lg,
  },
  serviceCard: {
    marginBottom: MARGIN.lg,
  },
  serviceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.lg,
  },
  removeServiceButton: {
    padding: PADDING.xs,
  },
  priceRow: {
    flexDirection: "row",
    gap: MARGIN.md,
  },
  priceInputGroup: {
    flex: 1,
  },
  addAnotherServiceButton: {
    marginTop: MARGIN.lg,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.screen,
    paddingVertical: MARGIN.md,
    backgroundColor: COLORS.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalCloseButton: {
    padding: PADDING.sm,
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
  },
  modalCard: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
  modalSectionTitle: {
    marginBottom: MARGIN.lg,
  },
  emptyAddressState: {
    alignItems: "center",
    paddingVertical: MARGIN.xl,
  },
  emptyAddressText: {
    textAlign: "center",
    marginTop: MARGIN.md,
  },
  addNewAddressButton: {
    marginTop: MARGIN.sm,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: PADDING.screen,
    paddingVertical: MARGIN.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: MARGIN.md,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalCancelButtonText: {
    color: COLORS.error[500],
  },
  modalDoneButton: {
    flex: 1,
  },
  // Inline Form Actions
  formActions: {
    marginTop: MARGIN.xs,
  },
  formCancelButton: {
    flex: 1,
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
  },
  formSaveButton: {
    flex: 1,
  },
});
