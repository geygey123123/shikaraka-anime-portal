# Design Document: ShiKaraKa V2 Features

## Overview

Это расширение функциональности ShiKaraKa, добавляющее продвинутые возможности для управления контентом, пользователями и модерацией. Дизайн сохраняет существующую архитектуру и стиль Modern Dark Cinema, добавляя новые компоненты и сервисы.

### New Features Summary

1. **Пагинация** - Навигация по страницам популярных аниме
2. **Профили** - Кастомизация username и avatar
3. **Админ-панель** - Статистика и управление
4. **Модераторы** - Система назначения модераторов
5. **Комментарии** - Обсуждения под аниме
6. **Рейтинги** - Собственная система оценок
7. **Защита** - CAPTCHA и rate limiting
8. **Избранное 2.0** - Категории просмотра

## Architecture Updates

### New Database Tables

```sql
-- Moderators table
CREATE TABLE moderators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Rate limits table
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  action_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Update favorites table
ALTER TABLE favorites ADD COLUMN watch_status TEXT DEFAULT 'plan_to_watch';
ALTER TABLE favorites ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN bio TEXT;
ALTER TABLE profiles ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to set admin flag for specific email
CREATE OR REPLACE FUNCTION set_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'lifeshindo96@gmail.com' THEN
    UPDATE profiles SET is_admin = true WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_flag();
```


### Component Architecture

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminPanel.tsx          # Главная панель администратора
│   │   ├── StatisticsCard.tsx      # Карточка статистики
│   │   ├── UserActivityChart.tsx   # График активности
│   │   ├── ModeratorManager.tsx    # Управление модераторами
│   │   └── TopAnimeList.tsx        # Топ аниме
│   ├── comments/
│   │   ├── CommentSection.tsx      # Секция комментариев
│   │   ├── CommentForm.tsx         # Форма добавления
│   │   ├── CommentItem.tsx         # Отдельный комментарий
│   │   └── CommentModeration.tsx   # Панель модерации
│   ├── profile/
│   │   ├── ProfilePage.tsx         # Страница профиля
│   │   ├── ProfileEditor.tsx       # Редактор профиля
│   │   ├── AvatarUpload.tsx        # Загрузка аватара
│   │   └── ProfileStats.tsx        # Статистика пользователя
│   ├── rating/
│   │   ├── RatingDisplay.tsx       # Отображение рейтинга
│   │   ├── RatingInput.tsx         # Ввод оценки (звезды)
│   │   └── RatingStats.tsx         # Статистика оценок
│   ├── pagination/
│   │   └── Pagination.tsx          # Компонент пагинации
│   └── captcha/
│       └── CaptchaField.tsx        # CAPTCHA при регистрации
├── hooks/
│   ├── useComments.ts              # Хуки для комментариев
│   ├── useRatings.ts               # Хуки для рейтингов
│   ├── useProfile.ts               # Хуки для профиля
│   ├── useAdmin.ts                 # Хуки для админ-панели
│   ├── useModerators.ts            # Хуки для модераторов
│   ├── useRateLimit.ts             # Хуки для rate limiting
│   └── usePagination.ts            # Хуки для пагинации
├── services/
│   ├── comments.service.ts         # API для комментариев
│   ├── ratings.service.ts          # API для рейтингов
│   ├── admin.service.ts            # API для админ-панели
│   ├── moderators.service.ts       # API для модераторов
│   ├── rateLimit.service.ts        # API для rate limiting
│   └── storage.service.ts          # API для Supabase Storage
├── pages/
│   ├── Profile.tsx                 # Страница профиля
│   ├── AdminPanel.tsx              # Страница админ-панели
│   └── ModerationPanel.tsx         # Страница модерации
└── utils/
    ├── captcha.ts                  # Утилиты для CAPTCHA
    ├── rateLimit.ts                # Утилиты для rate limiting
    └── validation.ts               # Валидация данных
```

## Component Designs

### 1. Pagination Component

**Interface**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}
```

**Behavior**:
- Отображает кнопки "Предыдущая" и "Следующая"
- Показывает номера страниц (с многоточием для больших диапазонов)
- Disabled состояние для кнопок на первой/последней странице
- Прокрутка вверх при смене страницы

**Implementation**:
```typescript
const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading 
}) => {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
      >
        Предыдущая
      </button>
      
      <span className="text-gray-400">
        Страница {currentPage} из {totalPages}
      </span>
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
      >
        Следующая
      </button>
    </div>
  );
};
```


