# Passive Ability System — Guide & Examples

Система пассивных способностей запускается автоматически в двух точках боевого цикла:

1. **Начало хода** — перед тем как команда начинает атаковать, `processRoundStart` вызывается для каждого живого героя активной команды.
2. **Перед атакой** — перед выполнением `executeAction`, `processBeforeAttack` проверяет, должны ли баффы атакующего быть заблокированы.

Чтобы навык стал пассивным, достаточно добавить `passive: true` в его конфигурацию. Ниже описаны все доступные механики с примерами.

---

## Типы `EffectsValues` (для `effectDurationConfig`)

```ts
'Burning' |
  'Freezing' |
  'Recovery' |
  'Bleeding' |
  'Poison' |
  'Attack Bonus' |
  'Rusty Sword' |
  'Defense Bonus' |
  'Armor corrosion' |
  'Armor Break' |
  'Root';
```

---

## 1. Лечение всей команды (`healAll: true`)

Каждый ход герой восстанавливает здоровье всем живым союзникам.

```ts
const melisandreSkill: Skill = {
  name: "Blessing of R'hllor",
  description: 'Restores 8% of max health to all allies at the start of each round.',
  imgSrc: 'assets/skills/blessing.png',
  passive: true, // обязательно для пассивного навыка
  heal: {
    healM: 0.08, // 8% от maxHealth лекаря
    healAll: true, // лечить всех союзников
  },
};
```

**Что происходит:** в начале хода `health += healer.maxHealth * 0.08` для каждого живого союзника (не превышая `maxHealth`). В боевой лог записывается сообщение о восстановлении.

---

## 2. Лечение самого раненого союзника (`healAll: false`)

Каждый ход герой восстанавливает здоровье только союзнику с наименьшим текущим `health`.

```ts
const maesterSkill: Skill = {
  name: 'Focused Mending',
  description: 'Heals the most wounded ally for 15% of max health each round.',
  imgSrc: 'assets/skills/mending.png',
  passive: true,
  heal: {
    healM: 0.15, // 15% от maxHealth лекаря
    healAll: false, // только самый раненый
  },
};
```

**Что происходит:** выбирается живой союзник с минимальным `health` (при равенстве — первый по индексу), ему добавляется `healer.maxHealth * 0.15`.

---

## 3. Пассивный урон по всем врагам (`dmgM`)

Каждый ход герой наносит урон всем живым врагам.

```ts
const dragonSkill: Skill = {
  name: 'Dragon Fire Aura',
  description: "Burns all enemies for 5% of the dragon's max health each round.",
  imgSrc: 'assets/skills/dragonfire.png',
  passive: true,
  dmgM: 0.05, // 5% от maxHealth атакующего
};
```

**Что происходит:** `health -= attacker.maxHealth * 0.05` для каждого живого врага (пол — 0). В лог записывается урон.

> **Примечание:** `dmgM` может быть совмещён с другими пассивными конфигурациями в одном навыке — просто добавьте нужные поля.

---

## 4. Изменение продолжительности эффектов (`effectDurationConfig`)

### 4a. Ускорение снятия дебаффов с союзников

```ts
const davosSkill: Skill = {
  name: "Smuggler's Cleanse",
  description: 'Reduces the duration of all Burning and Poison on allies by 1 each round.',
  imgSrc: 'assets/skills/cleanse.png',
  passive: true,
  effectDurationConfig: {
    delta: -1, // уменьшить duration на 1
    effectTypes: ['Burning', 'Poison'], // типы эффектов-целей
    targets: 'allies', // 'allies' | 'enemies' | 'both'
  },
};
```

**Что происходит:** у всех союзников эффекты типа `Burning` и `Poison` теряют 1 `duration`. Если `duration` становится ≤ 0 — эффект немедленно снимается.

### 4b. Продление баффов на союзниках

```ts
const sorcererSkill: Skill = {
  name: 'Arcane Sustain',
  description: 'Extends all Attack Bonus effects on allies by 1 each round.',
  imgSrc: 'assets/skills/arcane.png',
  passive: true,
  effectDurationConfig: {
    delta: +1,
    effectTypes: ['Attack Bonus', 'Defense Bonus'],
    targets: 'allies',
  },
};
```

### 4c. Ускоренное гниение врагов

```ts
const poisonMasterSkill: Skill = {
  name: 'Virulent Toxins',
  description:
    'Accelerates all Poison on enemies — reduces duration by 1 but damage still applies this turn.',
  imgSrc: 'assets/skills/toxins.png',
  passive: true,
  effectDurationConfig: {
    delta: -1,
    effectTypes: ['Poison', 'Bleeding'],
    targets: 'enemies',
  },
};
```

> **Важно:** эффекты с флагом `passive: true` (`effect.passive`) не затрагиваются — их `duration` никогда не изменяется этой механикой.

