import Constants from 'expo-constants';

const FALLBACK_BASE_URL = 'https://app-api.pixverse.ai';
const FALLBACK_POLL_INTERVAL = 4000;

const extra = Constants.expoConfig?.extra ?? {};
const configuredBaseUrl = typeof extra.apiBaseUrl === 'string' ? extra.apiBaseUrl : undefined;
const configuredApiKey = typeof extra.apiKey === 'string' ? extra.apiKey : undefined;
const configuredPollInterval =
  typeof extra.videoPollInterval === 'number' ? extra.videoPollInterval : FALLBACK_POLL_INTERVAL;

export const API_BASE_URL = configuredBaseUrl ?? FALLBACK_BASE_URL;
export const API_KEY = configuredApiKey ?? '';
export const VIDEO_POLL_INTERVAL = configuredPollInterval;
