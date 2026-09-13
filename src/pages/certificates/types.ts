export interface CertificateTemplate {
  file: File;
  url: string;
  width: number;
  height: number;
}

export interface NameEntry {
  id: string;
  name: string;
  order: number;
}

export interface CustomFont {
  name: string;
  file: File;
  url: string;
}

export interface TextSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  customFont?: CustomFont;
  fontSize: number;
  minFontSize: number;
  fontWeight: string;
  textAlign: string;
  color: string;
  letterSpacing: number;
  lineHeight: number;
  maxLines: number;
  uppercase: boolean;
  autoFit: boolean;
  abbreviate: {
    firstName: boolean;
    middleName: boolean;
    lastName: boolean;
  };
}

export interface CertificateState {
  currentStep: 1 | 2 | 3;
  template: CertificateTemplate | null;
  names: NameEntry[];
  textSettings: TextSettings;
}

export type CertificateAction =
  | { type: "SET_STEP"; payload: 1 | 2 | 3 }
  | { type: "SET_TEMPLATE"; payload: CertificateTemplate | null }
  | { type: "SET_NAMES"; payload: NameEntry[] }
  | { type: "UPDATE_TEXT_SETTINGS"; payload: Partial<TextSettings> }
  | { type: "RESET_TEXT_SETTINGS" }
  | { type: "RESET_ALL" };
