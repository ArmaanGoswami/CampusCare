import { Capacitor } from '@capacitor/core';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const detectApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;

  if (fromEnv && fromEnv.trim()) {
    return trimTrailingSlash(fromEnv.trim());
  }

  // Android emulator maps host machine localhost to 10.0.2.2.
  if (Capacitor.isNativePlatform()) {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = detectApiBase();

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
