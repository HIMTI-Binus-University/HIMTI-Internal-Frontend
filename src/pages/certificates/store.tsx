import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from "react";
import type {
  CertificateState,
  CertificateAction,
  TextSettings,
  CertificateTemplate,
  NameEntry,
} from "./types";
import { findLongestName } from "./utils";

const defaultTextSettings: TextSettings = {
  x: 50,
  y: 50,
  width: 50,
  height: 20,
  fontFamily: "Plus Jakarta Sans",
  fontSize: 48,
  minFontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  color: "#000000",
  letterSpacing: 0,
  lineHeight: 1.2,
  maxLines: 1,
  uppercase: false,
  autoFit: true,
  abbreviate: {
    firstName: false,
    middleName: false,
    lastName: false,
  },
};

// 🔧 MOCK DATA UNTUK DEVELOPMENT - UBAH currentStep KE 1 SETELAH SELESAI
const initialState: CertificateState = {
  currentStep: 3, // ← UBAH JADI 1 SEBELUM MERGE
  template: {
    file: new File([], "mock.png"),
    url: "https://via.placeholder.com/1200x800/cccccc/000000?text=Certificate+Template",
    width: 1200,
    height: 800,
  },
  names: [
    { id: "1", name: "John Doe", order: 1 },
    { id: "2", name: "Jane Smith", order: 2 },
    { id: "3", name: "Alexander Hamilton Jr.", order: 3 },
    { id: "4", name: "Short Name", order: 4 },
    { id: "5", name: "Muhammad Al-Farabi bin Abdullah", order: 5 },
  ],
  textSettings: {
    ...defaultTextSettings,
    y: 60,
    color: "#1a56db",
  },
};

const certificateReducer = (
  state: CertificateState,
  action: CertificateAction,
): CertificateState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_TEMPLATE":
      return { ...state, template: action.payload };
    case "SET_NAMES":
      return { ...state, names: action.payload };
    case "UPDATE_TEXT_SETTINGS":
      return {
        ...state,
        textSettings: { ...state.textSettings, ...action.payload },
      };
    case "RESET_TEXT_SETTINGS":
      return { ...state, textSettings: defaultTextSettings };
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
};

const StoreContext = createContext<Store | null>(null);

export const CertificateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(certificateReducer, initialState);

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
    }),
    [state],
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
