import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {supabase} from './supabase';

const AUTH_STORAGE_KEY = '@hornero_tv_auth';

interface AuthSession {
  accessCode: string;
  userId: string;
  userLabel: string;
  deviceId: string;
  expiresAt: string;
}

// Get a unique device identifier
async function getDeviceId(): Promise<string> {
  try {
    const DeviceInfo = require('react-native-device-info');
    // getUniqueId returns a persistent unique ID for the device
    const uniqueId = await DeviceInfo.getUniqueId();
    return uniqueId || 'unknown-device';
  } catch {
    // Fallback: generate and persist a UUID
    let storedId = await AsyncStorage.getItem('@hornero_device_id');
    if (!storedId) {
      storedId = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      await AsyncStorage.setItem('@hornero_device_id', storedId);
    }
    return storedId;
  }
}

// Get a device name for display in admin panel
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

// Validate access code and register device with Supabase
export async function loginWithCode(
  accessCode: string,
): Promise<{success: boolean; message: string; session?: AuthSession}> {
  try {
    const deviceId = await getDeviceId();
    const deviceName = await getDeviceName();

    const {data, error} = await supabase.rpc('validate_device', {
      p_access_code: accessCode,
      p_device_id: deviceId,
      p_device_name: deviceName,
    });

    if (error) {
      return {success: false, message: 'Error de conexión. Intentá de nuevo.'};
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

    return {success: false, message: data.message};
  } catch {
    return {success: false, message: 'Error de conexión. Verificá tu internet.'};
  }
}

// Check if there's an existing valid session
export async function getStoredSession(): Promise<AuthSession | null> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);

    // Check expiry locally first
    if (new Date(session.expiresAt) <= new Date()) {
      await clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Validate the stored session against the server
export async function validateSession(): Promise<{
  valid: boolean;
  message?: string;
  daysRemaining?: number;
}> {
  try {
    const session = await getStoredSession();
    if (!session) return {valid: false, message: 'No hay sesión activa'};

    const deviceId = await getDeviceId();

    const {data, error} = await supabase.rpc('validate_device', {
      p_access_code: session.accessCode,
      p_device_id: deviceId,
      p_device_name: null,
    });

    if (error) {
      // If we can't reach the server, trust the local session
      return {valid: true, daysRemaining: Math.ceil(
        (new Date(session.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )};
    }

    if (data.status === 'ok') {
      // Update stored expiry
      session.expiresAt = data.expires_at;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return {valid: true, daysRemaining: Math.round(data.days_remaining)};
    }

    // Access revoked or expired
    await clearSession();
    return {valid: false, message: data.message};
  } catch {
    // Network error - trust local session
    const session = await getStoredSession();
    return {valid: !!session};
  }
}

// Clear the stored session (logout)
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}
