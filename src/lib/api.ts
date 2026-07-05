/**
 * Shared API helper for the main frontend.
 * In dev, Vite proxy forwards /api/* to the backend.
 * In production (Amplify), VITE_API_URL points to the AWS API Gateway.
 */
import axios from 'axios';

// Safely fallback to the production URL if the Vercel env var is missing or stale
export const API_BASE = import.meta.env.VITE_API_URL || 'https://ingri-api.duckdns.org/api';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const match = document.cookie.match(/(?:^|;\s*)ingri_token=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : localStorage.getItem("ingri_token");
  return fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
