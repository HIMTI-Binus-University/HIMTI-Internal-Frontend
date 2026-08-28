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

const initialState: CertificateState = {
  currentStep: 1,
  template: null,
  names: [],
  textSettings: defaultTextSettings,
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
