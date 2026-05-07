const STORE_PREFIX = 'surveysync';
const LOCAL_EVENT = 'surveysync-local-store';

type CollectionName = 'requests' | 'payments' | 'availability' | 'documents';

function getStorageKey(collectionName: CollectionName) {
  return `${STORE_PREFIX}:${collectionName}`;
}

function emitLocalStoreChange(collectionName: CollectionName) {
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { collectionName } }));
}

export function getLocalCollection<T = any>(collectionName: CollectionName): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(collectionName));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(`Failed to read local ${collectionName}:`, error);
    return [];
  }
}

function writeLocalCollection<T = any>(collectionName: CollectionName, items: T[]) {
  window.localStorage.setItem(getStorageKey(collectionName), JSON.stringify(items));
  emitLocalStoreChange(collectionName);
}

export function addLocalDoc<T extends Record<string, any>>(collectionName: CollectionName, data: T) {
  const id = `local-${collectionName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const item = {
    id,
    ...data,
    _localOnly: true,
  };
  const items = getLocalCollection(collectionName);
  writeLocalCollection(collectionName, [item, ...items]);
  return item;
}

export function updateLocalDoc<T extends Record<string, any>>(collectionName: CollectionName, id: string, data: Partial<T>) {
  const items = getLocalCollection(collectionName);
  const updated = items.map((item: any) => item.id === id ? { ...item, ...data } : item);
  writeLocalCollection(collectionName, updated);
}

export function deleteLocalDoc(collectionName: CollectionName, id: string) {
  const items = getLocalCollection(collectionName);
  writeLocalCollection(collectionName, items.filter((item: any) => item.id !== id));
}

export function mergeLocalDocuments<T extends { id?: string; _localOnly?: boolean }>(remoteItems: T[], localItems: T[]) {
  const byId = new Map<string, T>();

  remoteItems
    .filter(item => !item._localOnly)
    .forEach(item => {
      if (item.id) byId.set(item.id, item);
    });

  localItems.forEach(item => {
    if (item.id) byId.set(item.id, item);
  });

  return Array.from(byId.values());
}

export function subscribeLocalCollection<T = any>(collectionName: CollectionName, callback: (items: T[]) => void) {
  const notify = () => callback(getLocalCollection<T>(collectionName));

  const handleStorage = (event: StorageEvent) => {
    if (event.key === getStorageKey(collectionName)) notify();
  };

  const handleLocalEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail?.collectionName === collectionName) notify();
  };

  notify();
  window.addEventListener('storage', handleStorage);
  window.addEventListener(LOCAL_EVENT, handleLocalEvent);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LOCAL_EVENT, handleLocalEvent);
  };
}
