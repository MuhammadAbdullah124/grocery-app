export type UserRole = 'super_admin' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  /** The user's own business/shop name — distinct from a pickup `Store` location on an order. */
  shopName: string | null;
  avatar: string | null;
  role: UserRole;
}

export interface AuthCredentials {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface ProfileUpdatePayload {
  username: string;
  shopName?: string | null;
}
