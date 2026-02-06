# Implementation Plan: ShiKaraKa V2 Features

## Overview

Сокращенный план для экономии времени и AI credits. Задачи объединены в крупные блоки.

## Tasks

### Phase 1: Database & Infrastructure

- [ ] 1. Создание базы данных (все таблицы и миграции)
  - Создать таблицы: moderators, comments, ratings, rate_limits
  - Обновить таблицы: profiles (is_admin, avatar_url, bio), favorites (watch_status)
  - Настроить все RLS policies и индексы
  - Создать trigger для автоматической установки is_admin для lifeshindo96@gmail.com
  - _Requirements: 10.*_

- [ ] 2. Настройка Supabase Storage и зависимостей
  - Создать bucket "avatars" с ограничениями (2MB, JPG/PNG/WebP)
  - Установить: @hcaptcha/react-hcaptcha, recharts, react-dropzone, react-hot-toast
  - _Requirements: 11.*, 8.1_

### Phase 2: Core Services

- [ ] 3. Реализация всех сервисов
  - Создать CommentsService (getComments, addComment, deleteComment с rate limiting)
  - Создать RatingsService (getRating с байесовским средним, setRating, getTopRated)
  - Создать AdminService (getStatistics со всеми метриками)
  - Создать ModeratorsService (getModerators, addModerator, removeModerator)
  - Создать RateLimitService (checkRateLimit, блокировка на 24ч)
  - Создать StorageService (uploadAvatar с upsert, валидация)
  - _Requirements: 5.*, 7.*, 3.*, 4.*, 8.*, 2.*_

### Phase 3: React Query Hooks

- [ ] 4. Создание всех хуков
  - Хуки для комментариев: useComments, useAddComment, useDeleteComment
  - Хуки для рейтингов: useAnimeRating, useUserRating, useSetRating
  - Хуки для админки: useAdminStats, useIsAdmin, useModerators, useIsModerator
  - Хуки для профиля: useProfile, useUpdateProfile, useUploadAvatar
  - Хук для пагинации: usePagination
  - _Requirements: 5.*, 7.*, 3.*, 4.*, 2.*, 1.*_

### Phase 4: UI Components - Core

- [ ] 5. Базовые UI компоненты
  - Pagination (кнопки, прокрутка вверх)
  - CaptchaField (hCaptcha интеграция)
  - WatchStatusSelector (dropdown с 5 статусами)
  - _Requirements: 1.*, 8.1, 9.*_

- [ ] 6. Профили и аватары
  - ProfilePage (отображение данных)
  - ProfileEditor (форма редактирования username/bio)
  - AvatarUpload (react-dropzone, предпросмотр)
  - Обновить Header для отображения аватара
  - _Requirements: 2.*_

- [ ] 7. Система комментариев
  - CommentSection (список с пагинацией)
  - CommentForm (textarea, валидация 10-1000 символов)
  - CommentItem (username, avatar, кнопка удаления)
  - Интегрировать в AnimeDetail страницу
  - _Requirements: 5.*, 6.*_

- [ ] 8. Система рейтингов
  - RatingDisplay (средний рейтинг, количество оценок)
  - RatingInput (10 звезд, hover эффект)
  - RatingStats (гистограмма с recharts)
  - Интегрировать в AnimeDetail и AnimeCard
  - Заменить Shikimori рейтинг на собственный
  - _Requirements: 7.*_

### Phase 5: Admin & Moderation

- [ ] 9. Админ-панель
  - AdminPanel страница (проверка is_admin через RLS)
  - StatisticsCard компоненты (все метрики)
  - UserActivityChart (график за 30 дней)
  - TopAnimeList и TopRatedList (с байесовским средним)
  - ModeratorManager (список, добавление, удаление)
  - Добавить ссылку в Header (только для is_admin = true)
  - _Requirements: 3.*, 4.*_

- [ ] 10. Модерация
  - ModerationPanel страница (список комментариев)
  - Обновить CommentItem для модераторов (кнопка удаления всех)
  - Добавить ссылку в Header (для модераторов и админа)
  - _Requirements: 6.*_

### Phase 6: Enhanced Features

- [ ] 11. Расширенное избранное
  - Обновить FavoriteButton (dropdown с выбором статуса)
  - Обновить Favorites страницу (вкладки для каждого статуса)
  - FavoriteStatusTabs (5 вкладок с иконками и счетчиками)
  - Обновить useFavorites хук (фильтрация по статусу)
  - _Requirements: 9.*_

- [ ] 12. Защита от ботов
  - Интегрировать CAPTCHA в RegisterForm
  - Интегрировать rate limiting во все действия (комментарии, оценки, профиль)
  - Реализовать систему блокировки на 24 часа
  - Отображение понятных сообщений об ошибках
  - _Requirements: 8.*_

- [ ] 13. Пагинация
  - Обновить Home страницу (состояние страницы, Pagination компонент)
  - Обновить usePopularAnime хук (параметр page, кэширование)
  - Skeleton screens при смене страницы
  - _Requirements: 1.*_

### Phase 7: Polish & Deployment

- [ ] 14. Оптимизация и UI/UX
  - Настроить кэширование для всех хуков (staleTime, invalidation)
  - Добавить toast notifications (react-hot-toast)
  - Добавить loading states и анимации
  - Проверить адаптивность всех компонентов
  - Добавить empty states
  - _Requirements: 12.*_

- [ ] 15. Документация и deployment
  - Обновить README.md (новые функции, скриншоты)
  - Создать ADMIN_GUIDE.md и MODERATOR_GUIDE.md
  - Создать SQL миграции (один файл)
  - Настроить environment variables (.env.example)
  - Применить миграции в Supabase
  - Настроить hCaptcha (получить site key)
  - Обновить Vercel environment variables
  - Deploy и тестирование
  - _Requirements: All_

- [ ] 16. Финальное тестирование
  - Протестировать все функции (пагинация, профили, комментарии, рейтинги)
  - Протестировать админ-панель и модерацию
  - Протестировать защиту (CAPTCHA, rate limiting, блокировка)
  - Протестировать избранное с категориями
  - Настроить мониторинг (Vercel Analytics, Supabase logs)
  - _Requirements: All_

## Notes

- Все задачи выполняются последовательно
- Modern Dark Cinema дизайн для всех компонентов
- Все функции адаптивные
- **Админ-панель защищена через is_admin в БД + RLS** (не через email на фронте!)
- **Аватары используют user_id как имя файла** (upsert: true, без timestamp)
- **Рейтинги: простое среднее для карточек, байесовское для топов**
- CAPTCHA обязательна при регистрации
- Rate limiting для всех критических действий

## Estimated Timeline

- **Phase 1**: 1 день (Database)
- **Phase 2-3**: 2 дня (Services & Hooks)
- **Phase 4**: 3-4 дня (UI Components)
- **Phase 5**: 2 дня (Admin & Moderation)
- **Phase 6**: 2 дня (Enhanced Features)
- **Phase 7**: 2 дня (Polish & Deployment)

**Total**: ~12-14 дней разработки (вместо 20-25)

## Priority Order

1. **Critical**: Database, Services, Hooks (Phase 1-3)
2. **High**: Comments, Ratings, Pagination (Phase 4, 6)
3. **Medium**: Profiles, Admin Panel, Favorites (Phase 4-5, 6)
4. **Important**: Security, Moderation (Phase 5-6)
5. **Polish**: Optimization, Testing, UI/UX (Phase 7)

