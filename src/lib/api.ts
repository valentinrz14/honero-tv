import {supabase} from './supabase';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@hornero_tv_auth';

export interface AuthSession {
  accessCode: string;
  userId: string;
  userLabel: string;
  deviceId: string;
  expiresAt: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  session?: AuthSession;
}

export interface SessionValidation {
  valid: boolean;
  message?: string;
  daysRemaining?: number;
}

// --- Device helpers ---

async function getDeviceId(): Promise<string> {
  try {
    const DeviceInfo = require('react-native-device-info');
    const uniqueId = await DeviceInfo.getUniqueId();
    return uniqueId || 'unknown-device';
  } catch {
    let storedId = await AsyncStorage.getItem('@hornero_device_id');
    if (!storedId) {
      storedId =
        'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      await AsyncStorage.setItem('@hornero_device_id', storedId);
    }
    return storedId;
  }
}

async function getDeviceName(): Promise<string> {
  try {
    const DeviceInfo = require('react-native-device-info');
    const brand = DeviceInfo.getBrand();
    const model = await DeviceInfo.getModel();
    return `${brand} ${model}`;
  } catch {
    return Platform.OS === 'android' ? 'Android TV' : 'Dispositivo';
  }
}

// --- Session storage ---

export async function getStoredSession(): Promise<AuthSession | null> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const session: AuthSession = JSON.parse(stored);
    if (new Date(session.expiresAt) <= new Date()) {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

// --- API endpoints ---

export async function loginWithCode(
  accessCode: string,
): Promise<LoginResult> {
  const deviceId = await getDeviceId();
  const deviceName = await getDeviceName();

  const {data, error} = await supabase.rpc('validate_device', {
    p_access_code: accessCode,
    p_device_id: deviceId,
    p_device_name: deviceName,
  });

  if (error) {
    throw new Error('Error de conexión. Intentá de nuevo.');
  }

  if (data.status === 'ok') {
    const session: AuthSession = {
      accessCode,
      userId: data.user_id,
      userLabel: data.user_label,
      deviceId,
      expiresAt: data.expires_at,
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return {success: true, message: data.message || 'Bienvenido!', session};
  }

  throw new Error(data.message || 'Código inválido');
}

export async function validateSession(): Promise<SessionValidation> {
  const session = await getStoredSession();
  if (!session) {
    return {valid: false, message: 'No hay sesión activa'};
  }

  const deviceId = await getDeviceId();

  const {data, error} = await supabase.rpc('validate_device', {
    p_access_code: session.accessCode,
    p_device_id: deviceId,
    p_device_name: null,
  });

  if (error) {
    // Can't reach server - trust local session
    return {
      valid: true,
      daysRemaining: Math.ceil(
        (new Date(session.expiresAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    };
  }

  if (data.status === 'ok') {
    session.expiresAt = data.expires_at;
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return {valid: true, daysRemaining: Math.round(data.days_remaining)};
  }

  await clearSession();
  return {valid: false, message: data.message};
}
