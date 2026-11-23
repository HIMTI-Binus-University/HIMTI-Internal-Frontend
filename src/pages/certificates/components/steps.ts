export type WizardStep = 1 | 2 | 3;

export const WIZARD_STEPS: Array<{ step: WizardStep; label: string }> = [
  { step: 1, label: "Data & Template" },
  { step: 2, label: "Set Position" },
  { step: 3, label: "Preview & Download" },
];
