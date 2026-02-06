# Requirements Document - ShiKaraKa V2 Features

## Introduction

Это расширение функциональности ShiKaraKa аниме-портала, добавляющее продвинутые возможности для пользователей и администраторов. Включает пагинацию, кастомизацию профилей, админ-панель, систему комментариев, собственную систему рейтингов, модерацию, защиту от ботов и расширенное управление избранным.

## Glossary

- **Admin**: Пользователь с email lifeshindo96@gmail.com с полным доступом к админ-панели
- **Moderator**: Пользователь с правами модерации комментариев
- **Watch_Status**: Статус просмотра аниме (смотрю, планирую, завершено, брошено, отложено)
- **User_Rating**: Оценка пользователя для аниме (1-10)
- **Comment**: Комментарий пользователя под аниме
- **Captcha**: Система защиты от ботов при регистрации
- **Rate_Limit**: Ограничение частоты действий для защиты от накрутки

## Requirements

### Requirement 1: Пагинация популярных аниме

**User Story:** Как пользователь, я хочу просматривать несколько страниц популярных аниме, чтобы иметь больший выбор контента.

#### Acceptance Criteria

1. WHEN пользователь находится на главной странице, THE System SHALL отображать кнопки пагинации внизу сетки аниме
2. WHEN пользователь нажимает "Следующая страница", THE System SHALL загрузить следующие 24 аниме из Shikimori_API
3. WHEN пользователь нажимает "Предыдущая страница", THE System SHALL загрузить предыдущие 24 аниме
4. WHEN пользователь переходит на другую страницу, THE System SHALL прокрутить страницу вверх
5. THE System SHALL отображать текущий номер страницы и общее количество доступных страниц
6. WHEN данные новой страницы загружаются, THE System SHALL показывать Skeleton_Screen
7. THE System SHALL кэшировать данные каждой страницы через React_Query

### Requirement 2: Кастомизация профиля пользователя

**User Story:** Как аутентифицированный пользователь, я хочу настраивать свой профиль, чтобы персонализировать свой опыт.

#### Acceptance Criteria

1. WHEN пользователь открывает страницу профиля, THE System SHALL отобразить текущие данные профиля
2. WHEN пользователь редактирует username, THE System SHALL обновить поле username в таблице profiles
3. WHEN пользователь загружает аватар, THE System SHALL сохранить изображение в Supabase Storage
4. WHEN аватар загружен, THE System SHALL обновить avatar_url в таблице profiles
5. THE System SHALL валидировать username (3-20 символов, только буквы, цифры, подчеркивание)
6. THE System SHALL ограничить размер аватара до 2MB
7. THE System SHALL поддерживать форматы изображений: JPG, PNG, WebP
8. WHEN пользователь сохраняет изменения, THE System SHALL отобразить сообщение об успехе

### Requirement 3: Админ-панель со статистикой

**User Story:** Как администратор (lifeshindo96@gmail.com), я хочу видеть статистику сайта, чтобы мониторить активность и производительность.

#### Acceptance Criteria

1. WHEN пользователь с is_admin = true входит в систему, THE System SHALL отображать ссылку на админ-панель в Header
2. WHERE пользователь не является администратором (is_admin = false или null), THE System SHALL скрывать доступ к админ-панели
3. WHEN администратор открывает админ-панель, THE System SHALL отобразить следующую статистику:
   - Общее количество зарегистрированных пользователей
   - Количество активных пользователей за последние 7 дней
   - Общее количество добавленных в избранное аниме
   - Общее количество комментариев
   - Общее количество оценок
   - Топ-10 самых популярных аниме (по количеству добавлений в избранное)
   - Топ-10 самых высоко оцененных аниме (по байесовскому среднему рейтингу)
4. THE System SHALL обновлять статистику в реальном времени при загрузке страницы
5. THE System SHALL отображать графики активности пользователей за последние 30 дней
6. WHEN пользователь пытается получить доступ к админ-панели, THE System SHALL проверить поле is_admin в таблице profiles через RLS policy
7. THE System SHALL защитить все запросы к статистике через RLS policies, проверяющие is_admin = true
8. WHEN администратор впервые регистрируется, THE System SHALL автоматически установить is_admin = true для email lifeshindo96@gmail.com через database trigger

### Requirement 4: Управление модераторами

**User Story:** Как администратор, я хочу назначать модераторов, чтобы делегировать управление комментариями.

#### Acceptance Criteria

1. WHEN администратор открывает раздел управления модераторами, THE System SHALL отобразить список текущих модераторов
2. WHEN администратор добавляет email модератора, THE System SHALL создать запись в таблице moderators
3. WHEN администратор удаляет модератора, THE System SHALL удалить запись из таблицы moderators
4. THE System SHALL валидировать email формат перед добавлением модератора
5. THE System SHALL предотвращать дублирование email модераторов
6. WHEN модератор входит в систему, THE System SHALL отображать панель модерации комментариев

