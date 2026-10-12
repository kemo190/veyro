export type UserRole = "admin" | "restaurant_owner" | "employee";

export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
  phone?: string;
  branch?: string;
  createdAt: string;
  ordersCount?: number;
}

export interface UserProfile {
  id: string;
  restaurantId?: string; // null or empty for global platform admin
  role: UserRole;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  orderNumber: string;
  orderTicketImage: string; // Base64 data URL or storage preview URL
  receiptImage: string;     // Base64 data URL or storage preview URL
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  notes?: string;
}

export interface OrderFilterOptions {
  searchQuery?: string;
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderCreationInput {
  orderNumber: string;
  orderTicketImage: string;
  receiptImage: string;
  notes?: string;
}
