-- ============================================
-- FIX: Storage RLS Policies для bucket avatars
-- ============================================

-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Public avatars read" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- ============================================
-- ПОЛИТИКА 1: Публичное чтение (все могут видеть аватары)
-- ============================================
CREATE POLICY "Public avatars read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- ПОЛИТИКА 2: Загрузка своих аватаров
-- Файлы загружаются как: user_id.jpg (без папок)
-- ============================================
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (name = auth.uid()::text || '.jpg' 
    OR name = auth.uid()::text || '.png' 
    OR name = auth.uid()::text || '.webp')
);

-- ============================================
-- ПОЛИТИКА 3: Обновление своих аватаров
-- ============================================
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name = auth.uid()::text || '.jpg' 
    OR name = auth.uid()::text || '.png' 
    OR name = auth.uid()::text || '.webp')
);

-- ============================================
-- ПОЛИТИКА 4: Удаление своих аватаров
-- ============================================
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name = auth.uid()::text || '.jpg' 
    OR name = auth.uid()::text || '.png' 
    OR name = auth.uid()::text || '.webp')
);

-- ============================================
-- Проверка: показать все политики для bucket avatars
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;
