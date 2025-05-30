// 環境変数のユーティリティ関数
export const getEnv = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// Supabase関連の環境変数
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');