    export const DB_NAME = 'wedding-editor-db';
export const STORE_NAME = 'templates';

const openDB = (): Promise<IDBDatabase> => {
    if (typeof window === 'undefined') return Promise.reject("No window");
    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveToIDB = async (key: string, value: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(value, key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

const getFromIDB = async (key: string): Promise<string | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

const removeFromIDB = async (key: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const storage = {
    save: async (key: string, value: string) => {
        try {
            // Try localStorage first
            localStorage.setItem(key, value);
            // If successful, clean up IDB to avoid duplicates/confusion
            // (Optional: strictly speaking we could leave it, but it's cleaner to remove)
            try {
                await removeFromIDB(key);
            } catch (e) {
                console.warn("Failed to cleanup IDB after LS save", e);
            }
        } catch (error: unknown) {
            // Check for quota exceeded error
            // Cast to any to access properties safely for detection
            const e = error as any;
            if (
                e?.name === 'QuotaExceededError' || 
                e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                (typeof DOMException !== 'undefined' && e instanceof DOMException && e.code === 22)
            ) {
                console.log(`LocalStorage quota exceeded for ${key}. Saving to IndexedDB.`);
                await saveToIDB(key, value);
                // Remove from localStorage to ensure we don't read stale data
                // since get() prefers localStorage
                localStorage.removeItem(key);
            } else {
                throw error;
            }
        }
    },

    get: async (key: string): Promise<string | null> => {
        // Try localStorage first
        const localValue = localStorage.getItem(key);
        if (localValue) return localValue;
        
        // Fallback to IDB
        try {
            return await getFromIDB(key);
        } catch (e) {
            console.error(`Failed to read from IDB for ${key}`, e);
            return null;
        }
    },

    remove: async (key: string) => {
        localStorage.removeItem(key);
        try {
            await removeFromIDB(key);
        } catch (e) {
            console.error(`Failed to remove from IDB for ${key}`, e);
        }
    }
};
