import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { ResponsiveText } from "../UI/ResponsiveText";
import { COLORS } from "../../constants";
import { useOfflineCategories } from "../../hooks/useOfflineCategories";
import { CategoryTreeNode } from "../../utils/categoryTreeUtils";

interface DropdownCategorySelectorProps {
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null, categoryPath: string[]) => void;
  error?: string;
  maxLevels?: number;
}

interface CategoryLevel {
  categories: CategoryTreeNode[];
  selectedId: string | null;
  selectedName: string | null;
}

interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  categories: CategoryTreeNode[];
  selectedId: string | null;
  onSelect: (category: CategoryTreeNode) => void;
  title: string;
}

const DropdownModal: React.FC<DropdownModalProps> = ({
  visible,
  onClose,
  categories,
  selectedId,
  onSelect,
  title,
}) => {
  const renderCategoryItem = ({ item }: { item: CategoryTreeNode }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedId === item.id && styles.selectedModalItem,
      ]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <ResponsiveText
        variant="body1"
        style={[
          styles.modalItemText,
          selectedId === item.id && styles.selectedModalItemText,
        ]}
      >
        {item.name}
      </ResponsiveText>
      {item.children && item.children.length > 0 && (
        <ResponsiveText variant="caption1" style={styles.modalItemCount}>
          {item.children.length} subcategories
        </ResponsiveText>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ResponsiveText variant="h6" style={styles.modalTitle}>
              {title}
            </ResponsiveText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ResponsiveText variant="h6" style={styles.closeButtonText}>
                ×
              </ResponsiveText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const DropdownCategorySelector: React.FC<
  DropdownCategorySelectorProps
> = ({ selectedCategoryId, onCategorySelect, error, maxLevels = 4 }) => {
  const [categoryLevels, setCategoryLevels] = useState<CategoryLevel[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<number | null>(null);

  // Get category tree data
  const {
    data: categoryTree,
    isLoading,
    error: treeError,
  } = useOfflineCategories();

  // Initialize with root categories
  useEffect(() => {
    if (categoryTree && categoryTree.length > 0) {
      setCategoryLevels([
        {
          categories: categoryTree,
          selectedId: null,
          selectedName: null,
        },
      ]);
    }
  }, [categoryTree]);

  // Handle category selection at any level
  const handleCategorySelect = (category: CategoryTreeNode, level: number) => {
    const newLevels = [...categoryLevels];

    // Update the selected category at this level
    newLevels[level] = {
      ...newLevels[level],
      selectedId: category.id,
      selectedName: category.name,
    };

    // Remove all levels after this one
    newLevels.splice(level + 1);

    // If this category has children, add a new level
    if (
      category.children &&
      category.children.length > 0 &&
      level < maxLevels - 1
    ) {
      newLevels.push({
        categories: category.children,
        selectedId: null,
        selectedName: null,
      });
    }

    setCategoryLevels(newLevels);

    // Build the category path
    const path: string[] = [];
    for (let i = 0; i <= level; i++) {
      if (newLevels[i].selectedName) {
        path.push(newLevels[i].selectedName);
      }
    }

    setSelectedPath(path);
    onCategorySelect(category.id, path);
  };

  // Handle "None" selection (clear selection)
  const handleNoneSelect = (level: number) => {
    const newLevels = [...categoryLevels];

    // Clear selection at this level
    newLevels[level] = {
      ...newLevels[level],
      selectedId: null,
      selectedName: null,
    };

    // Remove all levels after this one
    newLevels.splice(level + 1);

    setCategoryLevels(newLevels);

    // Build the category path
    const path: string[] = [];
    for (let i = 0; i < level; i++) {
      if (newLevels[i].selectedName) {
        path.push(newLevels[i].selectedName);
      }
    }

    setSelectedPath(path);

    // If this is the first level, clear everything
    if (level === 0) {
      onCategorySelect(null, []);
    } else {
      // Find the parent category ID
      const parentCategory = newLevels[level - 1].categories.find(
        (cat) => cat.id === newLevels[level - 1].selectedId
      );
      onCategorySelect(parentCategory?.id || null, path);
    }
  };

  // Render dropdown level
  const renderDropdownLevel = (level: number) => {
    const categoryLevel = categoryLevels[level];
    if (!categoryLevel) return null;

    const levelName = level === 0 ? "Main Category" : `Subcategory ${level}`;
    const displayText = categoryLevel.selectedName || "Select...";

    return (
      <View key={level} style={styles.dropdownContainer}>
        <ResponsiveText variant="body2" style={styles.dropdownLabel}>
          {levelName}:
        </ResponsiveText>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setActiveModal(level)}
        >
          <ResponsiveText
            variant="body1"
            style={[
              styles.dropdownText,
              !categoryLevel.selectedName && styles.placeholderText,
            ]}
          >
            {displayText}
          </ResponsiveText>
          <ResponsiveText variant="body1" style={styles.dropdownArrow}>
            ▼
          </ResponsiveText>
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <DropdownModal
          visible={activeModal === level}
          onClose={() => setActiveModal(null)}
          categories={categoryLevel.categories}
          selectedId={categoryLevel.selectedId}
          onSelect={(category) => handleCategorySelect(category, level)}
          title={levelName}
        />
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary[500]} />
          <ResponsiveText variant="body1" style={styles.loadingText}>
            Loading categories...
          </ResponsiveText>
        </View>
      </View>
    );
  }

  // Error state
  if (treeError) {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.errorContainer}>
          <ResponsiveText variant="body1" style={styles.errorText}>
            Failed to load categories: {treeError.message}
          </ResponsiveText>
        </View>
      </View>
    );
  }

  // No data state
  if (!categoryTree || categoryTree.length === 0) {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.noDataContainer}>
          <ResponsiveText variant="body1" style={styles.noDataText}>
            No categories available
          </ResponsiveText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inputGroup}>
      {/* Selected Path Display */}
      {selectedPath.length > 0 && (
        <View style={styles.selectedPathContainer}>
          <ResponsiveText variant="body2" style={styles.selectedPathLabel}>
            Selected: {selectedPath.join(" > ")}
          </ResponsiveText>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorMessageContainer}>
          <ResponsiveText variant="caption1" style={styles.errorMessage}>
            {error}
          </ResponsiveText>
        </View>
      )}

      {/* Dropdown Levels */}
      <View style={styles.dropdownsContainer}>
        {categoryLevels.map((_, index) => renderDropdownLevel(index))}
      </View>

      {/* Clear All Button */}
      {selectedCategoryId && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setCategoryLevels([
              {
                categories: categoryTree,
                selectedId: null,
                selectedName: null,
              },
            ]);
            setSelectedPath([]);
            onCategorySelect(null, []);
          }}
        >
          <ResponsiveText variant="body2" style={styles.clearButtonText}>
            Clear All Selections
          </ResponsiveText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  selectedPathContainer: {
    padding: 12,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  selectedPathLabel: {
    color: COLORS.primary[600],
    fontWeight: "600",
  },
  errorMessageContainer: {
    padding: 12,
    backgroundColor: COLORS.error[50],
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.error[200],
  },
  errorMessage: {
    color: COLORS.error[600],
  },
  dropdownsContainer: {
    // Remove padding to match form styling
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    color: COLORS.text.primary,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
  },
  dropdownText: {
    color: COLORS.text.primary,
    fontWeight: "500",
    flex: 1,
    fontSize: 14,
  },
  placeholderText: {
    color: COLORS.text.secondary,
  },
  dropdownArrow: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 20,
    maxHeight: "70%",
    minWidth: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalTitle: {
    color: COLORS.neutral[800],
    fontWeight: "600",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.neutral[200],
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: COLORS.neutral[600],
    fontSize: 18,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  selectedModalItem: {
    backgroundColor: COLORS.primary[50],
  },
  modalItemText: {
    color: COLORS.neutral[800],
    fontWeight: "500",
  },
  selectedModalItemText: {
    color: COLORS.primary[600],
    fontWeight: "600",
  },
  modalItemCount: {
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error[300],
    borderRadius: 8,
    backgroundColor: COLORS.error[50],
  },
  errorText: {
    color: COLORS.error[600],
    textAlign: "center",
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
  },
  noDataText: {
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  clearButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.error[300],
    borderRadius: 8,
    backgroundColor: COLORS.error[50],
  },
  clearButtonText: {
    color: COLORS.error[600],
    fontWeight: "500",
  },
});

export default DropdownCategorySelector;
