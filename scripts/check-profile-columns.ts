import { supabase } from '../src/services/supabase';

async function checkProfileColumns() {
  console.log('🔍 Проверка структуры таблицы profiles...\n');

  try {
    // Попробуем получить профиль с новыми полями
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, is_admin, last_active, created_at, updated_at')
      .limit(1);

    if (error) {
      console.error('❌ Ошибка при запросе к таблице profiles:');
      console.error(error.message);
      console.error('\n⚠️  Возможно, миграции не применены!');
      console.error('📝 Выполните миграции из папки supabase/migrations/');
      return;
    }

    console.log('✅ Таблица profiles содержит все необходимые поля:');
    console.log('   - id');
    console.log('   - username');
    console.log('   - avatar_url');
    console.log('   - bio ✨ (новое поле)');
    console.log('   - is_admin ✨ (новое поле)');
    console.log('   - last_active ✨ (новое поле)');
    console.log('   - created_at');
    console.log('   - updated_at');
    
    if (data && data.length > 0) {
      console.log('\n📊 Пример данных:');
      console.log(JSON.stringify(data[0], null, 2));
    }

  } catch (err) {
    console.error('❌ Неожиданная ошибка:', err);
  }
}

checkProfileColumns();