### 2. Profile Editor Component

**Interface**:
```typescript
interface ProfileEditorProps {
  profile: Profile;
  onSave: (updates: Partial<Profile>) => Promise<void>;
}

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}
```

**Behavior**:
- Форма редактирования username и bio
- Компонент загрузки аватара
- Валидация username (3-20 символов)
- Предпросмотр аватара
- Кнопка сохранения с loading состоянием

### 3. Comment Section Component

**Interface**:
```typescript
interface CommentSectionProps {
  animeId: number;
  isAuthenticated: boolean;
  currentUserId?: string;
  isModerator?: boolean;
}
```

**Behavior**:
- Отображает список комментариев с пагинацией
- Форма добавления комментария для авторизованных
- Кнопка удаления для автора и модераторов
- Отображение username и avatar автора
- Сортировка от новых к старым

**Implementation**:
```typescript
const CommentSection: React.FC<CommentSectionProps> = ({
  animeId,
  isAuthenticated,
  currentUserId,
  isModerator
}) => {
  const { data: comments, isLoading } = useComments(animeId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Комментарии</h2>
      
      {isAuthenticated ? (
        <CommentForm onSubmit={(content) => addComment.mutate({ animeId, content })} />
      ) : (
        <p className="text-gray-400">Войдите, чтобы оставить комментарий</p>
      )}
      
      <div className="mt-6 space-y-4">
        {comments?.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canDelete={comment.user_id === currentUserId || isModerator}
            onDelete={() => deleteComment.mutate(comment.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 4. Rating Input Component

**Interface**:
```typescript
interface RatingInputProps {
  animeId: number;
  currentRating?: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}
```

**Behavior**:
- Отображает 10 звезд для оценки
- Hover эффект для предпросмотра оценки
- Подсветка текущей оценки пользователя
- Disabled состояние при отправке

**Implementation**:
```typescript
const RatingInput: React.FC<RatingInputProps> = ({
  animeId,
  currentRating,
  onRate,
  disabled
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          onMouseEnter={() => setHoverRating(rating)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={disabled}
          className="text-2xl transition-colors"
        >
          <Star
            fill={rating <= (hoverRating || currentRating || 0) ? '#ff0055' : 'none'}
            stroke="#ff0055"
          />
        </button>
      ))}
    </div>
  );
};
```

### 5. Admin Panel Component

**Interface**:
```typescript
interface AdminPanelProps {
  isAdmin: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFavorites: number;
  totalComments: number;
  totalRatings: number;
  topAnime: Array<{ anime_id: number; count: number; anime_name: string }>;
  topRated: Array<{ anime_id: number; avg_rating: number; anime_name: string }>;
}
```

**Behavior**:
- Проверка прав администратора
- Отображение карточек со статистикой
- График активности пользователей
- Таблицы топ-аниме
- Раздел управления модераторами


### 6. Watch Status Selector Component

**Interface**:
```typescript
interface WatchStatusSelectorProps {
  animeId: number;
  currentStatus?: WatchStatus;
  onStatusChange: (status: WatchStatus) => void;
}

type WatchStatus = 'watching' | 'plan_to_watch' | 'completed' | 'dropped' | 'on_hold';
```

**Behavior**:
- Dropdown с выбором статуса
- Иконки для каждого статуса
- Цветовая кодировка статусов
- Обновление при выборе

**Implementation**:
```typescript
const WATCH_STATUSES = [
  { value: 'watching', label: 'Смотрю', icon: Play, color: '#ff0055' },
  { value: 'plan_to_watch', label: 'Планирую', icon: Clock, color: '#3b82f6' },
  { value: 'completed', label: 'Завершено', icon: Check, color: '#10b981' },
  { value: 'dropped', label: 'Брошено', icon: X, color: '#ef4444' },
  { value: 'on_hold', label: 'Отложено', icon: Pause, color: '#f59e0b' },
];
```

### 7. CAPTCHA Component

**Interface**:
```typescript
interface CaptchaFieldProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
}
```

**Behavior**:
- Интеграция с hCaptcha или reCAPTCHA
- Отображение виджета CAPTCHA
- Callback при успешной верификации
- Обработка ошибок

**Implementation**:
```typescript
import HCaptcha from '@hcaptcha/react-hcaptcha';

