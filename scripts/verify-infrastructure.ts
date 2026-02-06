/**
 * Infrastructure Verification Script
 * Проверяет подключение к Supabase и работу API сервисов
 */

import { supabase } from '../src/services/supabase';
import { shikimoriService } from '../src/services/shikimori';

interface VerificationResult {
  component: string;
  status: 'success' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

const results: VerificationResult[] = [];

/**
 * Проверка подключения к Supabase
 */
async function verifySupabaseConnection(): Promise<VerificationResult> {
  try {
    console.log('\n🔍 Проверка подключения к Supabase...');
    
    // Проверяем, что клиент инициализирован
    if (!supabase) {
      return {
        component: 'Supabase Client',
        status: 'error',
        message: 'Supabase клиент не инициализирован',
      };
    }

    // Проверяем подключение через простой запрос
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        component: 'Supabase Connection',
        status: 'error',
        message: `Ошибка подключения: ${error.message}`,
      };
    }

    return {
      component: 'Supabase Connection',
      status: 'success',
      message: 'Подключение к Supabase успешно установлено',
      details: { sessionExists: !!data.session },
    };
  } catch (error) {
    return {
      component: 'Supabase Connection',
      status: 'error',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Проверка существования таблиц в Supabase
 */
async function verifySupabaseTables(): Promise<VerificationResult> {
  try {
    console.log('🔍 Проверка таблиц базы данных...');
    
    // Проверяем таблицу profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      return {
        component: 'Database Tables',
        status: 'error',
        message: `Таблица profiles не найдена или недоступна: ${profilesError.message}`,
      };
    }

    // Проверяем таблицу favorites
    const { error: favoritesError } = await supabase
      .from('favorites')
      .select('id')
      .limit(1);

    if (favoritesError) {
      return {
        component: 'Database Tables',
        status: 'error',
        message: `Таблица favorites не найдена или недоступна: ${favoritesError.message}`,
      };
    }

    return {
      component: 'Database Tables',
      status: 'success',
      message: 'Все таблицы (profiles, favorites) созданы и доступны',
    };
  } catch (error) {
    return {
      component: 'Database Tables',
      status: 'error',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Проверка Shikimori API
 */
async function verifyShikimoriAPI(): Promise<VerificationResult> {
  try {
    console.log('🔍 Проверка Shikimori API...');
    
    // Пробуем получить популярные аниме
    const animes = await shikimoriService.getPopularAnime(1, 5);
    
    if (!animes || animes.length === 0) {
      return {
        component: 'Shikimori API',
        status: 'error',
        message: 'API вернул пустой массив',
      };
    }

    // Проверяем структуру данных
    const firstAnime = animes[0];
    const requiredFields = ['id', 'name', 'image', 'score'];
    const missingFields = requiredFields.filter(field => !(field in firstAnime));

    if (missingFields.length > 0) {
      return {
        component: 'Shikimori API',
        status: 'error',
        message: `Отсутствуют обязательные поля: ${missingFields.join(', ')}`,
      };
    }

    return {
      component: 'Shikimori API',
      status: 'success',
      message: `API работает корректно, получено ${animes.length} аниме`,
      details: {
        sampleAnime: {
          id: firstAnime.id,
          name: firstAnime.name,
          russian: firstAnime.russian,
        },
      },
    };
  } catch (error) {
    return {
      component: 'Shikimori API',
      status: 'error',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Проверка поиска аниме
 */
async function verifyShikimoriSearch(): Promise<VerificationResult> {
  try {
    console.log('🔍 Проверка поиска аниме...');
    
    // Пробуем поиск по популярному аниме
    const searchResults = await shikimoriService.searchAnime('Naruto', 5);
    
    if (!searchResults || searchResults.length === 0) {
      return {
        component: 'Shikimori Search',
        status: 'error',
        message: 'Поиск не вернул результатов',
      };
    }

    return {
      component: 'Shikimori Search',
      status: 'success',
      message: `Поиск работает, найдено ${searchResults.length} результатов`,
      details: {
        query: 'Naruto',
        resultsCount: searchResults.length,
      },
    };
  } catch (error) {
    return {
      component: 'Shikimori Search',
      status: 'error',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Проверка получения деталей аниме
 */
async function verifyAnimeDetails(): Promise<VerificationResult> {
  try {
    console.log('🔍 Проверка получения деталей аниме...');
    
    // Используем известный ID (Naruto)
    const animeDetails = await shikimoriService.getAnimeById(20);
    
    if (!animeDetails) {
      return {
        component: 'Anime Details',
        status: 'error',
        message: 'Не удалось получить детали аниме',
      };
    }

    // Проверяем наличие важных полей для страницы деталей
    const requiredFields = ['id', 'name', 'description', 'genres', 'studios'];
    const missingFields = requiredFields.filter(field => !(field in animeDetails));

    if (missingFields.length > 0) {
      return {
        component: 'Anime Details',
        status: 'error',
        message: `Отсутствуют поля для страницы деталей: ${missingFields.join(', ')}`,
      };
    }

    return {
      component: 'Anime Details',
      status: 'success',
      message: 'Получение деталей аниме работает корректно',
      details: {
        animeId: animeDetails.id,
        name: animeDetails.name,
        hasGenres: animeDetails.genres?.length > 0,
        hasStudios: animeDetails.studios?.length > 0,
      },
    };
  } catch (error) {
    return {
      component: 'Anime Details',
      status: 'error',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Вывод результатов проверки
 */
function printResults(results: VerificationResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ ИНФРАСТРУКТУРЫ');
  console.log('='.repeat(60) + '\n');

  let successCount = 0;
  let errorCount = 0;

  results.forEach((result) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.component}`);
    console.log(`   ${result.message}`);
    
    if (result.details) {
      console.log(`   Детали: ${JSON.stringify(result.details, null, 2)}`);
    }
    console.log('');

    if (result.status === 'success') {
      successCount++;
    } else {
      errorCount++;
    }
  });

  console.log('='.repeat(60));
  console.log(`✅ Успешно: ${successCount} | ❌ Ошибок: ${errorCount}`);
  console.log('='.repeat(60) + '\n');

  if (errorCount > 0) {
    console.log('⚠️  Обнаружены проблемы. Проверьте:');
    console.log('   1. Переменные окружения в .env файле');
    console.log('   2. Выполнены ли миграции в Supabase');
    console.log('   3. Доступность интернет-соединения');
    console.log('');
  } else {
    console.log('🎉 Все компоненты инфраструктуры работают корректно!');
    console.log('');
  }
}

/**
 * Главная функция проверки
 */
async function main() {
  console.log('🚀 Запуск проверки инфраструктуры ShiKaraKa...\n');

  // Проверка переменных окружения
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ Ошибка: Не настроены переменные окружения!');
    console.error('   Создайте .env файл на основе .env.example');
    process.exit(1);
  }

  // Выполняем все проверки
  results.push(await verifySupabaseConnection());
  results.push(await verifySupabaseTables());
  results.push(await verifyShikimoriAPI());
  results.push(await verifyShikimoriSearch());
  results.push(await verifyAnimeDetails());

  // Выводим результаты
  printResults(results);

  // Возвращаем код выхода
  const hasErrors = results.some(r => r.status === 'error');
  process.exit(hasErrors ? 1 : 0);
}

// Запуск проверки
main().catch((error) => {
  console.error('❌ Критическая ошибка при проверке:', error);
  process.exit(1);
});
