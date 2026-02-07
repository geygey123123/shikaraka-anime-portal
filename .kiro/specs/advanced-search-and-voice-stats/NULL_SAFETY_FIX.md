# Исправление ошибки "Cannot read properties of null"

## Проблема

При нажатии на кнопку "Показать связанные" возникала ошибка:
```
Cannot read properties of null (reading 'id')
```

## Причина

В функциях `toggleGroup` и `expandGroup` не было достаточной проверки на null для вложенных свойств объекта `group`. Код проверял только `group`, но не `group.main`, что могло привести к ошибке при попытке доступа к `group.main.id`.

## Решение

### 1. Улучшена проверка в `toggleGroup`:

```typescript
// Было:
const group = currentData.find((g) => g.main.id === animeId);
if (!group) {
  console.warn('toggleGroup: Group not found for animeId:', animeId);
  return;
}

// Стало:
const group = currentData.find((g) => g?.main?.id === animeId);
if (!group || !group.main) {
  console.warn('toggleGroup: Group or group.main not found for animeId:', animeId);
  return;
}
```

### 2. Добавлена optional chaining в `find`:

```typescript
// Было:
return oldData.map((g) => {
  if (g.main.id === animeId) {
    return { ...g, isExpanded: newIsExpanded };
  }
  return g;
});

// Стало:
return oldData.map((g) => {
  if (g?.main?.id === animeId) {
    return { ...g, isExpanded: newIsExpanded };
  }
  return g;
});
```

### 3. Аналогичные изменения в `expandGroup`:

```typescript
// Было:
if (group.main.id === animeId) {
  return { ...group, related: sortedRelated, isExpanded: true };
}

// Стало:
if (group?.main?.id === animeId) {
  return { ...group, related: sortedRelated, isExpanded: true };
}
```

## Что изменилось

### Optional Chaining (`?.`)
Использование `?.` гарантирует, что если `group` или `group.main` равны `null` или `undefined`, выражение вернет `undefined` вместо выброса ошибки.

### Дополнительная проверка
Добавлена явная проверка `!group.main` для раннего выхода из функции, если структура данных некорректна.

### Улучшенное логирование
Сообщения в консоли теперь более информативны и указывают на конкретную проблему.

## Тестирование

### Проверьте:

1. **Поиск аниме** (например, "Naruto")
2. **Нажмите "Показать связанные"**
   - Не должно быть ошибок в консоли
   - Должен появиться спиннер "Загрузка..."
   - Связанные аниме должны загрузиться
3. **Нажмите "Скрыть связанные"**
   - Связанные аниме должны скрыться
   - Не должно быть ошибок

## Файлы изменены

- `src/hooks/useSearch.ts` - добавлена null safety с optional chaining

## Сборка

✅ Сборка успешна без ошибок
✅ TypeScript проверки пройдены
✅ Все предупреждения исправлены

## Статус

✅ **ИСПРАВЛЕНО** - Ошибка "Cannot read properties of null" больше не должна возникать