const CaptchaField: React.FC<CaptchaFieldProps> = ({ onVerify, onError }) => {
  return (
    <HCaptcha
      sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
      onVerify={onVerify}
      onError={onError}
    />
  );
};
```

## API Services

### Comments Service

```typescript
class CommentsService {
  async getComments(animeId: number, page: number = 1): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('anime_id', animeId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * 20, page * 20 - 1);
    
    if (error) throw error;
    return data;
  }

  async addComment(animeId: number, content: string, userId: string): Promise<Comment> {
    // Check rate limit
    await this.checkRateLimit(userId, 'comment');
    
    const { data, error } = await supabase
      .from('comments')
      .insert({ anime_id: animeId, content, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update rate limit
    await this.updateRateLimit(userId, 'comment');
    
    return data;
  }

  async deleteComment(commentId: string, userId: string, isModerator: boolean): Promise<void> {
    if (isModerator) {
      await supabase
        .from('comments')
        .update({ is_deleted: true, deleted_by: userId })
        .eq('id', commentId);
    } else {
      await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
    }
  }
}
```

### Ratings Service

```typescript
class RatingsService {
  // Минимальное количество оценок для байесовского среднего
  private readonly MIN_VOTES = 10;
  
  async getRating(animeId: number): Promise<{ average: number; weighted: number; count: number }> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('anime_id', animeId);
    
    if (error) throw error;
    
    const count = data.length;
    const average = count > 0 
      ? data.reduce((sum, r) => sum + r.rating, 0) / count 
      : 0;
    
    // Вычисляем байесовское среднее для топ-списков
    const globalAverage = await this.getGlobalAverage();
    const weighted = this.calculateBayesianAverage(average, count, globalAverage);
    
    return { average, weighted, count };
  }
  
  private async getGlobalAverage(): Promise<number> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating');
    
    if (error || !data || data.length === 0) return 5.0; // Default
    
    return data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  }
  
  private calculateBayesianAverage(
    animeAverage: number, 
    animeVotes: number, 
    globalAverage: number
  ): number {
    // Формула IMDB: (v / (v + m)) * R + (m / (v + m)) * C
    // v = количество оценок для аниме
    // m = минимальное количество оценок
    // R = среднее для аниме
    // C = глобальное среднее
    const v = animeVotes;
    const m = this.MIN_VOTES;
    const R = animeAverage;
    const C = globalAverage;
    
    return (v / (v + m)) * R + (m / (v + m)) * C;
  }

  async getUserRating(animeId: number, userId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('anime_id', animeId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.rating || null;
  }

  async setRating(animeId: number, rating: number, userId: string): Promise<void> {
    // Check rate limit
    await this.checkRateLimit(userId, 'rating');
    
    const { error } = await supabase
      .from('ratings')
      .upsert({
        anime_id: animeId,
        rating,
        user_id: userId,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Update rate limit
    await this.updateRateLimit(userId, 'rating');
  }
  
  async getTopRatedAnime(limit: number = 10): Promise<Array<any>> {
    // Получаем все рейтинги
    const { data } = await supabase
      .from('ratings')
      .select('anime_id, rating');
    
    if (!data) return [];
    
    // Группируем по anime_id
    const grouped = data.reduce((acc, item) => {
      const existing = acc.find(a => a.anime_id === item.anime_id);
      if (existing) {
        existing.total += item.rating;
        existing.count++;
      } else {
        acc.push({ anime_id: item.anime_id, total: item.rating, count: 1 });
      }
      return acc;
    }, [] as Array<any>);
    
    // Вычисляем байесовское среднее для каждого
    const globalAverage = await this.getGlobalAverage();
    
    return grouped
      .map(item => ({
        anime_id: item.anime_id,
        average: item.total / item.count,
        weighted: this.calculateBayesianAverage(
          item.total / item.count,
          item.count,
          globalAverage
        ),
        count: item.count
      }))
      .sort((a, b) => b.weighted - a.weighted)
      .slice(0, limit);
  }
}
```


### Admin Service

```typescript
class AdminService {
  async getStatistics(): Promise<AdminStats> {
    const [users, activeUsers, favorites, comments, ratings] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getTotalFavorites(),
      this.getTotalComments(),
      this.getTotalRatings()
    ]);
    
    const [topAnime, topRated] = await Promise.all([
      this.getTopAnime(),
      this.getTopRated()
    ]);
    
    return {
      totalUsers: users,
      activeUsers,
      totalFavorites: favorites,
      totalComments: comments,
      totalRatings: ratings,
      topAnime,
      topRated
    };
  }

  private async getTotalUsers(): Promise<number> {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getActiveUsers(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', sevenDaysAgo.toISOString());
    
    return count || 0;
  }

  private async getTopAnime(): Promise<Array<any>> {
    const { data } = await supabase
      .from('favorites')
      .select('anime_id, anime_name')
      .limit(10);
    
    // Group by anime_id and count
    const grouped = data?.reduce((acc, item) => {
      const existing = acc.find(a => a.anime_id === item.anime_id);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ anime_id: item.anime_id, anime_name: item.anime_name, count: 1 });
      }
      return acc;
    }, [] as Array<any>);
    
    return grouped?.sort((a, b) => b.count - a.count).slice(0, 10) || [];
  }

  private async getTopRated(): Promise<Array<any>> {
    // Используем байесовское среднее для топ-списка
    return await ratingsService.getTopRatedAnime(10);
  }
}
```

### Rate Limit Service

```typescript
class RateLimitService {
  private limits = {
    comment: { max: 5, window: 3600 }, // 5 per hour
    rating: { max: 20, window: 3600 }, // 20 per hour
    profile_update: { max: 10, window: 3600 }, // 10 per hour
    registration: { max: 3, window: 3600 } // 3 per hour per IP
  };

