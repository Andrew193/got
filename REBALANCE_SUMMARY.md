# 🎯 Ребаланс героев — правильная логика механик

## Шпаргалка по механикам (важно не перепутать!)

| Механика               | delta: -1 на врагах                                | delta: +1 на врагах                             | delta: -1 на союзниках                       | delta: +1 на союзниках           |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------- | -------------------------------------------- | -------------------------------- |
| `effectDurationConfig` | ❌ дот снимется быстрее, враг получит МЕНЬШЕ урона | ✅ дот длится дольше, враг получит БОЛЬШЕ урона | ✅ клинс — союзник быстрее выйдет из дебаффа | ❌ продлевает дебафф на союзнике |

> **Для принудительного тика дота** используй `activateDebuffs` в активном навыке (как у RedKeepAlchemist).

---

## ❌ Текущие проблемы

### Неиспользуемые механики:

- ❌ `effectDurationConfig` — не используется **никем**
- ❌ `cooldownConfig` — не используется **никем**
- ❌ `blockAttackerBuffs` — не используется **никем**
- ⚠️ `dmgM` (пассивный) — только у Lady of DragonStone
- ⚠️ `healAll: false` — не используется
- ⚠️ `activateDebuffs` — только у RedKeepAlchemist

### Герои с пустыми или отсутствующими пассивками:

- BrownWolf — нет пассивки
- IceRiverHunter — нет пассивки
- RedKeepAlchemist — `passive: true` без функционала
- RelinaShow — `passive: true` без функционала
- FreeTrapper — `passive: true` без функционала
- Giant — `passive: true` без функционала
- NightKing — только простые баффы без пассивных механик

---

## ✅ Предложения по ребалансу (исправленные)

---

### 🔥 LadyOfDragonStone (LEGENDARY) — Fire Mage

**Роль:** AOE дамагер + командный хил

**Пассивка "Targaryen Blood":**

```typescript
{
  name: 'Targaryen Blood',
  passive: true,
  // Лечит всех союзников каждый ход
  heal: { healM: 0.05, healAll: true },
  // Пассивный огненный урон всем врагам
  dmgM: 0.08,
  // Продлевает Burning на врагах (дольше горят → больше урона)
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Burning'],
    targets: 'enemies',
  },
}
```

**Активные навыки — добавить `activateDebuffs`** к скиллу Drakarys:

```typescript
activateDebuffs: [this.helper.effects.burning], // принудительный тик Burning при атаке
```

---

### 🔥 RedKeepAlchemist (EPIC) — Wildfire Specialist

**Роль:** DOT-активатор + ускоритель команды

**Пассивка "Unstable Compounds":**

```typescript
{
  name: 'Unstable Compounds',
  passive: true,
  // Ускоряет перезарядку активных навыков союзников
  cooldownConfig: {
    cooldownDelta: -1,
    targetAll: true,
    targets: 'allies',
  },
  // Продлевает Burning/Bleeding на врагах
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Burning', 'Bleeding'],
    targets: 'enemies',
  },
}
```

> Уже имеет `activateDebuffs` на обоих активных навыках — это его фишка.

---

### 🛡️ TargaryenKnight (EPIC) — Shield Master

**Роль:** Танк, блокирует баффы атакующих, защищает команду от броне-дебаффов

**Пассивка "Crown Shield":**

```typescript
{
  name: 'Crown Shield',
  passive: true,
  // Пока жив — враги не получают баффы при атаке
  blockAttackerBuffs: true,
  // Очищает дебаффы брони с союзников быстрее
  effectDurationConfig: {
    delta: -1,
    effectTypes: ['Armor Break', 'Armor corrosion', 'Rusty Sword'],
    targets: 'allies',
  },
}
```

---

### ✝️ Priest (EPIC) — Master Cleric

**Роль:** Хилер + очищение команды от дотов

**Пассивка "Blessing of Lokrand":**

```typescript
{
  name: 'Blessing of Lokrand',
  passive: true,
  // Лечит самого раненого союзника (healAll: false — новая механика)
  heal: { healM: 0.12, healAll: false },
  // Очищает Poison/Bleeding/Burning с союзников быстрее
  effectDurationConfig: {
    delta: -1,
    effectTypes: ['Poison', 'Bleeding', 'Burning'],
    targets: 'allies',
  },
}
```

