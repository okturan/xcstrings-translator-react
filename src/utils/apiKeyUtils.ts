const API_KEY_STORAGE_KEY = 'openrouter_api_key';

export const getStoredApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setStoredApiKey = (apiKey: string) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};
