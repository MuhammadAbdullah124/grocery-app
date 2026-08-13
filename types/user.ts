export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
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