---

### ❄️ NightKing (LEGENDARY) — Ice God / Raid Boss

**Роль:** Самый мощный враг в игре

**Пассивка "The Night King":**

```typescript
{
  name: 'The Night King',
  passive: true,
  buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff, 1)],
  // Массовый пассивный урон каждый ход
  dmgM: 0.1,
  // Продлевает Freezing на врагах (дольше заморожены)
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Freezing', 'Armor corrosion'],
    targets: 'enemies',
  },
  // Пока жив — враги не получают баффы при атаке
  blockAttackerBuffs: true,
}
```

---

### ❄️ WhiteWalkerGeneral (LEGENDARY) — Ice Commander

**Роль:** Поддержка White Walker команды

**Пассивка "White Walker Commander":**

```typescript
{
  name: 'White Walker Commander',
  passive: true,
  buffs: [this.helper.eS.getEffect(this.helper.effects.defBuff, 1)],
  // Продлевает баффы на союзниках (Defense Bonus, Attack Bonus живут дольше)
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Defense Bonus', 'Attack Bonus'],
    targets: 'allies',
  },
  // Ускоряет перезарядку конкретных Ice навыков
  cooldownConfig: {
    cooldownDelta: -1,
    skillIds: ['Frosty Wind', 'Frost Strike', 'Wind of the North', 'The chilling frost'],
    targets: 'allies',
  },
}
```

---

### ❄️ WhiteWalkerCapitan (LEGENDARY) — Ice Berserker

**Роль:** Агрессивный боец с пассивным уроном

**Пассивка "White Walker Berserker":**

```typescript
{
  name: 'White Walker Berserker',
  passive: true,
  buffs: [
    this.helper.eS.getEffect(this.helper.effects.defBuff),
    this.helper.eS.getEffect(this.helper.effects.attackBuff),
  ],
  // Пассивный урон
  dmgM: 0.04,
  // Ускоряет перезарядку команды
  cooldownConfig: {
    cooldownDelta: -1,
    targetAll: true,
    targets: 'allies',
  },
}
```

---

### 👑 JonKing (LEGENDARY) — King in the North / Team Leader

**Роль:** Лидер команды, ускоряет всех

**Пассивка "King's Justice":**

```typescript
{
  name: "King's Justice",
  passive: true,
  buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff, 1)],
  // Ускоряет перезарядку ВСЕЙ команды каждый ход
  cooldownConfig: {
    cooldownDelta: -1,
    targetAll: true,
    targets: 'allies',
  },
  // Продлевает баффы на союзниках
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Attack Bonus', 'Defense Bonus'],
    targets: 'allies',
  },
}
```

---

### 🏹 RelinaShow (LEGENDARY) — Control Queen

**Роль:** Королева контроля, ломает вражескую стратегию

**Пассивка "Forest Warrior":**

```typescript
{
  name: 'Forest Warrior',
  passive: true,
  // Замедляет перезарядку ВСЕХ вражеских навыков
  cooldownConfig: {
    cooldownDelta: +1,
    targetAll: true,
    targets: 'enemies',
  },
  // Продлевает контроль-эффекты на врагах (дольше в Root/Poison)
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Root', 'Poison', 'Freezing'],
    targets: 'enemies',
  },
  // Пока жива — враги не получают баффы при атаке
  blockAttackerBuffs: true,
}
```

---

### 🏹 FreeTrapper (RARE) — Poison Support

**Роль:** Защитный саппорт, очищает команду

**Пассивка "A Free Man":**

```typescript
{
  name: 'A Free Man',
  passive: true,
  // Очищает Poison/Bleeding/Burning с союзников быстрее
  effectDurationConfig: {
    delta: -1,
    effectTypes: ['Poison', 'Bleeding', 'Burning'],
    targets: 'allies',
  },
}
```

---

### 🗿 Giant (EPIC) — Tank Buster

**Роль:** Разрушитель баффов + пассивный урон

**Пассивка "Legendary Strength":**

```typescript
{
  name: 'Legendary Strength',
  passive: true,
  // Пассивный AOE урон каждый ход
  dmgM: 0.05,
  // Снимает баффы с врагов быстрее (Defense/Attack Bonus живут меньше)
  effectDurationConfig: {
    delta: -1,
    effectTypes: ['Defense Bonus', 'Attack Bonus', 'Recovery'],
    targets: 'enemies',
  },
}
```

