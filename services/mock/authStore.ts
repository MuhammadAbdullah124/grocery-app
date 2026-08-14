import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { AuthCredentials, RegisterPayload, User } from '@/types';
import { generateId } from '@/utils/id';
import { MOCK_USER } from './users.data';

const SESSION_KEY = 'freshcart:session';

export interface Session {
  token: string;
  user: User;
}

async function persistSession(session: Session): Promise<Session> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function login(credentials: AuthCredentials): Promise<Session> {
  const identifier = credentials.identifier.trim();
  if (!identifier || credentials.password.length < 4) {
    throw new ApiRequestError(
      'Invalid email/phone or password. Password must be at least 4 characters.',
      'INVALID_CREDENTIALS',
    );
  }

  const user: User = {
    ...MOCK_USER,
    email: identifier.includes('@') ? identifier : MOCK_USER.email,
    phone: identifier.includes('@') ? MOCK_USER.phone : identifier,
  };

  return persistSession({ token: generateId('token'), user });
}

export async function register(payload: RegisterPayload): Promise<Session> {
  if (!payload.name.trim() || !payload.email.trim() || !payload.phone.trim()) {
    throw new ApiRequestError('Please fill in all required fields.', 'INVALID_PAYLOAD');
  }
  if (payload.password.length < 4) {
    throw new ApiRequestError('Password must be at least 4 characters.', 'INVALID_PAYLOAD');
  }

  const user: User = {
    id: generateId('user'),
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    avatar: null,
  };

  return persistSession({ token: generateId('token'), user });
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