  async checkRateLimit(userId: string, actionType: string): Promise<void> {
    const limit = this.limits[actionType];
    if (!limit) return;
    
    const { data } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('action_type', actionType)
      .single();
    
    if (!data) {
      // First action, create record
      await supabase.from('rate_limits').insert({
        user_id: userId,
        action_type: actionType,
        action_count: 1,
        window_start: new Date().toISOString()
      });
      return;
    }
    
    const windowStart = new Date(data.window_start);
    const now = new Date();
    const windowElapsed = (now.getTime() - windowStart.getTime()) / 1000;
    
    if (windowElapsed > limit.window) {
      // Reset window
      await supabase
        .from('rate_limits')
        .update({
          action_count: 1,
          window_start: now.toISOString(),
          is_blocked: false,
          blocked_until: null
        })
        .eq('id', data.id);
      return;
    }
    
    if (data.is_blocked && data.blocked_until) {
      const blockedUntil = new Date(data.blocked_until);
      if (now < blockedUntil) {
        throw new Error('Слишком много действий. Попробуйте позже.');
      }
    }
    
    if (data.action_count >= limit.max) {
      // Block user
      await supabase
        .from('rate_limits')
        .update({
          is_blocked: true,
          blocked_until: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', data.id);
      
      throw new Error('Слишком много действий. Попробуйте позже.');
    }
    
    // Increment count
    await supabase
      .from('rate_limits')
      .update({ action_count: data.action_count + 1 })
      .eq('id', data.id);
  }
}
```


### Storage Service (Avatars)

```typescript
class StorageService {
  private bucket = 'avatars';

  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Файл слишком большой. Максимум 2MB.');
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Неподдерживаемый формат. Используйте JPG, PNG или WebP.');
    }
    
    // Определяем расширение файла
    const extension = file.type.split('/')[1];
    const filename = `${userId}.${extension}`;
    
    // Upload to Supabase Storage (перезапишет существующий файл)
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true // Перезаписываем существующий файл
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(filename);
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
    
    return publicUrl;
  }
}
```

## React Query Hooks

### useComments Hook

```typescript
export const useComments = (animeId: number, page: number = 1) => {
  return useQuery({
    queryKey: ['comments', animeId, page],
    queryFn: () => commentsService.getComments(animeId, page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animeId, content }: { animeId: number; content: string }) => {
      const { user } = useAuth();
      return commentsService.addComment(animeId, content, user!.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['comments', variables.animeId]);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: string) => {
      const { user } = useAuth();
      const { isModerator } = useModerators();
      return commentsService.deleteComment(commentId, user!.id, isModerator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
    },
  });
};
```

### useRatings Hook

```typescript
export const useAnimeRating = (animeId: number) => {
  return useQuery({
    queryKey: ['rating', animeId],
    queryFn: () => ratingsService.getRating(animeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserRating = (animeId: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userRating', animeId, user?.id],
    queryFn: () => ratingsService.getUserRating(animeId, user!.id),
    enabled: !!user,
  });
};

export const useSetRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animeId, rating }: { animeId: number; rating: number }) => {
      const { user } = useAuth();
      return ratingsService.setRating(animeId, rating, user!.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['rating', variables.animeId]);
      queryClient.invalidateQueries(['userRating', variables.animeId]);
    },
  });
};
```

### useAdmin Hook

```typescript
export const useAdminStats = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const isAdmin = profile?.is_admin === true;
  
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStatistics(),
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  
  return profile?.is_admin === true;
};

