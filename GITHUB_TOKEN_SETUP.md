# GitHub Personal Access Token Setup

## Проблема
GitHub больше не поддерживает аутентификацию по паролю для Git операций. Нужен Personal Access Token (PAT).

## Решение: 2 варианта

### Вариант 1: GitHub Desktop (РЕКОМЕНДУЕТСЯ - ПРОЩЕ ВСЕГО)

1. **Скачайте GitHub Desktop**: https://desktop.github.com/
2. **Установите и войдите** в свой аккаунт GitHub
3. **Откройте репозиторий**:
   - File → Add Local Repository
   - Выберите папку `shikaraka-anime-portal`
4. **Запушьте изменения**:
   - Нажмите "Push origin" или "Publish repository"
   - Готово! GitHub Desktop автоматически аутентифицируется

### Вариант 2: Personal Access Token (для командной строки)

#### Шаг 1: Создайте токен на GitHub

1. Откройте: https://github.com/settings/tokens
2. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
3. Заполните:
   - **Note**: `ShiKaraKa Upload Token`
   - **Expiration**: `No expiration` (или выберите срок)
   - **Scopes**: Отметьте галочкой **`repo`** (полный доступ к репозиториям)
4. Нажмите **"Generate token"**
5. **ВАЖНО**: Скопируйте токен! Он показывается только один раз!
   - Формат: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Шаг 2: Используйте токен вместо пароля

**Способ A: Сохранить токен в Git (один раз)**

Выполните в командной строке:

```cmd
git config --global credential.helper store
```

Затем при следующем push Git попросит логин и пароль:
- **Username**: `geygey123123`
- **Password**: Вставьте ваш токен (ghp_xxx...)

Git сохранит токен и больше не будет спрашивать.

**Способ B: Использовать токен в URL**

Измените remote URL:

```cmd
git remote set-url origin https://geygey123123:ВАШ_ТОКЕН@github.com/geygey123123/shikaraka-anime-portal.git
```

Замените `ВАШ_ТОКЕН` на реальный токен.

#### Шаг 3: Запустите скрипт снова

```cmd
fix-and-upload.bat
```

## Быстрая проверка

Проверьте текущий remote URL:

```cmd
git remote -v
```

Должно показать:
```
origin  https://github.com/geygey123123/shikaraka-anime-portal.git (fetch)
origin  https://github.com/geygey123123/shikaraka-anime-portal.git (push)
```

## Если всё равно не работает

Используйте **GitHub Desktop** - это самый простой способ!

