import type { components, operations } from "@/generated/openapi";

export type RegistrationSettingsPayload =
  operations["updateEventRegistrationSettings"]["requestBody"]["content"]["application/json"];
export type PackagePayload =
  operations["createEventPackage"]["requestBody"]["content"]["application/json"];
export type PackageUpdatePayload =
  operations["updateEventPackage"]["requestBody"]["content"]["application/json"];
export type RegistrationFormPayload =
  operations["putEventRegistrationForm"]["requestBody"]["content"]["application/json"];
export type QuestionType =
  RegistrationFormPayload["sections"][number]["questions"][number]["type"];
export type EventPackage = components["schemas"]["EventPackage"];
export type RegistrationForm = components["schemas"]["EventRegistrationForm"];
export type RegistrationSettings =
  components["schemas"]["EventRegistrationSettings"];

export type PackageDraft = {
  name: string;
  description: string;
  seatCount: string;
  priceIdr: string;
  salesStartAt: string;
  salesEndAt: string;
};

export interface FormOptionDraft {
  label: string;
  value: string;
}
export interface FormQuestionDraft {
  fieldKey: string;
  label: string;
  type: QuestionType;
  isRequired: boolean;
  options: FormOptionDraft[];
  validation: Record<string, number | boolean | string | string[]>;
}
export interface FormSectionDraft {
  title: string;
  description: string;
  questions: FormQuestionDraft[];
}
export interface RegistrationFormDraft {
  name: string;
  description: string;
  sections: FormSectionDraft[];
}

export const newQuestion = (index: number): FormQuestionDraft => ({
  fieldKey: `question_${index}`,
  label: "Untitled question",
  type: "TEXT",
  isRequired: true,
  options: [],
  validation: {},
});

export const buildRegistrationFormPayload = (
  draft: RegistrationFormDraft,
): RegistrationFormPayload =>
  ({
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    sections: draft.sections.map((section) => ({
      title: section.title.trim(),
      description: section.description.trim() || null,
      questions: section.questions.map((question) => ({
        ...question,
        fieldKey: question.fieldKey.trim(),
        label: question.label.trim(),
        options: question.options.map((option) => ({
          label: option.label.trim(),
          value: option.value.trim(),
        })),
      })),
    })),
  }) as RegistrationFormPayload;

export const emptyPackageDraft = (): PackageDraft => ({
  name: "",
  description: "",
  seatCount: "1",
  priceIdr: "0",
  salesStartAt: "",
  salesEndAt: "",
});

const isoOrNull = (value: string) =>
  value ? new Date(value).toISOString() : null;

export const buildPackagePayload = (draft: PackageDraft): PackagePayload => ({
  name: draft.name.trim(),
  description: draft.description.trim() || null,
  seatCount: Number(draft.seatCount),
  priceMinor: String(Number(draft.priceIdr)),
  currency: "IDR",
  salesStartAt: isoOrNull(draft.salesStartAt),
  salesEndAt: isoOrNull(draft.salesEndAt),
});

export const validatePackageDraft = (draft: PackageDraft) => {
  if (!draft.name.trim()) return "Package name is required.";
  if (!Number.isInteger(Number(draft.seatCount)) || Number(draft.seatCount) < 1)
    return "Seat count must be a positive whole number.";
  if (!Number.isInteger(Number(draft.priceIdr)) || Number(draft.priceIdr) < 0)
    return "Price must be a non-negative IDR whole amount.";
  if (
    draft.salesStartAt &&
    draft.salesEndAt &&
    new Date(draft.salesEndAt) <= new Date(draft.salesStartAt)
  )
    return "Sales end must be after sales start.";
  return null;
};

export const validateRegistrationFormDraft = (
  form: RegistrationFormPayload,
) => {
  if (!form.name.trim()) return "Form name is required.";
  if (!form.sections.length) return "Add at least one section.";
  const questions = form.sections.flatMap((section) => section.questions);
  if (!questions.length) return "Add at least one question.";
  const keys = questions.map((question) => question.fieldKey.trim());
  if (keys.some((key) => !key)) return "Every question needs a field key.";
  if (new Set(keys).size !== keys.length) return "Field keys must be unique.";
  if (questions.some((question) => !question.label.trim()))
    return "Every question needs a label.";
  if (
    questions.some(
      (question) =>
        ["SELECT", "RADIO", "CHECKBOX"].includes(question.type) &&
        !question.options?.length,
    )
  )
    return "Choice questions need at least one option.";
  return null;
};