### Requirement 5: Система комментариев

**User Story:** Как аутентифицированный пользователь, я хочу оставлять комментарии под аниме, чтобы делиться своим мнением.

#### Acceptance Criteria

1. WHEN пользователь открывает страницу аниме, THE System SHALL отобразить секцию комментариев внизу страницы
2. WHERE пользователь аутентифицирован, THE System SHALL отображать форму для добавления комментария
3. WHERE пользователь не аутентифицирован, THE System SHALL отображать сообщение "Войдите, чтобы оставить комментарий"
4. WHEN пользователь отправляет комментарий, THE System SHALL сохранить его в таблицу comments с user_id, anime_id, content, created_at
5. THE System SHALL валидировать длину комментария (минимум 10, максимум 1000 символов)
6. THE System SHALL отображать комментарии в порядке от новых к старым
7. WHEN пользователь является автором комментария, THE System SHALL отображать кнопку "Удалить"
8. WHEN пользователь удаляет свой комментарий, THE System SHALL удалить запись из таблицы comments
9. THE System SHALL отображать username и avatar автора комментария
10. THE System SHALL применять rate limiting: максимум 5 комментариев в час на пользователя

### Requirement 6: Модерация комментариев

**User Story:** Как модератор, я хочу управлять комментариями, чтобы поддерживать порядок на сайте.

#### Acceptance Criteria

1. WHERE пользователь является модератором или администратором, THE System SHALL отображать кнопку "Удалить" на всех комментариях
2. WHEN модератор удаляет комментарий, THE System SHALL пометить комментарий как deleted в таблице comments
3. THE System SHALL сохранять информацию о модераторе, удалившем комментарий
4. THE System SHALL отображать удаленные комментарии как "[Комментарий удален модератором]"
5. WHEN модератор открывает панель модерации, THE System SHALL отобразить список последних комментариев с возможностью фильтрации

### Requirement 7: Собственная система рейтингов

**User Story:** Как пользователь, я хочу оценивать аниме, чтобы влиять на рейтинг и помогать другим в выборе.

#### Acceptance Criteria

1. WHEN пользователь открывает страницу аниме, THE System SHALL отображать взвешенный рейтинг на основе оценок пользователей
2. WHERE пользователь аутентифицирован, THE System SHALL отображать интерфейс для выставления оценки (1-10 звезд)
3. WHEN пользователь выставляет оценку, THE System SHALL сохранить ее в таблицу ratings с user_id, anime_id, rating, created_at
4. IF пользователь уже оценил аниме, THEN THE System SHALL обновить существующую оценку
5. THE System SHALL вычислять взвешенный рейтинг используя байесовское среднее (формула IMDB):
   - Weighted Rating = (v / (v + m)) * R + (m / (v + m)) * C
   - где v = количество оценок для аниме
   - m = минимальное количество оценок для попадания в топ (например, 10)
   - R = среднее арифметическое оценок для аниме
   - C = средняя оценка по всем аниме на сайте
6. THE System SHALL отображать количество оценок рядом со взвешенным рейтингом
7. THE System SHALL НЕ отображать рейтинг из Shikimori API
8. THE System SHALL применять rate limiting: максимум 20 оценок в час на пользователя
9. WHEN средний рейтинг обновляется, THE System SHALL инвалидировать кэш React_Query
10. THE System SHALL использовать простое среднее арифметическое для отображения на карточках, но байесовское среднее для топ-списков в админ-панели

### Requirement 8: Защита от ботов и накрутки

**User Story:** Как система, я должна защищаться от ботов и накрутки, чтобы обеспечить честность рейтингов и комментариев.

#### Acceptance Criteria

1. WHEN пользователь регистрируется, THE System SHALL отображать CAPTCHA (hCaptcha или reCAPTCHA)
2. WHEN пользователь не проходит CAPTCHA, THE System SHALL отклонить регистрацию
3. THE System SHALL применять rate limiting для всех критических действий:
   - Регистрация: максимум 3 попытки в час с одного IP
   - Комментарии: максимум 5 в час на пользователя
   - Оценки: максимум 20 в час на пользователя
   - Изменение профиля: максимум 10 в час на пользователя
4. THE System SHALL логировать подозрительную активность (множественные оценки за короткое время)
5. THE System SHALL блокировать пользователей с подозрительной активностью на 24 часа
6. THE System SHALL хранить информацию о rate limits в Supabase (таблица rate_limits)
7. WHEN пользователь превышает лимит, THE System SHALL отобразить сообщение "Слишком много действий. Попробуйте позже."

### Requirement 9: Расширенная система избранного с категориями

**User Story:** Как пользователь, я хочу организовывать избранное по категориям просмотра, чтобы лучше управлять своим списком.

#### Acceptance Criteria

