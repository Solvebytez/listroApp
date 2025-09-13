import { api, tokenAuthApi } from "./api";

// User service interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}

export interface BusinessAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  description: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBusinessAddressData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  description?: string;
}

// User service functions
export const userService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>("/users/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<UserProfile>("/users/profile", data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string) => {
    const response = await api.delete("/users/account", {
      data: { password },
    });
    return response.data;
  },

  // Switch user role
  switchRole: async (role: string) => {
    const response = await api.post("/users/switch-role", { role });
    return response.data;
  },

  // Update business address
  updateBusinessAddress: async (
    addressId: string,
    data: UpdateBusinessAddressData
  ): Promise<BusinessAddress> => {
    const response = await api.put<{ data: BusinessAddress }>(
      `/users/business-addresses/${addressId}`,
      data
    );
    return response.data.data;
  },

  // Delete business address
  deleteBusinessAddress: async (addressId: string) => {
    const response = await api.delete(`/users/business-addresses/${addressId}`);
    return response.data;
  },
};

// Profile picture service functions
export const uploadProfilePicture = async (file: any) => {
  const formData = new FormData();
  formData.append("image", {
    uri: file.uri,
    type: file.type || "image/jpeg",
    name: file.fileName || "profile-picture.jpg",
  } as any);

  const response = await api.post("/upload/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000, // 30 second timeout
  });
  return response.data;
};

export const getProfilePicture = async () => {
  const response = await api.get("/upload/profile-picture");
  return response.data;
};

export const deleteProfilePicture = async () => {
  const response = await api.delete("/upload/profile-picture");
  return response.data;
};