---

### 🐺 WhiteWolf (RARE) — Bleed Specialist

**Роль:** Усиливает кровотечения

**Пассивка "Alpha Wolf":**

```typescript
{
  name: 'Alpha Wolf',
  passive: true,
  // Небольшой пассивный урон
  dmgM: 0.03,
  // Продлевает Bleeding на врагах
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Bleeding'],
    targets: 'enemies',
  },
}
```

---

### 🐺 BrownWolf (COMMON) — Speed Support

**Роль:** Простой саппорт, ускоряет команду

**Пассивка "Pack Instinct":**

```typescript
{
  name: 'Pack Instinct',
  passive: true,
  cooldownConfig: {
    cooldownDelta: -1,
    targetAll: true,
    targets: 'allies',
  },
}
```

---

### 🏹 IceRiverHunter (COMMON) — Freeze Support

**Роль:** Продлевает заморозки

**Пассивка "Frozen Arrow":**

```typescript
{
  name: 'Frozen Arrow',
  passive: true,
  // Продлевает Freezing на врагах (дольше заморожены)
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Freezing'],
    targets: 'enemies',
  },
}
```

---

### 🔥 DailyBossVersion1 (LEGENDARY) — Immortal Fire Boss

**Роль:** Raid boss, сложная цель

**Пассивка "Soul of Flame":**

```typescript
{
  name: 'Soul of Flame',
  passive: true,
  // Лечит всю команду
  heal: { healM: 0.15, healAll: true },
  // Пассивный огненный урон
  dmgM: 0.08,
  // Продлевает Burning на врагах
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Burning'],
    targets: 'enemies',
  },
  // Блокирует баффы атакующих
  blockAttackerBuffs: true,
}
```

---

## 📊 Итоговая таблица использования механик

| Герой              | Rarity | heal   | dmgM | effectDuration (цель/знак)      | cooldown           | blockBuffs | activateDebuffs           |
| ------------------ | ------ | ------ | ---- | ------------------------------- | ------------------ | ---------- | ------------------------- |
| LadyOfDragonStone  | LEG    | ✅ all | ✅   | enemies Burning **+1**          | ❌                 | ❌         | ✅ (добавить на Drakarys) |
| RedKeepAlchemist   | EPIC   | ❌     | ❌   | enemies Burning/Bleeding **+1** | ✅ allies          | ❌         | ✅ (уже есть)             |
| TargaryenKnight    | EPIC   | ❌     | ❌   | allies armor **-1** (клинс)     | ❌                 | ✅         | ❌                        |
| Priest             | EPIC   | ✅ one | ❌   | allies DOTs **-1** (клинс)      | ❌                 | ❌         | ❌                        |
| WhiteWolf          | RARE   | ❌     | ✅   | enemies Bleeding **+1**         | ❌                 | ❌         | ❌                        |
| BrownWolf          | COMMON | ❌     | ❌   | ❌                              | ✅ allies          | ❌         | ❌                        |
| IceRiverHunter     | COMMON | ❌     | ❌   | enemies Freezing **+1**         | ❌                 | ❌         | ❌                        |
| RelinaShow         | LEG    | ❌     | ❌   | enemies control **+1**          | ✅ enemies         | ✅         | ❌                        |
| FreeTrapper        | RARE   | ❌     | ❌   | allies DOTs **-1** (клинс)      | ❌                 | ❌         | ❌                        |
| Giant              | EPIC   | ❌     | ✅   | enemies buffs **-1** (срывает)  | ❌                 | ❌         | ❌                        |
| NightKing          | LEG    | ❌     | ✅   | enemies Freezing **+1**         | ❌                 | ✅         | ❌                        |
| WhiteWalkerGeneral | LEG    | ❌     | ❌   | allies buffs **+1**             | ✅ allies specific | ❌         | ❌                        |
| WhiteWalkerCapitan | LEG    | ❌     | ✅   | ❌                              | ✅ allies          | ❌         | ❌                        |
| JonKing            | LEG    | ❌     | ❌   | allies buffs **+1**             | ✅ allies          | ❌         | ❌                        |
| DailyBossVersion1  | LEG    | ✅ all | ✅   | enemies Burning **+1**          | ❌                 | ✅         | ❌                        |

