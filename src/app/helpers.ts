export function createDeepCopy<T>(object: T) {
  return JSON.parse(JSON.stringify(object)) as T;
}

export function trackByIndex(index: number) {
  return index;
}

export function filterByProperty<T>(data: T[], property: keyof T) {
  const uniqueIds = new Set();

  return data.filter(item => {
    if (uniqueIds.has(item[property])) {
      return false;
    } else {
      uniqueIds.add(item[property]);

      return true;
    }
  });
}
