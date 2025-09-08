// src/config/api.ts
const LOCAL_BASE = 'http://localhost:3001';

export const BASE_URL = import.meta.env.VITE_API_DOMAIN || LOCAL_BASE;
