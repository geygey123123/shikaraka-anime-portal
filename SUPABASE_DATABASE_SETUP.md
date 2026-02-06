# 🗄️ Настройка базы данных Supabase

## Проблема
Таблица `favorites` не существует в базе данных.

## Решение: Выполните SQL миграции

### Шаг 1: Откройте SQL Editor

1. Откройте https://supabase.com
2. Войдите в аккаунт
3. Выберите проект **jpbuefpldspvdltdeoub**
4. В левом меню выберите **SQL Editor**
5. Нажмите **New Query** (или кнопку "+")

---

### Шаг 2: Создайте таблицу profiles

Скопируйте и вставьте этот SQL код:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Нажмите RUN** (или Ctrl+Enter)

---

### Шаг 3: Создайте таблицу favorites

Создайте **новый запрос** (New Query) и вставьте:

```sql
-- Create favorites table
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shikimori_id INTEGER NOT NULL,
  anime_name TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shikimori_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_shikimori_id ON favorites(shikimori_id);
CREATE INDEX idx_favorites_added_at ON favorites(added_at DESC);
```

**Нажмите RUN** (или Ctrl+Enter)

---

### Шаг 4: Проверьте создание таблиц

1. В левом меню выберите **Table Editor**
2. Вы должны увидеть две новые таблицы:
   - ✅ `profiles`
   - ✅ `favorites`

---

## 🎯 Альтернативный способ (через Table Editor)

Если SQL Editor не работает, можно создать таблицы вручную:

### Создание таблицы favorites:

1. **Table Editor** → **New Table**
2. Название: `favorites`
3. Добавьте колонки:

| Название | Тип | Настройки |
|----------|-----|-----------|
| id | uuid | Primary Key, Default: gen_random_uuid() |
| user_id | uuid | Foreign Key → auth.users(id), NOT NULL, ON DELETE CASCADE |
| shikimori_id | int4 | NOT NULL |
| anime_name | text | NOT NULL |
| added_at | timestamptz | Default: now() |

4. Добавьте UNIQUE constraint на (user_id, shikimori_id)
5. Enable RLS (Row Level Security)
6. Добавьте policies:
   - SELECT: `auth.uid() = user_id`
   - INSERT: `auth.uid() = user_id`
   - DELETE: `auth.uid() = user_id`

---

## ✅ Проверка

После создания таблиц:

1. Обновите страницу приложения (F5)
2. Войдите в систему
3. Попробуйте добавить аниме в избранное
4. Ошибка "Could not find the table" должна исчезнуть

---

## 🐛 Если ошибки остаются

### Ошибка: "relation already exists"
```
Таблица уже создана. Пропустите этот шаг.
```

### Ошибка: "permission denied"
```
Убедитесь, что вы вошли как владелец проекта в Supabase.
```

### Ошибка: "syntax error"
```
Проверьте, что скопировали весь SQL код полностью.
Убедитесь, что нет лишних символов.
```

---

## 📊 Структура базы данных

После выполнения миграций у вас будет:

```
auth.users (встроенная таблица Supabase)
  ↓
profiles (дополнительная информация о пользователе)
  - id (UUID, FK → auth.users)
  - username
  - avatar_url
  - created_at
  - updated_at

favorites (избранные аниме пользователя)
  - id (UUID, PK)
  - user_id (UUID, FK → auth.users)
  - shikimori_id (INTEGER)
  - anime_name (TEXT)
  - added_at (TIMESTAMP)
```

---

## 🔒 Row Level Security (RLS)

Все таблицы защищены RLS:
- Пользователи видят только свои данные
- Нельзя изменить чужие записи
- Автоматическая проверка через `auth.uid()`

---

## 💡 Полезные команды SQL

### Проверить существование таблицы:
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'favorites';
```

### Посмотреть структуру таблицы:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'favorites';
```

### Удалить таблицу (если нужно пересоздать):
```sql
DROP TABLE IF EXISTS favorites CASCADE;
```

---

## ✨ После настройки

Приложение будет полностью функциональным:
- ✅ Регистрация и вход
- ✅ Просмотр аниме
- ✅ Добавление в избранное
- ✅ Удаление из избранного
- ✅ Страница избранного

**Готово к использованию!** 🚀
