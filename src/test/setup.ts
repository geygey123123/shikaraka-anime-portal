import '@testing-library/jest-dom';

// Устанавливаем mock переменные окружения для тестов
if (!import.meta.env.VITE_SUPABASE_URL) {
  // @ts-expect-error - Mocking env var for tests
  import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // @ts-expect-error - Mocking env var for tests
  import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-mock';
}