1. WHEN пользователь добавляет аниме в избранное, THE System SHALL предложить выбрать статус просмотра:
   - "Смотрю" (watching)
   - "Планирую" (plan_to_watch)
   - "Завершено" (completed)
   - "Брошено" (dropped)
   - "Отложено" (on_hold)
2. WHEN пользователь выбирает статус, THE System SHALL сохранить его в поле watch_status таблицы favorites
3. WHEN пользователь открывает страницу избранного, THE System SHALL отображать вкладки для каждого статуса
4. WHEN пользователь переключает вкладку, THE System SHALL отфильтровать аниме по выбранному статусу
5. WHEN пользователь изменяет статус аниме, THE System SHALL обновить watch_status в таблице favorites
6. THE System SHALL отображать счетчики количества аниме в каждой категории
7. THE System SHALL сохранять дату добавления и дату последнего изменения статуса
8. WHEN пользователь удаляет аниме из избранного, THE System SHALL удалить запись независимо от статуса

### Requirement 10: База данных для новых функций

**User Story:** Как система, я должна хранить данные для новых функций, чтобы обеспечить их работу.

#### Acceptance Criteria

1. THE System SHALL создать таблицу moderators с полями:
   - id (UUID, primary key)
   - user_id (UUID, foreign key to auth.users)
   - email (TEXT, unique)
   - added_by (UUID, foreign key to auth.users)
   - created_at (TIMESTAMP)
2. THE System SHALL создать таблицу comments с полями:
   - id (UUID, primary key)
   - user_id (UUID, foreign key to auth.users)
   - anime_id (INTEGER)
   - content (TEXT)
   - is_deleted (BOOLEAN, default false)
   - deleted_by (UUID, nullable, foreign key to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
3. THE System SHALL создать таблицу ratings с полями:
   - id (UUID, primary key)
   - user_id (UUID, foreign key to auth.users)
   - anime_id (INTEGER)
   - rating (INTEGER, 1-10)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - UNIQUE constraint на (user_id, anime_id)
4. THE System SHALL создать таблицу rate_limits с полями:
   - id (UUID, primary key)
   - user_id (UUID, foreign key to auth.users)
   - action_type (TEXT)
   - action_count (INTEGER)
   - window_start (TIMESTAMP)
   - is_blocked (BOOLEAN, default false)
   - blocked_until (TIMESTAMP, nullable)
5. THE System SHALL обновить таблицу favorites, добавив поле:
   - watch_status (TEXT, default 'plan_to_watch')
   - status_updated_at (TIMESTAMP)
6. THE System SHALL обновить таблицу profiles, добавив поля:
   - is_admin (BOOLEAN, default false)
   - avatar_url (TEXT, nullable)
   - bio (TEXT, nullable)
   - last_active (TIMESTAMP)
7. THE System SHALL создать database trigger для автоматической установки is_admin = true для email lifeshindo96@gmail.com при регистрации
8. THE System SHALL настроить Row Level Security для всех новых таблиц
8. THE System SHALL создать индексы для оптимизации запросов:
   - comments: (anime_id, created_at)
   - ratings: (anime_id), (user_id, anime_id)
   - rate_limits: (user_id, action_type, window_start)

### Requirement 11: Supabase Storage для аватаров

**User Story:** Как система, я должна хранить аватары пользователей, чтобы обеспечить кастомизацию профилей.

#### Acceptance Criteria

1. THE System SHALL создать bucket "avatars" в Supabase Storage
2. THE System SHALL настроить публичный доступ к bucket "avatars"
3. THE System SHALL ограничить размер файлов до 2MB
4. THE System SHALL разрешить только форматы: image/jpeg, image/png, image/webp
5. THE System SHALL использовать user_id в качестве имени файла аватара (например: {user_id}.jpg)
6. WHEN пользователь загружает новый аватар, THE System SHALL перезаписать существующий файл с тем же именем (upsert: true)
7. THE System SHALL применять Row Level Security: пользователи могут загружать только свои аватары (проверка user_id в имени файла)
8. THE System SHALL автоматически определять расширение файла и сохранять его в avatar_url

### Requirement 12: Производительность и оптимизация

**User Story:** Как пользователь, я хочу, чтобы новые функции работали быстро, чтобы не ухудшать опыт использования.

#### Acceptance Criteria

1. THE System SHALL кэшировать статистику админ-панели на 5 минут
2. THE System SHALL использовать пагинацию для комментариев (20 комментариев на страницу)
3. THE System SHALL использовать виртуализацию для длинных списков в админ-панели
4. THE System SHALL оптимизировать запросы к базе данных с помощью индексов
5. THE System SHALL использовать React Query для кэширования всех данных
6. THE System SHALL применять debounce для поиска модераторов (300ms)
7. THE System SHALL использовать оптимистичные обновления для оценок и комментариев