export const useModerators = () => {
  return useQuery({
    queryKey: ['moderators'],
    queryFn: async () => {
      const { data } = await supabase
        .from('moderators')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });
};

export const useIsModerator = () => {
  const { user } = useAuth();
  const { data: moderators } = useModerators();
  
  return moderators?.some(m => m.user_id === user?.id) || false;
};
```


## Security & Performance

### Row Level Security Policies

```sql
-- Moderators table
CREATE POLICY "Admins can manage moderators"
  ON moderators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view moderators"
  ON moderators FOR SELECT
  USING (true);

-- Comments table
CREATE POLICY "Users can view non-deleted comments"
  ON comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can update comments"
  ON comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE moderators.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Ratings table
CREATE POLICY "Users can view all ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own ratings"
  ON ratings FOR ALL
  USING (auth.uid() = user_id);

-- Rate limits table
CREATE POLICY "Users can view own rate limits"
  ON rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON rate_limits FOR ALL
  USING (true);

-- Admin statistics views (защита через RLS)
CREATE POLICY "Only admins can view statistics"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );
```

### Indexes for Performance

```sql
-- Comments indexes
CREATE INDEX idx_comments_anime_id ON comments(anime_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_anime_created ON comments(anime_id, created_at DESC);

-- Ratings indexes
CREATE INDEX idx_ratings_anime_id ON ratings(anime_id);
CREATE INDEX idx_ratings_user_anime ON ratings(user_id, anime_id);

-- Rate limits indexes
CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action_type);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- Moderators indexes
CREATE INDEX idx_moderators_user_id ON moderators(user_id);
CREATE INDEX idx_moderators_email ON moderators(email);
```

### Caching Strategy

- **Admin Stats**: 5 минут staleTime
- **Comments**: 2 минуты staleTime, пагинация по 20
- **Ratings**: 5 минут staleTime
- **User Profile**: 10 минут staleTime
- **Moderators List**: 10 минут staleTime

### Rate Limiting Rules

| Action | Limit | Window | Block Duration |
|--------|-------|--------|----------------|
| Registration | 3 | 1 hour | 24 hours |
| Comment | 5 | 1 hour | 24 hours |
| Rating | 20 | 1 hour | 24 hours |
| Profile Update | 10 | 1 hour | 24 hours |

## UI/UX Considerations

### Watch Status Colors

```typescript
const STATUS_COLORS = {
  watching: '#ff0055',      // Cinema accent
  plan_to_watch: '#3b82f6', // Blue
  completed: '#10b981',     // Green
  dropped: '#ef4444',       // Red
  on_hold: '#f59e0b'        // Orange
};
```

### Responsive Design

- **Admin Panel**: Карточки статистики адаптируются к мобильным (1 колонка)
- **Comments**: Полная ширина на мобильных
- **Rating Stars**: Уменьшенный размер на мобильных
- **Profile Editor**: Вертикальный layout на мобильных

### Loading States

- Skeleton screens для комментариев
- Spinner для загрузки аватара
- Disabled состояния для кнопок при отправке
- Optimistic updates для оценок

### Error Handling

- Toast notifications для успеха/ошибок
- Валидация форм в реальном времени
- Понятные сообщения об ошибках rate limiting
- Fallback UI для ошибок загрузки

## Deployment Considerations

### Environment Variables

```bash
# Existing
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# New
VITE_HCAPTCHA_SITE_KEY=
VITE_ADMIN_EMAIL=lifeshindo96@gmail.com
```

### Database Migrations

1. Create new tables (moderators, comments, ratings, rate_limits)
2. Alter existing tables (favorites, profiles)
3. Create indexes
4. Set up RLS policies
5. Create Supabase Storage bucket for avatars

### Dependencies to Add

```json
{
  "@hcaptcha/react-hcaptcha": "^1.10.0",
  "recharts": "^2.10.0",
  "react-dropzone": "^14.2.0"
}
```

