import Constants from 'expo-constants';

const FALLBACK_BASE_URL = 'https://app-api.pixverse.ai';

const extra = Constants.expoConfig?.extra ?? {};
const configuredBaseUrl = typeof extra.apiBaseUrl === 'string' ? extra.apiBaseUrl : undefined;
const configuredApiKey = typeof extra.apiKey === 'string' ? extra.apiKey : undefined;

export const API_BASE_URL = configuredBaseUrl ?? FALLBACK_BASE_URL;
export const API_KEY = configuredApiKey ?? '';