---

## 5. Изменение перезарядки навыков (`cooldownConfig`)

### 5a. Ускорение всех навыков союзников

```ts
const timeWizardSkill: Skill = {
  name: 'Haste',
  description: 'Reduces remaining cooldown of all ally skills by 1 each round.',
  imgSrc: 'assets/skills/haste.png',
  passive: true,
  cooldownConfig: {
    cooldownDelta: -1, // уменьшить remainingCooldown на 1
    targetAll: true, // все навыки
    targets: 'allies',
  },
};
```

**Что происходит:** у каждого союзника `remainingCooldown -= 1` для каждого не-пассивного навыка. Результат зажат в `[0, skill.cooldown]`.

### 5b. Замедление конкретных навыков врага

```ts
const disruptorSkill: Skill = {
  name: 'Silence',
  description: 'Increases cooldown of enemy skills "Dragon Breath" and "Ice Storm" by 2.',
  imgSrc: 'assets/skills/silence.png',
  passive: true,
  cooldownConfig: {
    cooldownDelta: +2,
    skillIds: ['Dragon Breath', 'Ice Storm'], // по полю name навыка
    targets: 'enemies',
  },
};
```

### 5c. Воздействие на обе стороны

```ts
const chaosSkill: Skill = {
  name: 'Chaos Surge',
  description: 'Randomly shifts all cooldowns by +1 for everyone.',
  imgSrc: 'assets/skills/chaos.png',
  passive: true,
  cooldownConfig: {
    cooldownDelta: +1,
    targetAll: true,
    targets: 'both', // союзники и враги
  },
};
```

> **Важно:** пассивные навыки (`skill.passive === true`) пропускаются — их `remainingCooldown` никогда не изменяется.

---

## 6. Блокировка баффов атакующего (`blockAttackerBuffs`)

Если хотя бы один живой защитник имеет этот флаг, то при атаке блоки `addBuffsBeforeAttack` и `!addBuffsBeforeAttack` в `executeAction` полностью пропускаются — атакующий не получает баффы во время атаки.

```ts
const shiledMaidenSkill: Skill = {
  name: 'Null Field',
  description: 'While this hero is alive, enemies cannot apply buffs to themselves when attacking.',
  imgSrc: 'assets/skills/nullfield.png',
  passive: true,
  blockAttackerBuffs: true,
};
```

**Что происходит:** `PassiveAbilityService.processBeforeAttack(defenderTeam)` возвращает `blockBuffApplication: true`, и `BasicGameFieldComposition.executeAction` пропускает оба блока наложения баффов.

---

## 7. Комбинирование механик в одном навыке

Все поля могут быть объединены в одном `Skill` объекте:

```ts
const wardenSkill: Skill = {
  name: 'Iron Bastion',
  description: `At the start of each round: heals the weakest ally, deals aura damage to enemies,
                reduces Burning on allies, and slows enemy skill cooldowns.
                Also prevents enemies from buffing themselves when attacking.`,
  imgSrc: 'assets/skills/bastion.png',
  passive: true,

  // Лечение самого раненого союзника (10% от maxHealth варды)
  heal: {
    healM: 0.1,
    healAll: false,
  },

  // Пассивный урон всем врагам (3% от maxHealth варды)
  dmgM: 0.03,

  // Снимает Burning с союзников быстрее
  effectDurationConfig: {
    delta: -1,
    effectTypes: ['Burning'],
    targets: 'allies',
  },

  // Замедляет все навыки врагов
  cooldownConfig: {
    cooldownDelta: +1,
    targetAll: true,
    targets: 'enemies',
  },

  // Блокирует баффы атакующего пока варда жива
  blockAttackerBuffs: true,
};
```

---

## 8. Порядок применения в `processRoundStart`

Для каждого героя с пассивными навыками механики применяются строго последовательно:

```
1. effectDurationConfig  — изменение duration эффектов
2. heal                  — лечение союзников
3. dmgM                  — урон врагам
4. cooldownConfig        — изменение remainingCooldown навыков
```

Каждый этап работает с актуальным состоянием массивов, изменённым предыдущим этапом.

---

## 9. Правила и ограничения

| Правило                             | Детали                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| Герой с `health === 0` пропускается | `processRoundStart` возвращает входные массивы без изменений       |
| Нет пассивных навыков               | Возвращаются исходные массивы без копирования                      |
| Эффекты с `effect.passive: true`    | Не затрагиваются `effectDurationConfig`                            |
| Навыки с `skill.passive: true`      | Не затрагиваются `cooldownConfig`                                  |
| Цели лечения/урона                  | Только живые юниты (`health > 0`)                                  |
| `blockAttackerBuffs`                | Действует только пока носитель жив (`health > 0`)                  |
| Иммутабельность                     | Входные массивы не мутируются — сервис работает с `createDeepCopy` |
