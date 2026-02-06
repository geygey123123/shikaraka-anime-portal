# Implementation Plan: ShiKaraKa Anime Portal

## Overview

Этот план разбивает реализацию ShiKaraKa на дискретные шаги, каждый из которых строится на предыдущих. Фокус на инкрементальной разработке с ранней валидацией функциональности. Тесты сокращены для ускорения разработки и экономии AI credits.

## Tasks

- [x] 1. Инициализация проекта и базовая структура
  - Создать Vite + React + TypeScript проект
  - Установить зависимости: Tailwind CSS, React Router, Lucide Icons, React Query, Supabase
  - Настроить Tailwind с кастомными цветами (#0a0a0c, #ff0055)
  - Создать базовую структуру папок (components, hooks, services, types, pages)
  - Создать .env.example с необходимыми переменными
  - _Requirements: 11.1, 11.3_

- [x] 2. Настройка Supabase и схема базы данных
  - [x] 2.1 Создать SQL схему для таблицы profiles
    - Написать CREATE TABLE для profiles с полями id, username, avatar_url, timestamps
    - Настроить Row Level Security policies
    - _Requirements: 6.2_
  
  - [x] 2.2 Создать SQL схему для таблицы favorites
    - Написать CREATE TABLE для favorites с полями id, user_id, shikimori_id, anime_name, added_at
    - Настроить foreign key на auth.users
    - Настроить Row Level Security policies
    - Создать индексы для оптимизации запросов
    - _Requirements: 6.3, 6.5, 6.6_
  
  - [x] 2.3 Настроить Supabase клиент
    - Создать services/supabase.ts с инициализацией клиента
    - Настроить переменные окружения
    - _Requirements: 6.1_

- [x] 3. Реализация TypeScript типов и API сервисов
  - [x] 3.1 Создать типы для Anime данных
    - Определить интерфейсы Anime, AnimeImage, AnimeGenre, AnimeStudio
    - Определить типы User, Profile, Favorite
    - _Requirements: 7.2_
  
  - [x] 3.2 Реализовать Shikimori API сервис
    - Создать ShikimoriService класс с методами getPopularAnime, searchAnime, getAnimeById
    - Обработать ошибки сети и API
    - _Requirements: 7.1, 7.3_
  
  - [ ]* 3.3 Написать property test для API Response Processing
    - **Property 10: API Response Processing**
    - **Validates: Requirements 7.2, 7.4**



- [x] 4. Реализация React Query хуков
  - [x] 4.1 Создать хуки для работы с аниме
    - Реализовать usePopularAnime с кэшированием (staleTime: 5 минут)
    - Реализовать useSearchAnime с условной активацией
    - Реализовать useAnimeDetails с кэшированием (staleTime: 10 минут)
    - _Requirements: 7.5, 7.6_
  
  - [x] 4.2 Создать хуки для аутентификации
    - Реализовать useAuth с подпиской на изменения сессии
    - Реализовать функции login, register, logout
    - _Requirements: 4.2, 4.3, 4.6_
  
  - [x] 4.3 Создать хуки для избранного
    - Реализовать useFavorites для получения списка
    - Реализовать useAddFavorite mutation
    - Реализовать useRemoveFavorite mutation
    - _Requirements: 5.2, 5.4_
  
  - [ ]* 4.4 Написать property test для Authentication Flow
    - **Property 6: Authentication Flow**
    - **Validates: Requirements 4.2, 4.3, 4.4**
  
  - [ ]* 4.5 Написать property test для React Query Cache Utilization
    - **Property 12: React Query Cache Utilization**
    - **Validates: Requirements 7.6**

- [x] 5. Checkpoint - Проверка базовой инфраструктуры
  - Убедиться, что Supabase подключен и таблицы созданы
  - Проверить, что API сервисы работают
  - Убедиться, что React Query хуки возвращают данные
  - Спросить пользователя, если возникли вопросы

- [x] 6. Реализация UI компонентов - Layout
  - [x] 6.1 Создать Header компонент
    - Реализовать навигацию с логотипом
    - Добавить поле поиска с debounce (300ms)
    - Показывать статус аутентификации (кнопки или имя пользователя)
    - Адаптивное меню для мобильных
    - _Requirements: 1.1, 2.1, 4.1, 8.1_
  
  - [x] 6.2 Создать базовые UI компоненты
    - Реализовать Button компонент с вариантами стилей
    - Реализовать ErrorMessage компонент
    - Реализовать SkeletonCard компонент
    - _Requirements: 9.1, 9.2_

- [x] 7. Реализация компонентов аниме
  - [x] 7.1 Создать AnimeCard компонент
    - Отобразить постер с lazy loading
    - Показать название, рейтинг, год
    - Применить градиент overlay
    - Добавить hover эффекты
    - _Requirements: 1.4, 10.2_
  
  - [x] 7.2 Создать AnimeGrid компонент
    - Реализовать адаптивную сетку (6/4/2 колонки)
    - Показывать skeleton screens при загрузке
    - Обработать состояния ошибок
    - _Requirements: 1.3, 1.5, 8.2, 9.1_
  
  - [ ]* 7.3 Написать property test для Anime Card Display Completeness
    - **Property 1: Anime Card Display Completeness**
    - **Validates: Requirements 1.4**
  
  - [ ]* 7.4 Написать unit tests для AnimeGrid
    - Тест отображения skeleton при загрузке
    - Тест отображения сообщения об ошибке
    - _Requirements: 1.3, 9.1, 9.2_

- [x] 8. Реализация VideoPlayer компонента
  - [x] 8.1 Создать VideoPlayer с адаптивным iframe
    - Генерировать URL для Kodik плеера с shikimori_id
    - Обеспечить соотношение сторон 16:9
    - Реализовать fallback при ошибке загрузки с кнопкой "Попробовать другой плеер"
    - Добавить ссылку на страницу аниме на Shikimori как альтернативу
    - Обработать случаи блокировки контента правообладателями
    - _Requirements: 3.4, 3.5, 9.5_
  
  - [ ]* 8.2 Написать property test для Video Player Initialization
    - **Property 5: Video Player Initialization**
    - **Validates: Requirements 3.4**



- [x] 9. Реализация страниц приложения
  - [x] 9.1 Создать Home страницу
    - Отобразить hero-секцию с названием "ShiKaraKa"
    - Интегрировать AnimeGrid с usePopularAnime хуком
    - Обработать состояния загрузки и ошибок
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 9.2 Создать AnimeDetail страницу
    - Отобразить постер в левой колонке
    - Показать информацию о жанрах, статусе, студии
    - Интегрировать VideoPlayer
    - Добавить FavoriteButton для аутентифицированных пользователей
    - Адаптивный layout для мобильных (одна колонка)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 5.1_
  
  - [x] 9.3 Создать Favorites страницу
    - Отобразить сетку избранных аниме пользователя
    - Показать пустое состояние для новых пользователей
    - _Requirements: 5.1_
  
  - [ ]* 9.4 Написать property test для Anime Details Navigation
    - **Property 4: Anime Details Navigation**
    - **Validates: Requirements 3.1, 3.3**

- [x] 10. Реализация аутентификации
  - [x] 10.1 Создать LoginForm компонент
    - Реализовать форму с полями email и пароль
    - Добавить валидацию (email формат, пароль минимум 6 символов)
    - Интегрировать с useAuth хуком
    - Показывать ошибки валидации и аутентификации
    - _Requirements: 4.1, 4.3, 4.5_
  
  - [x] 10.2 Создать RegisterForm компонент
    - Реализовать форму регистрации
    - Добавить валидацию
    - Интегрировать с useAuth хуком
    - Обработать ошибки (email уже существует и т.д.)
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [x] 10.3 Создать AuthModal компонент
    - Модальное окно с переключением между Login и Register
    - Закрытие при успешной аутентификации
    - _Requirements: 4.1_
  
  - [ ]* 10.4 Написать property test для Invalid Credentials Handling
    - **Property 7: Invalid Credentials Handling**
    - **Validates: Requirements 4.5**

- [x] 11. Реализация функциональности избранного
  - [x] 11.1 Создать FavoriteButton компонент
    - Проверять, находится ли аниме в избранном
    - Отображать заполненное/пустое сердце
    - Обрабатывать добавление/удаление через mutations
    - Показывать loading состояние
    - Скрывать для неаутентифицированных пользователей
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 11.2 Написать property test для Favorite Addition
    - **Property 8: Favorite Addition**
    - **Validates: Requirements 5.2, 6.5**
  
  - [ ]* 11.3 Написать property test для Favorite Removal
    - **Property 9: Favorite Removal**
    - **Validates: Requirements 5.4**

- [x] 12. Checkpoint - Проверка основной функциональности
  - Убедиться, что все страницы работают
  - Проверить аутентификацию и избранное
  - Протестировать на мобильных устройствах
  - Спросить пользователя, если возникли вопросы



- [x] 13. Реализация поиска
  - [x] 13.1 Интегрировать поиск в Header
    - Добавить debounce для поискового запроса (300ms)
    - Вызывать useSearchAnime при вводе текста
    - Обновлять AnimeGrid с результатами поиска
    - _Requirements: 2.1_
  
  - [x] 13.2 Обработать состояния поиска
    - Показывать skeleton при выполнении поиска
    - Отображать "Ничего не найдено" при пустых результатах
    - Возвращать популярные аниме при очистке поля
    - _Requirements: 2.2, 2.4, 2.5_
  
  - [ ]* 13.3 Написать property test для Search Query API Integration
    - **Property 2: Search Query API Integration**
    - **Validates: Requirements 2.1**

- [x] 14. Обработка ошибок и edge cases
  - [x] 14.1 Реализовать Error Boundary
    - Создать глобальный Error Boundary компонент
    - Отображать fallback UI при критических ошибках
    - Добавить кнопку перезагрузки страницы
    - _Requirements: 9.2_
  
  - [x] 14.2 Добавить обработку сетевых ошибок
    - Реализовать retry функциональность для failed запросов
    - Показывать понятные сообщения об ошибках
    - Логировать ошибки в консоль
    - _Requirements: 7.3, 9.2, 9.3, 9.4_
  
  - [ ]* 14.3 Написать property test для API Error Handling
    - **Property 11: API Error Handling**
    - **Validates: Requirements 7.3, 9.2, 9.4**

- [x] 15. Оптимизация производительности
  - [x] 15.1 Реализовать code splitting
    - Настроить lazy loading для страниц (Home, AnimeDetail, Favorites)
    - Добавить Suspense с LoadingScreen fallback
    - _Requirements: 10.3_
  
  - [x] 15.2 Оптимизировать компоненты
    - Обернуть AnimeCard в React.memo
    - Использовать useMemo для сортировки/фильтрации
    - Добавить prefetching для anime details при hover на карточке (killer-feature для мгновенной загрузки страницы)
    - _Requirements: 10.5_
  
  - [x] 15.3 Настроить Vite build конфигурацию
    - Настроить manual chunks для vendor кода
    - Оптимизировать размер bundle
    - _Requirements: 10.3_

- [x] 16. Адаптивный дизайн и доступность
  - [x] 16.1 Проверить адаптивность всех компонентов
    - Протестировать на разных размерах экрана (mobile, tablet, desktop)
    - Убедиться в корректной работе сетки (2/4/6 колонок)
    - Проверить одноколоночный layout на AnimeDetail странице
    - _Requirements: 1.5, 3.6, 8.1, 8.2, 8.3_
  
  - [x] 16.2 Обеспечить доступность touch-элементов
    - Проверить минимальный размер кликабельных областей (44x44px)
    - Добавить достаточные отступы для кнопок
    - _Requirements: 8.5_
  
  - [ ]* 16.3 Написать property test для Touch Target Accessibility
    - **Property 13: Touch Target Accessibility**
    - **Validates: Requirements 8.5**

- [x] 17. Финальная интеграция и тестирование
  - [x] 17.1 Настроить React Query Provider
    - Обернуть приложение в QueryClientProvider
    - Настроить глобальные опции (staleTime, cacheTime, retry)
    - _Requirements: 7.5_
  
  - [x] 17.2 Настроить роутинг
    - Настроить React Router с маршрутами
    - Добавить 404 страницу
    - Настроить навигацию между страницами
    - _Requirements: 3.1_
  
  - [x] 17.3 Финальное тестирование
    - Проверить все основные user flows
    - Протестировать на разных браузерах
    - Проверить работу на мобильных устройствах
    - _Requirements: All_

- [x] 18. Checkpoint - Финальная проверка перед deployment
  - Убедиться, что все тесты проходят
  - Проверить отсутствие console errors
  - Протестировать production build локально
  - Спросить пользователя, если возникли вопросы



- [x] 19. Подготовка к deployment
  - [x] 19.1 Создать deployment документацию
    - Написать README.md с описанием проекта
    - Создать DEPLOYMENT.md с пошаговой инструкцией
    - Документировать настройку Supabase
    - Документировать настройку Vercel
    - _Requirements: 11.4, 11.5_
  
  - [x] 19.2 Настроить конфигурацию для Vercel
    - Создать vercel.json с настройками build и headers
    - Настроить rewrites для SPA (важно: все маршруты должны перенаправляться на index.html, чтобы избежать 404 при обновлении страницы)
    - Настроить кэширование статических ресурсов
    - _Requirements: 11.2_
  
  - [x] 19.3 Проверить переменные окружения
    - Убедиться, что .env.example актуален
    - Проверить, что все необходимые переменные документированы
    - _Requirements: 11.1, 11.3_

- [x] 20. Deployment на Vercel
  - [x] 20.1 Подготовить GitHub репозиторий
    - Создать .gitignore с правильными исключениями
    - Закоммитить весь код
    - Запушить в GitHub
    - _Requirements: 11.2_
  
  - [x] 20.2 Настроить Vercel проект
    - Импортировать проект из GitHub
    - Настроить environment variables
    - Запустить первый deployment
    - _Requirements: 11.2_
  
  - [x] 20.3 Post-deployment проверка
    - Протестировать production URL
    - Проверить аутентификацию
    - Проверить API интеграцию
    - Проверить мобильную версию
    - _Requirements: All_

- [x] 21. Исправление критических багов после deployment
  - [x] 21.1 Исправить отображение обложек аниме
    - Проверить URL изображений из Shikimori API
    - Добавить fallback изображение при ошибке загрузки
    - Добавить обработку CORS ошибок для изображений
    - Протестировать отображение на разных устройствах
    - _Requirements: 1.4, 3.2, 10.2_
  
  - [x] 21.2 Исправить иконки в интерфейсе
    - Проверить импорты lucide-react иконок
    - Убедиться что все иконки корректно отображаются
    - Проверить размеры и цвета иконок
    - _Requirements: 1.1, 4.1, 5.1_
  
  - [x] 21.3 Подключить AuthModal к кнопкам входа/регистрации
    - Добавить состояние для управления AuthModal в App.tsx или создать контекст
    - Подключить AuthModal к кнопкам "Войти" и "Регистрация" в Header
    - Обеспечить корректное открытие/закрытие модального окна
    - Протестировать flow регистрации и входа
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 21.4 Финальное тестирование исправлений
    - Проверить отображение обложек на главной странице
    - Проверить работу всех иконок
    - Протестировать регистрацию нового пользователя
    - Протестировать вход существующего пользователя
    - Проверить добавление/удаление из избранного
    - _Requirements: All_

## Notes

- Задачи, помеченные `*`, являются опциональными и могут быть пропущены для ускорения MVP
- Количество тестов сокращено в 2 раза для экономии AI credits
- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property тесты валидируют универсальные свойства корректности
- Unit тесты валидируют конкретные примеры и edge cases
- Все компоненты должны быть адаптивными и работать на мобильных устройствах
- Используется Modern Dark Cinema дизайн (#0a0a0c фон, #ff0055 акценты)
