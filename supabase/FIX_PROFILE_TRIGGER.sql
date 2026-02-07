-- ============================================
-- FIX: Автоматическое создание профиля при регистрации
-- ============================================

-- Функция для создания профиля при регистрации пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, is_admin, last_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    CASE WHEN NEW.email = 'lifeshindo96@gmail.com' THEN true ELSE false END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    is_admin = CASE WHEN NEW.email = 'lifeshindo96@gmail.com' THEN true ELSE EXCLUDED.is_admin END,
    last_active = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер если существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаем новый триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Создать профили для существующих пользователей
-- ============================================

-- Вставляем профили для всех пользователей, у которых их еще нет
INSERT INTO public.profiles (id, is_admin, last_active)
SELECT 
  u.id,
  CASE WHEN u.email = 'lifeshindo96@gmail.com' THEN true ELSE false END,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Проверка: показать всех пользователей и их профили
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.username,
  p.is_admin,
  p.bio,
  p.avatar_url,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
