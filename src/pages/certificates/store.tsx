import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CertificateState,
  CertificateAction,
  TextSettings,
  CertificateTemplate,
  NameEntry,
} from "./types";
import { DEFAULT_TEXT_SETTINGS } from "./constants";
import { findLongestName } from "./utils";
import { clearSession, loadSession, saveSession } from "./utils/persistence";
import { clearCustomFonts } from "./utils/customFonts";

// Initial state - No mock data
const initialState: CertificateState = {
  currentStep: 1,
  template: null,
  names: [],
  textSettings: DEFAULT_TEXT_SETTINGS,
};

const certificateReducer = (
  state: CertificateState,
  action: CertificateAction,
): CertificateState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_TEMPLATE": {
      const template = action.payload;
      if (template) {
        // Replacing a template with one of the same size keeps the font size
        // the user already chose; a different size gets a fresh suggestion.
        const sameSize =
          state.template !== null &&
          state.template.width === template.width &&
          state.template.height === template.height;

        if (sameSize) return { ...state, template };

        const calculatedFontSize = Math.round(template.height * 0.06);
        const fontSize = Math.max(24, Math.min(200, calculatedFontSize));

        return {
          ...state,
          template,
          textSettings: {
            ...state.textSettings,
            fontSize,
          },
        };
      }
      return { ...state, template: null };
    }
    case "SET_NAMES":
      return { ...state, names: action.payload };
    case "UPDATE_TEXT_SETTINGS":
      return {
        ...state,
        textSettings: { ...state.textSettings, ...action.payload },
      };
    case "RESET_TEXT_SETTINGS":
      return { ...state, textSettings: DEFAULT_TEXT_SETTINGS };
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "RESET_ALL":
      return initialState;
    default:
      return state;
  }
};

type Store = {
  state: CertificateState;
  setStep: (step: 1 | 2 | 3) => void;
  setTemplate: (template: CertificateTemplate | null) => void;
  setNames: (names: NameEntry[]) => void;
  updateTextSettings: (settings: Partial<TextSettings>) => void;
  resetTextSettings: () => void;
  resetAll: () => void;
  getLongestName: () => NameEntry | null;
  /** True until saved work (if any) has been looked up on page load. */
  isRestoring: boolean;
  /** When the restored session was saved, or null if nothing was restored. */
  restoredAt: number | null;
  dismissRestored: () => void;
  /** Clears all work and the saved copy. */
  startOver: () => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

export const CertificateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(certificateReducer, initialState);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);

  // Look for saved work once, when the page opens.
  useEffect(() => {
    let cancelled = false;

    void loadSession().then((restored) => {
      if (cancelled) return;

      if (restored) {
        dispatch({
          type: "HYDRATE",
          payload: {
            currentStep: restored.snapshot.currentStep,
            template: restored.template,
            names: restored.snapshot.names,
            textSettings: restored.snapshot.textSettings,
          },
        });
        setRestoredAt(restored.snapshot.savedAt);
      }

      setIsRestoring(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Save after every change (debounced), but never before the lookup above
  // has finished, or an empty page would overwrite the saved work.
  useEffect(() => {
    if (isRestoring) return;

    const timer = setTimeout(() => void saveSession(state), 400);
    return () => clearTimeout(timer);
  }, [state, isRestoring]);

  const startOver = useCallback(async () => {
    if (state.template) URL.revokeObjectURL(state.template.url);
    clearCustomFonts();
    dispatch({ type: "RESET_ALL" });
    setRestoredAt(null);
    await clearSession();
  }, [state.template]);

  const value = useMemo<Store>(
    () => ({
      state,
      setStep: (step) => dispatch({ type: "SET_STEP", payload: step }),
      setTemplate: (template) =>
        dispatch({ type: "SET_TEMPLATE", payload: template }),
      setNames: (names) => dispatch({ type: "SET_NAMES", payload: names }),
      updateTextSettings: (settings) =>
        dispatch({ type: "UPDATE_TEXT_SETTINGS", payload: settings }),
      resetTextSettings: () => dispatch({ type: "RESET_TEXT_SETTINGS" }),
      resetAll: () => dispatch({ type: "RESET_ALL" }),
      getLongestName: () => findLongestName(state.names),
      isRestoring,
      restoredAt,
      dismissRestored: () => setRestoredAt(null),
      startOver,
    }),
    [state, isRestoring, restoredAt, startOver],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCertificateStore = () => {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error(
      "useCertificateStore must be used inside CertificateProvider",
    );
  return store;
};
