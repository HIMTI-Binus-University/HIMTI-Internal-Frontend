import type { CertificateState } from "../types";
import {
  buildSnapshot,
  parseSnapshot,
  type SessionSnapshot,
} from "./sessionSnapshot";
import { listCustomFonts, registerCustomFont } from "./customFonts";

/**
 * Keeps the work in progress across a refresh: small data in localStorage,
 * the template image and custom font files in IndexedDB (they can be large).
 * Every call is guarded: blocked or full storage just means nothing is saved.
 */
const STORAGE_KEY = "certificate-generator:session";
const DB_NAME = "certificate-generator";
const STORE_NAME = "files";
const TEMPLATE_KEY = "template";
const fontKey = (name: string) => `font:${name}`;

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDb();

  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
};

const putFile = (key: string, file: Blob) =>
  withStore("readwrite", (store) => store.put(file, key));
const getFile = (key: string) =>
  withStore<Blob | undefined>("readonly", (store) => store.get(key));
const clearFiles = () => withStore("readwrite", (store) => store.clear());

export interface RestoredSession {
  snapshot: SessionSnapshot;
  template: CertificateState["template"];
}

// The template file is only rewritten when it actually changed.
let lastSavedTemplate: File | null = null;

export const saveSession = async (state: CertificateState) => {
  try {
    const hasWork = state.template !== null || state.names.length > 0;
    if (!hasWork) {
      await clearSession();
      return;
    }

    const fonts = listCustomFonts();
    const snapshot = buildSnapshot(
      {
        currentStep: state.currentStep,
        names: state.names,
        textSettings: state.textSettings,
        template: state.template,
        fonts: fonts.map((font) => font.name),
      },
      Date.now(),
    );

    if (state.template && state.template.file !== lastSavedTemplate) {
      await putFile(TEMPLATE_KEY, state.template.file);
      lastSavedTemplate = state.template.file;
    }
    await Promise.all(fonts.map((font) => putFile(fontKey(font.name), font.file)));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage blocked or full: the app keeps working, it just will not resume.
  }
};

export const loadSession = async (): Promise<RestoredSession | null> => {
  try {
    const snapshot = parseSnapshot(localStorage.getItem(STORAGE_KEY), Date.now());

    if (!snapshot) {
      // Expired or unreadable: remove what is left.
      await clearSession();
      return null;
    }

    let template: CertificateState["template"] = null;

    if (snapshot.template) {
      const blob = await getFile(TEMPLATE_KEY);
      if (blob) {
        const file = new File([blob], snapshot.template.name, {
          type: snapshot.template.type,
        });
        lastSavedTemplate = file;
        template = {
          file,
          url: URL.createObjectURL(file),
          width: snapshot.template.width,
          height: snapshot.template.height,
        };
      }
    }

    for (const name of snapshot.fonts) {
      const blob = await getFile(fontKey(name));
      if (blob) await registerCustomFont(name, blob).catch(() => undefined);
    }

    // Without the image there is nothing to place the name on.
    return {
      snapshot: template ? snapshot : { ...snapshot, currentStep: 1, template: null },
      template,
    };
  } catch {
    return null;
  }
};

export const clearSession = async () => {
  lastSavedTemplate = null;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    await clearFiles();
  } catch {
    // ignore
  }
};
