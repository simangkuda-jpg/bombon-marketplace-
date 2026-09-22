export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type ProductStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'disabled' | 'deleted';
export type ProductCondition = 'baru' | 'bekas';
export type TransactionMethod = 'cod' | 'pengiriman' | 'keduanya';
export type OrderStatus =
  | 'pending' | 'accepted' | 'processing' | 'ready'
  | 'shipped' | 'completed' | 'cancelled' | 'rejected';

export interface Profile {
  id: string;
  name: string;
  username: string;
  whatsapp_number: string;
  whatsapp_visible: boolean;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  rating_avg: number;
  rating_count: number;
  transaction_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  condition: ProductCondition;
  stock: number;
  status: ProductStatus;
  transaction_method: TransactionMethod;
  city: string;
  district: string | null;
  whatsapp_number: string | null;
  view_count: number;
  created_at: string;
  // relasi (di-join saat query)
  product_images?: ProductImage[];
  seller?: Profile;
  category?: Category;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  transaction_method: TransactionMethod;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_address: string | null;
  note: string | null;
  shipping_cost: number;
  subtotal: number;
  total: number;
  created_at: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Menunggu Konfirmasi',
  accepted: 'Pesanan Diterima',
  processing: 'Diproses',
  ready: 'Siap Dikirim / COD',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  rejected: 'Ditolak',
};

// Alur transisi status yang diizinkan (state machine)
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
};
