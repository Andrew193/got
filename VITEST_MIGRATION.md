# Миграция с Karma/Jasmine на Vitest

## ✅ Что уже сделано

1. ✅ Установлен Vitest и необходимые зависимости
2. ✅ Создан `vitest.config.ts`
3. ✅ Создан `src/test-setup.ts` с инициализацией Angular и Jasmine compatibility layer
4. ✅ Обновлён `tsconfig.spec.json` (заменён `jasmine` на `vitest/globals`)
5. ✅ Удалены Karma/Jasmine пакеты
6. ✅ Обновлены npm скрипты в `package.json`
7. ✅ Удалена конфигурация Karma из `angular.json`

## 🚀 Новые команды для тестов

```bash
npm test              # Запуск в watch режиме
npm run test:ui       # Запуск с UI интерфейсом
npm run test:run      # Одноразовый запуск всех тестов
npm run test:coverage # Запуск с coverage отчётом
```

## 📊 Текущий статус

- **Всего тестов**: 226
- **Проходит**: 40 (17.7%)
- **Падает**: 186 (82.3%)

Большинство тестов падают из-за использования Jasmine API, которое нужно мигрировать на Vitest.

## 🔧 Как мигрировать тесты

### 1. Импорты

**Было (Jasmine):**

```typescript
// Нет явных импортов, всё глобально
```

**Стало (Vitest):**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
```

### 2. Spy/Mock функции

**Было:**

```typescript
const spy = jasmine.createSpy('myFunc');
const mockObj = jasmine.createSpyObj('MyService', ['method1', 'method2']);
```

**Стало:**

```typescript
const spy = vi.fn();
const mockObj = {
  method1: vi.fn(),
  method2: vi.fn(),
};
```

### 3. Spy с возвращаемым значением

**Было:**

```typescript
spy.and.returnValue(42);
spy.and.returnValues(1, 2, 3);
```

**Стало:**

```typescript
spy.mockReturnValue(42);
spy.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3);
```

### 4. Проверка вызовов

**Было:**

```typescript
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledWith(arg1, arg2);
expect(spy).toHaveBeenCalledTimes(3);
```

**Стало:**

```typescript
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledWith(arg1, arg2);
expect(spy).toHaveBeenCalledTimes(3);
// Или более явно:
expect(spy).toBeCalled();
expect(spy).toBeCalledWith(arg1, arg2);
```

### 5. Async тесты

**Было:**

```typescript
it('async test', async () => {
  await waitForAsync(() => {
    // test code
  })();
});
```

**Стало:**

```typescript
it('async test', async () => {
  // test code - просто используйте async/await
});
```

### 6. Таймеры

**Было:**

```typescript
jasmine.clock().install();
jasmine.clock().tick(1000);
jasmine.clock().uninstall();
```

**Стало:**

```typescript
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

### 7. Spy на методы объектов

**Было:**

```typescript
spyOn(obj, 'method').and.returnValue(42);
```

**Стало:**

```typescript
vi.spyOn(obj, 'method').mockReturnValue(42);
```

## 📝 Пример полной миграции теста

### До (Jasmine):

```typescript
describe('MyService', () => {
  let service: MyService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [MyService, { provide: HttpClient, useValue: httpSpy }],
    });

    service = TestBed.inject(MyService);
  });

  it('should fetch data', () => {
    httpSpy.get.and.returnValue(of({ data: 'test' }));

    service.getData().subscribe(result => {
      expect(result.data).toBe('test');
    });

    expect(httpSpy.get).toHaveBeenCalledWith('/api/data');
  });
});
```

### После (Vitest):

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;
  let httpMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [MyService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(MyService);
  });

  it('should fetch data', () => {
    httpMock.get.mockReturnValue(of({ data: 'test' }));

    service.getData().subscribe(result => {
      expect(result.data).toBe('test');
    });

    expect(httpMock.get).toHaveBeenCalledWith('/api/data');
  });
});
```

## 🎯 Преимущества Vitest

1. **Скорость**: В 10-20 раз быстрее Karma
2. **HMR**: Мгновенное обновление при изменении тестов
3. **UI**: Красивый веб-интерфейс (`npm run test:ui`)
4. **ESM**: Нативная поддержка ES модулей
5. **Vite**: Использует Vite для сборки (быстрее Webpack)
6. **Coverage**: Встроенный coverage без дополнительных плагинов

## 📚 Полезные ссылки

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Migration from Jest](https://vitest.dev/guide/migration.html)
- [Angular + Vitest](https://analogjs.org/docs/packages/vite-plugin-angular/overview)

## 🔄 Следующие шаги

1. Постепенно мигрируйте тесты, начиная с простых
2. Используйте `npm run test:ui` для удобной отладки
3. Запускайте `npm run test:coverage` для проверки покрытия
4. При необходимости обновите CI/CD pipeline для использования новых команд