### Охват механик: **6/6 — 100%** ✅

- `heal` (healAll: true / false): LadyDragon, Priest, DailyBoss
- `dmgM`: LadyDragon, WhiteWolf, Giant, NightKing, WhiteWalkerCap, DailyBoss
- `effectDurationConfig` (extend enemies): LadyDragon, RedKeep, IceRiver, WhiteWolf, NightKing, RelinaShow, DailyBoss
- `effectDurationConfig` (cleanse allies): TargaryenKnight, Priest, FreeTrapper
- `effectDurationConfig` (strip enemy buffs): Giant
- `effectDurationConfig` (extend ally buffs): WhiteWalkerGeneral, JonKing
- `cooldownConfig` (accelerate allies): RedKeep, BrownWolf, WhiteWalkerGen, WhiteWalkerCap, JonKing
- `cooldownConfig` (slow enemies): RelinaShow
- `blockAttackerBuffs`: TargaryenKnight, NightKing, RelinaShow, DailyBoss
- `activateDebuffs` (на активных скиллах): RedKeepAlchemist (уже есть), LadyOfDragonStone (добавить)

---

## 🎯 Синергии (правильные)

### 🔥 Fire Combo — максимальный DOT урон

```
RedKeepAlchemist (пассивка: продлевает Burning +1 каждый ход)
  + LadyOfDragonStone (пассивка: продлевает Burning +1 + activateDebuffs на ульте)
    → Burning на враге почти никогда не кончается

TargaryenKnight в защите: пока он жив, враги не получают баффы при атаке
```

### ❄️ Ice Combo — permanent freeze

```
IceRiverHunter (продлевает Freezing +1)
  + NightKing (продлевает Freezing +1 + blockAttackerBuffs)
    → Враги постоянно заморожены и не могут забаффаться

WhiteWalkerGeneral (ускоряет CD ice навыков)
  → NightKing и WhiteWalkerCapitan кастуют ульты чаще
```

### 👑 Speed Combo — спам ультами

```
JonKing (-1 CD всей команды)
  + BrownWolf (-1 CD всей команды)
    → Эффективно команда получает -2 CD каждый ход
```

### 🎯 Control Combo — враги в ловушке

```
RelinaShow (+1 CD всех врагов + продлевает Root/Poison/Freezing + blockBuffs)
  → Враги медленные, в контроле, без баффов

FreeTrapper + Priest (оба очищают союзников от дотов)
  → Команда нечувствительна к DOT урону
```

### 🗿 Debuff Strip Combo — срыв танковых стратегий

```
Giant (снимает Defense/Attack Bonus с врагов -1)
  → Вражеские танковые баффы живут вдвое меньше
```

---

## 🚀 Порядок реализации

### Этап 1 — быстрые wins (30 мин)

1. BrownWolf → `cooldownConfig`
2. IceRiverHunter → `effectDurationConfig`

### Этап 2 — DOT логика (1 час)

3. WhiteWolf → `dmgM` + `effectDurationConfig` enemies Bleeding +1
4. FreeTrapper → `effectDurationConfig` allies cleanse
5. RedKeepAlchemist → `cooldownConfig` + `effectDurationConfig` enemies extend

### Этап 3 — защитники (1 час)

6. TargaryenKnight → `blockAttackerBuffs` + `effectDurationConfig` allies armor cleanse
7. Priest → `heal: false` + `effectDurationConfig` allies DOT cleanse

### Этап 4 — лидеры команд (1 час)

8. JonKing → `cooldownConfig` + `effectDurationConfig` allies extend
9. Giant → `dmgM` + `effectDurationConfig` enemies strip
10. WhiteWalkerGeneral → `effectDurationConfig` + `cooldownConfig` specific

### Этап 5 — топовые герои (1.5 часа)

11. WhiteWalkerCapitan → `dmgM` + `cooldownConfig`
12. NightKing → `dmgM` + `effectDurationConfig` + `blockAttackerBuffs`
13. LadyOfDragonStone → обновить + `effectDurationConfig` + `activateDebuffs` на ульте
14. RelinaShow → `cooldownConfig` enemies + `effectDurationConfig` + `blockAttackerBuffs`
15. DailyBossVersion1 → полный набор
