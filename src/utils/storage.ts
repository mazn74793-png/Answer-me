import { BookPage } from '../types';

const STORAGE_KEY_PAGES = 'korasaty_solved_pages_v1';
const STORAGE_KEY_SETTINGS = 'korasaty_settings_v1';
const STORAGE_KEY_ACTIVE_INDEX = 'korasaty_active_index_v1';

export interface SavedSettings {
  solverMode?: string;
  subject?: string;
  solutionDepth?: string;
  pdfMode?: 'answers-only' | 'full';
  pdfFontSize?: 'compact' | 'standard';
  showPdfPageThumbnail?: boolean;
}

/**
 * Loads cached pages from browser storage.
 * Prioritizes IndexedDB if available (handles larger base64 images seamlessly),
 * with localStorage fallback.
 */
export async function loadSavedPages(): Promise<BookPage[]> {
  // First attempt from IndexedDB (safe for high-resolution images)
  try {
    const idbPages = await loadPagesFromIndexedDB();
    if (idbPages && idbPages.length > 0) {
      return idbPages;
    }
  } catch (err) {
    console.warn('[Storage] IndexedDB read failed or empty, trying localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const serialized = localStorage.getItem(STORAGE_KEY_PAGES);
    if (!serialized) return [];
    const parsed = JSON.parse(serialized);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('[Storage] Error reading pages from localStorage:', err);
  }

  return [];
}

/**
 * Saves pages to both IndexedDB and localStorage (with safe quota handling).
 */
export async function savePagesToStorage(pages: BookPage[]): Promise<boolean> {
  let idbSuccess = false;

  // 1. Always attempt IndexedDB first (virtually unlimited quota for large books & images)
  try {
    await savePagesToIndexedDB(pages);
    idbSuccess = true;
  } catch (err) {
    console.warn('[Storage] IndexedDB save error:', err);
  }

  // 2. Also try localStorage for instant sync (and fallback)
  try {
    if (pages.length === 0) {
      localStorage.removeItem(STORAGE_KEY_PAGES);
    } else {
      // Test size; if too large, store without large base64 or strip down if needed
      const serialized = JSON.stringify(pages);
      localStorage.setItem(STORAGE_KEY_PAGES, serialized);
    }
  } catch (quotaErr) {
    console.warn('[Storage] localStorage quota exceeded, trying compressed/solutions-only fallback for localStorage:', quotaErr);
    try {
      // If full base64 images exceeded 5MB localStorage quota, store lightweight metadata + solutions in localStorage
      // while IndexedDB keeps the full high-res imageDataUrl!
      const lightweightPages = pages.map((p) => ({
        ...p,
        imageDataUrl: p.imageDataUrl?.length > 100000 ? p.imageDataUrl.slice(0, 100) : p.imageDataUrl,
      }));
      localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(lightweightPages));
    } catch (fallbackErr) {
      console.warn('[Storage] Even lightweight localStorage failed, relying on IndexedDB:', fallbackErr);
    }
  }

  return idbSuccess;
}

/**
 * Clears all saved pages from both IndexedDB and localStorage.
 */
export async function clearSavedStorage(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY_PAGES);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_INDEX);
  } catch (e) {
    console.error('[Storage] Error removing from localStorage:', e);
  }

  try {
    await clearPagesFromIndexedDB();
  } catch (e) {
    console.error('[Storage] Error clearing IndexedDB:', e);
  }
}

/**
 * Save user preferences / settings to localStorage.
 */
export function saveSettings(settings: SavedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('[Storage] Error saving settings:', e);
  }
}

/**
 * Load user preferences / settings from localStorage.
 */
export function loadSettings(): SavedSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('[Storage] Error loading settings:', e);
    return null;
  }
}

/**
 * Save current active page index.
 */
export function saveActivePageIndex(index: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_INDEX, String(index));
  } catch {
    // Ignore
  }
}

/**
 * Load saved active page index.
 */
export function loadActivePageIndex(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_INDEX);
    if (!raw) return 0;
    const num = parseInt(raw, 10);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

// ==========================================
// Robust IndexedDB Helper for Large Books & Photos
// ==========================================
const DB_NAME = 'KorasatySolutionsDB';
const DB_VERSION = 1;
const STORE_NAME = 'book_pages';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePagesToIndexedDB(pages: BookPage[]): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear existing to match current list exactly
    const clearReq = store.clear();
    clearReq.onsuccess = () => {
      if (pages.length === 0) {
        tx.oncomplete = () => resolve();
        return;
      }
      for (const page of pages) {
        store.put(page);
      }
    };
    clearReq.onerror = () => reject(clearReq.error);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadPagesFromIndexedDB(): Promise<BookPage[]> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const result = request.result;
      if (Array.isArray(result) && result.length > 0) {
        // Sort by pageNumber to preserve original order
        result.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
        resolve(result);
      } else {
        resolve([]);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

async function clearPagesFromIndexedDB(): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
