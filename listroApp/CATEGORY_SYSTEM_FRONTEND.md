# Frontend Category System Implementation

This document describes the frontend implementation of the nested category system for the Listro app.

## Overview

The frontend category system provides a dynamic, cascading category selector that allows users to navigate through nested categories with unlimited depth. It uses TanStack Query for efficient data fetching and caching.

## Components

### 1. Category Service (`services/category.ts`)

Handles all API communication with the backend category endpoints:

```typescript
// Get primary categories
const primaryCategories = await categoryService.getPrimaryCategories();

// Get category children
const children = await categoryService.getCategoryChildren(categoryId);

// Check if category has children
const hasChildren = await categoryService.checkCategoryHasChildren(categoryId);

// Get category by ID
const category = await categoryService.getCategoryById(categoryId);
```

### 2. Category Hooks (`hooks/useCategories.ts`)

TanStack Query hooks for efficient data fetching:

- `usePrimaryCategories()` - Fetches top-level categories
- `useCategoryChildren(categoryId)` - Fetches children of a specific category
- `useCategoryHasChildren(categoryId)` - Checks if category has children
- `useCategoryById(categoryId)` - Fetches category details
- `useCategoryPath(categoryId)` - Gets the full path (breadcrumb) of a category

### 3. Category Selector Component (`components/vendor/CategorySelector.tsx`)

A cascading dropdown component that:

- Shows primary categories initially
- Dynamically loads subcategories when a category is selected
- Supports unlimited nesting levels
- Shows loading states with spinners
- Displays the selected category path
- Handles errors gracefully
- Provides form validation

#### Usage:

```tsx
import { CategorySelector } from "@/components";

<CategorySelector
  selectedCategoryId={formData.categoryId}
  onCategorySelect={handleCategorySelect}
  error={categoryError}
/>;
```

### 4. Test Component (`components/vendor/CategoryTestComponent.tsx`)

A test component to verify the category selector functionality. Can be used for development and testing.

## Integration with Add Listing Form

The category selector has been integrated into the add-listing form (`app/(dashboard)/(vendor)/add-listing.tsx`):

### Changes Made:

1. **Updated FormData interface:**

   ```typescript
   interface FormData {
     // ... other fields
     categoryId: string | null; // Changed from category: string
     categoryPath: string[]; // New field for breadcrumb
     // ... other fields
   }
   ```

2. **Added category selection handler:**

   ```typescript
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
   ```

3. **Updated validation:**

   ```typescript
   if (!formData.categoryId) {
     setCategoryError("Please select a service category");
     Alert.alert("Error", "Please select a service category");
     return;
   }
   ```

4. **Replaced static dropdown with CategorySelector:**
   ```tsx
   <CategorySelector
     selectedCategoryId={formData.categoryId}
     onCategorySelect={handleCategorySelect}
     error={categoryError}
   />
   ```

## Features

### ✅ Implemented Features:

1. **Dynamic Category Loading** - Categories are loaded from the backend API
2. **Cascading Selection** - Users can navigate through nested categories
3. **Unlimited Depth** - Supports any number of nesting levels
4. **Loading States** - Shows spinners while loading categories
5. **Error Handling** - Graceful error handling with user feedback
6. **Form Validation** - Validates that a category is selected
7. **Path Display** - Shows the selected category path (breadcrumb)
8. **TanStack Query Integration** - Efficient caching and data fetching
9. **TypeScript Support** - Full type safety throughout

### 🔄 User Flow:

1. **Initial Load** - Primary categories are displayed
2. **Category Selection** - User selects a category
3. **Check for Children** - System checks if category has subcategories
4. **Load Children** - If children exist, they are loaded and displayed
5. **Repeat** - Process continues until no more children exist
6. **Final Selection** - User selects a final category (leaf node)
7. **Validation** - Form validates that a category is selected

### 📱 UI/UX Features:

- **Responsive Design** - Works on all screen sizes
- **Loading Indicators** - Clear loading states
- **Error Messages** - User-friendly error handling
- **Path Display** - Shows selected category hierarchy
- **Form Integration** - Seamlessly integrated with existing form
- **Accessibility** - Proper labels and screen reader support

## API Integration

The frontend communicates with these backend endpoints:

some parent chils test data- `GET /api/categories/primary` - Get primary categories

- `GET /api/categories/:id/children` - Get category children
- `GET /api/categories/:id/has-children` - Check if has children
- `GET /api/categories/:id` - Get category details

## Error Handling

The system handles various error scenarios:

1. **Network Errors** - Shows user-friendly error messages
2. **API Errors** - Graceful fallback with retry options
3. **Validation Errors** - Clear form validation messages
4. **Loading Errors** - Proper loading state management

## Performance Optimizations

1. **TanStack Query Caching** - Categories are cached for 5 minutes
2. **Lazy Loading** - Children are only loaded when needed
3. **Efficient Re-renders** - Optimized component updates
4. **Memory Management** - Proper cleanup of unused data

## Testing

Use the `CategoryTestComponent` to test the category selector:

```tsx
import { CategoryTestComponent } from "@/components/vendor/CategoryTestComponent";

// In your test screen
<CategoryTestComponent />;
```

## Future Enhancements

Potential improvements for the future:

1. **Search Functionality** - Add search within categories
2. **Favorites** - Allow users to favorite categories
3. **Recent Categories** - Show recently used categories
4. **Category Icons** - Add icons to categories
5. **Bulk Operations** - Support for bulk category operations
6. **Offline Support** - Cache categories for offline use

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `@react-native-picker/picker` - Native picker component
- `expo-router` - Navigation
- `react-native` - Core React Native components

## File Structure

```
listroApp/
├── services/
│   └── category.ts                 # Category API service
├── hooks/
│   └── useCategories.ts           # TanStack Query hooks
├── components/
│   └── vendor/
│       ├── CategorySelector.tsx   # Main category selector
│       └── CategoryTestComponent.tsx # Test component
└── app/(dashboard)/(vendor)/
    └── add-listing.tsx            # Updated form with category selector
```

## Usage Example

```tsx
import React, { useState } from "react";
import { CategorySelector } from "@/components";

export default function MyForm() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const handleCategorySelect = (id: string | null, path: string[]) => {
    setCategoryId(id);
    setCategoryPath(path);
    setError("");
  };

  return (
    <CategorySelector
      selectedCategoryId={categoryId}
      onCategorySelect={handleCategorySelect}
      error={error}
    />
  );
}
```

This implementation provides a robust, user-friendly category selection system that scales with your application's needs.
