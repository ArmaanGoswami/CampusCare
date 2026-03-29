import { Capacitor } from '@capacitor/core';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const detectApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;

  if (fromEnv && fromEnv.trim()) {
    return trimTrailingSlash(fromEnv.trim());
  }

  // Always return the live Render backend URL
  return 'https://campuscare-v2ca.onrender.com';
};

export const API_BASE_URL = detectApiBase();

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
