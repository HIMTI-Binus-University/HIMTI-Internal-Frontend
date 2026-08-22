import type { components } from "@/generated/openapi";

export type BuilderForm = components["schemas"]["RegistrationFormBuilderV1"];
export type DraftPayload = components["schemas"]["RegistrationFormDraftV1"];
export type PreviewPayload = components["schemas"]["RegistrationFormPreviewV1"];
type ApiSection = DraftPayload["sections"][number];
type ApiQuestion = ApiSection["questions"][number];
export type DraftSection = Omit<ApiSection, "clientKey" | "questions"> & {
  clientKey: string;
  questions: DraftQuestion[];
};
export type DraftQuestion = ApiQuestion & { clientKey: string };
export type FieldType = DraftQuestion["fieldType"];
export type EditorDraft = Omit<DraftPayload, "sections"> & {
  sections: DraftSection[];
};
export type DraftValidationIssue = {
  code: string;
  path: string;
  message: string;
};
export type CreatedFormIdentity = { id: string; revision: number };
export const formStages: EditorDraft["stage"][] = [
  "REGISTRATION",
  "POST_REGISTRATION",
];

let sequence = 0;
export const clientKey = (prefix: string) =>
  `${prefix}-${Date.now()}-${sequence++}`;

export const newEditorDraft = (): EditorDraft => ({
  name: "Untitled form",
  description: null,
  revision: 1,
  stage: "REGISTRATION",
  audience: "BUYER",
  isRequired: true,
  opensAt: null,
  closesAt: null,
  blocksCheckIn: false,
  orderIndex: 0,
  sections: [],
});

export const settingsForStage = (
  draft: EditorDraft,
  stage: EditorDraft["stage"],
): EditorDraft =>
  stage === "REGISTRATION"
    ? {
        ...draft,
        stage,
        audience: "BUYER",
        isRequired: true,
        opensAt: null,
        closesAt: null,
        blocksCheckIn: false,
        orderIndex: 0,
      }
    : {
        ...draft,
        stage,
        audience: "BUYER",
        isRequired: true,
        opensAt: null,
        closesAt: null,
        blocksCheckIn: false,
        orderIndex: 0,
      };

export const builderToDraft = (form: BuilderForm): EditorDraft => ({
  name: form.name,
  description: form.description,
  revision: form.revision,
  stage: form.stage,
  audience: form.audience,
  blocksCheckIn: form.blocksCheckIn,
  closesAt: form.closesAt,
  isRequired: form.isRequired,
  opensAt: form.opensAt,
  orderIndex: form.orderIndex,
  sections: [...form.sections]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section) => ({
      id: section.id,
      clientKey: section.id,
      title: section.title,
      description: section.description,
      questions: [...section.questions]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((question) => ({
          id: question.id,
          clientKey: question.id,
          fieldKey: question.fieldKey,
          fieldType: question.fieldType,
          helpText: question.helpText,
          isRequired: question.isRequired,
          label: question.label,
          options: [...question.options]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(({ id, label, value }) => ({ id, label, value })),
          validation: { ...question.validation },
        })),
    })),
});

export const toPayload = (draft: EditorDraft): DraftPayload => ({
  name: draft.name.trim(),
  description: draft.description?.trim() || null,
  revision: draft.revision,
  stage: draft.stage,
  audience: draft.stage === "REGISTRATION" ? "BUYER" : draft.audience,
  isRequired: draft.stage === "REGISTRATION" ? true : draft.isRequired,
  opensAt: draft.stage === "REGISTRATION" ? null : draft.opensAt,
  closesAt: draft.stage === "REGISTRATION" ? null : draft.closesAt,
  blocksCheckIn:
    draft.stage === "POST_REGISTRATION" &&
    draft.isRequired &&
    draft.blocksCheckIn,
  orderIndex: 0,
  sections: draft.sections.map((section) => ({
    ...(section.id ? { id: section.id } : { clientKey: section.clientKey }),
    title: section.title.trim(),
    description: section.description?.trim() || null,
    questions: section.questions.map(
      ({ clientKey: _clientKey, ...question }) => ({
        ...question,
        label: question.label.trim(),
        helpText: question.helpText?.trim() || null,
        validation: Object.fromEntries(
          Object.entries(question.validation).filter(
            ([, value]) =>
              value !== undefined &&
              (typeof value !== "number" || Number.isFinite(value)),
          ),
        ),
        options: question.options.map((option) => ({
          ...(option.id ? { id: option.id } : {}),
          label: option.label.trim(),
          value: option.value.trim(),
        })),
      }),
    ),
  })),
});

export const newQuestion = (): DraftQuestion => ({
  clientKey: clientKey("question"),
  fieldType: "TEXT",
  isRequired: true,
  label: "Untitled question",
  options: [],
  validation: {},
});

export const moveItem = <T>(items: T[], index: number, direction: number) => {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export const usesOptions = (type: FieldType) =>
  type === "SELECT" || type === "RADIO" || type === "CHECKBOX";

export const validateDraftLocally = (
  draft: EditorDraft,
): DraftValidationIssue[] => {
  const issues: DraftValidationIssue[] = [];
  const add = (code: string, path: string, message: string) =>
    issues.push({ code, path, message });
  const boundedText = (
    value: string | null | undefined,
    path: string,
    label: string,
    max: number,
    required = false,
  ) => {
    const length = value?.trim().length ?? 0;
    if (required && !length) add("REQUIRED", path, `${label} is required`);
    else if (length > max)
      add("TOO_LONG", path, `${label} must not exceed ${max} characters`);
  };
  const fieldKeys = new Set<string>();

  boundedText(draft.name, "name", "Form name", 255, true);
  boundedText(draft.description, "description", "Description", 5000);
  if (!Number.isInteger(draft.revision) || draft.revision < 1)
    add("INVALID_REVISION", "revision", "Revision must be a positive integer");
  if (draft.blocksCheckIn && draft.stage !== "POST_REGISTRATION")
      add(
        "CHECK_IN_STAGE_INVALID",
        "blocksCheckIn",
        "Only forms completed after approval can prevent check-in",
      );
  if (draft.blocksCheckIn && !draft.isRequired)
      add(
        "CHECK_IN_REQUIRES_REQUIRED",
        "blocksCheckIn",
        "Only a required form can prevent check-in",
      );
  if (
      draft.opensAt &&
      draft.closesAt &&
      new Date(draft.opensAt).getTime() >= new Date(draft.closesAt).getTime()
  )
      add(
        "AVAILABILITY_WINDOW_INVALID",
        "closesAt",
        "Due date must be after the available-from date",
      );
  if (!draft.sections.length)
    add("FORM_EMPTY", "sections", "A form must contain at least one section");
  if (draft.sections.length > 50)
    add(
      "TOO_MANY_SECTIONS",
      "sections",
      "A form may contain at most 50 sections",
    );

  draft.sections.forEach((section, sectionIndex) => {
    const sectionPath = `sections.${sectionIndex}`;
    boundedText(
      section.title,
      `${sectionPath}.title`,
      "Section title",
      255,
      true,
    );
    boundedText(
      section.description,
      `${sectionPath}.description`,
      "Section description",
      2000,
    );
    if (!section.questions.length)
      add(
        "SECTION_EMPTY",
        `${sectionPath}.questions`,
        "Every section must contain at least one question",
      );
    if (section.questions.length > 200)
      add(
        "TOO_MANY_QUESTIONS",
        `${sectionPath}.questions`,
        "A section may contain at most 200 questions",
      );

    section.questions.forEach((question, questionIndex) => {
      const path = `${sectionPath}.questions.${questionIndex}`;
      boundedText(question.label, `${path}.label`, "Question label", 255, true);
      boundedText(question.helpText, `${path}.helpText`, "Help text", 2000);
      if (question.fieldKey) {
        const key = question.fieldKey.trim();
        if (!/^[a-z][a-z0-9_]*$/.test(key) || key.length > 100)
          add("INVALID_FIELD_KEY", `${path}.fieldKey`, "Field key is invalid");
        if (fieldKeys.has(key))
          add(
            "FIELD_KEY_DUPLICATE",
            `${path}.fieldKey`,
            "Field keys must be unique",
          );
        fieldKeys.add(key);
      }

      if (question.options.length > 100)
        add(
          "TOO_MANY_OPTIONS",
          `${path}.options`,
          "A question may contain at most 100 options",
        );
      if (usesOptions(question.fieldType) && question.options.length < 2)
        add(
          "OPTIONS_REQUIRED",
          `${path}.options`,
          "Option questions require at least two options",
        );
      if (!usesOptions(question.fieldType) && question.options.length)
        add(
          "OPTIONS_NOT_ALLOWED",
          `${path}.options`,
          "This field type cannot have options",
        );
      const optionValues = new Set<string>();
      const optionLabels = new Set<string>();
      question.options.forEach((option, optionIndex) => {
        const optionPath = `${path}.options.${optionIndex}`;
        boundedText(
          option.label,
          `${optionPath}.label`,
          "Option label",
          255,
          true,
        );
        boundedText(
          option.value,
          `${optionPath}.value`,
          "Option value",
          255,
          true,
        );
        const value = option.value.trim();
        const label = option.label.trim();
        if (label && optionLabels.has(label))
          add(
            "OPTION_LABEL_DUPLICATE",
            `${optionPath}.label`,
            "Option labels must be unique within a question",
          );
        if (value && optionValues.has(value))
          add(
            "OPTION_VALUE_DUPLICATE",
            `${optionPath}.value`,
            "Option values must be unique within a question",
          );
        optionValues.add(value);
        optionLabels.add(label);
      });

      const validation = question.validation;
      const allowed =
        question.fieldType === "NUMBER"
          ? new Set(["min", "max"])
          : question.fieldType === "CHECKBOX"
            ? new Set(["minSelections", "maxSelections"])
            : question.fieldType === "FILE"
              ? new Set(["allowedFileTypes", "maxFileSizeMb", "maxFiles"])
              : question.fieldType === "DATE"
                ? new Set(["minDate", "maxDate"])
                : question.fieldType === "TEXT" ||
                    question.fieldType === "TEXTAREA"
                  ? new Set([
                      "minLength",
                      "maxLength",
                      "pattern",
                      "patternMessage",
                    ])
                  : new Set<string>();
      Object.entries(validation).forEach(([key, value]) => {
        if (value !== undefined && !allowed.has(key))
          add(
            "VALIDATION_NOT_APPLICABLE",
            `${path}.validation.${key}`,
            `${key} is not valid for ${question.fieldType}`,
          );
      });
      const numericRules: Array<
        [
          keyof typeof validation,
          { integer?: boolean; min?: number; max?: number },
        ]
      > = [
        ["minLength", { integer: true, min: 0 }],
        ["maxLength", { integer: true, min: 1 }],
        ["min", {}],
        ["max", {}],
        ["minSelections", { integer: true, min: 0 }],
        ["maxSelections", { integer: true, min: 1 }],
        ["maxFileSizeMb", { min: Number.MIN_VALUE, max: 100 }],
        ["maxFiles", { integer: true, min: 1, max: 20 }],
      ];
      numericRules.forEach(([key, rule]) => {
        const value = validation[key];
        if (value === undefined || typeof value !== "number") return;
        if (
          !Number.isFinite(value) ||
          (rule.integer && !Number.isInteger(value)) ||
          (rule.min !== undefined && value < rule.min) ||
          (rule.max !== undefined && value > rule.max)
        )
          add(
            "INVALID_VALIDATION_RANGE",
            `${path}.validation.${key}`,
            `${key} is outside its allowed range`,
          );
      });
      const compare = (
        minimum: number | string | undefined,
        maximum: number | string | undefined,
        key: string,
      ) => {
        if (minimum !== undefined && maximum !== undefined && minimum > maximum)
          add(
            "INVALID_VALIDATION_RANGE",
            `${path}.validation.${key}`,
            `${key} must not exceed its maximum`,
          );
      };
      compare(validation.minLength, validation.maxLength, "minLength");
      compare(validation.min, validation.max, "min");
      compare(
        validation.minSelections,
        validation.maxSelections,
        "minSelections",
      );
      compare(validation.minDate, validation.maxDate, "minDate");
      boundedText(
        validation.pattern,
        `${path}.validation.pattern`,
        "Pattern",
        256,
      );
      boundedText(
        validation.patternMessage,
        `${path}.validation.patternMessage`,
        "Pattern message",
        200,
      );
      if (validation.patternMessage?.trim() && !validation.pattern?.trim())
        add(
          "PATTERN_REQUIRED",
          `${path}.validation.patternMessage`,
          "Pattern message requires a pattern",
        );
      (["minDate", "maxDate"] as const).forEach((key) => {
        const value = validation[key];
        if (value !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(value))
          add(
            "INVALID_DATE",
            `${path}.validation.${key}`,
            `${key} must be an ISO date`,
          );
      });
      if (
        question.fieldType === "CHECKBOX" &&
        validation.maxSelections !== undefined &&
        validation.maxSelections > question.options.length
      )
        add(
          "SELECTION_LIMIT_EXCEEDS_OPTIONS",
          `${path}.validation.maxSelections`,
          "Maximum selections cannot exceed the number of options",
        );
      if (
        validation.allowedFileTypes &&
        (validation.allowedFileTypes.length > 25 ||
          validation.allowedFileTypes.some((value) => !value.trim()))
      )
        add(
          "INVALID_FILE_TYPES",
          `${path}.validation.allowedFileTypes`,
          "Allowed file types must contain 25 or fewer nonblank values",
        );
    });
  });
  return issues;
};

type PersistNewDraftOptions<TCreated extends CreatedFormIdentity, TSaved> = {
  draft: EditorDraft;
  subEventId: string;
  created: TCreated | null;
  create: (metadata: {
    name: string;
    description: string | null;
    stage: EditorDraft["stage"];
    subEventId: string;
    audience: DraftPayload["audience"];
    isRequired: boolean;
    opensAt: string | null;
    closesAt: string | null;
    blocksCheckIn: boolean;
    orderIndex: number;
  }) => Promise<TCreated>;
  save: (id: string, draft: DraftPayload) => Promise<TSaved>;
};

export type PersistNewDraftResult<TCreated, TSaved> =
  | { status: "invalid"; issues: DraftValidationIssue[] }
  | { status: "create-failed"; error: unknown }
  | { status: "save-failed"; error: unknown; created: TCreated }
  | { status: "saved"; created: TCreated; saved: TSaved };

export const persistNewDraft = async <
  TCreated extends CreatedFormIdentity,
  TSaved,
>({
  draft,
  subEventId,
  created,
  create,
  save,
}: PersistNewDraftOptions<TCreated, TSaved>): Promise<
  PersistNewDraftResult<TCreated, TSaved>
> => {
  const issues = validateDraftLocally(draft);
  if (issues.length) return { status: "invalid", issues };
  let form = created;
  if (!form) {
    try {
      form = await create({
        name: draft.name.trim(),
        description: draft.description?.trim() || null,
        stage: draft.stage,
        subEventId,
        audience: toPayload(draft).audience,
        isRequired: toPayload(draft).isRequired,
        opensAt: toPayload(draft).opensAt,
        closesAt: toPayload(draft).closesAt,
        blocksCheckIn: toPayload(draft).blocksCheckIn,
        orderIndex: toPayload(draft).orderIndex,
      });
    } catch (error) {
      return { status: "create-failed", error };
    }
  }
  try {
    const saved = await save(form.id, {
      ...toPayload(draft),
      revision: form.revision,
    });
    return { status: "saved", created: form, saved };
  } catch (error) {
    return { status: "save-failed", error, created: form };
  }
};

export const nextOptionValue = (values: string[]) => {
  const used = new Set(values);
  let index = 1;
  while (used.has(`option_${index}`)) index += 1;
  return `option_${index}`;
};

export const validationForType = (
  validation: DraftQuestion["validation"],
  type: FieldType,
): DraftQuestion["validation"] => {
  if (type === "TEXT" || type === "TEXTAREA")
    return {
      minLength: validation.minLength,
      maxLength: validation.maxLength,
      pattern: validation.pattern,
      patternMessage: validation.patternMessage,
    };
  if (type === "NUMBER") return { min: validation.min, max: validation.max };
  if (type === "DATE")
    return { minDate: validation.minDate, maxDate: validation.maxDate };
  if (type === "CHECKBOX")
    return {
      minSelections: validation.minSelections,
      maxSelections: validation.maxSelections,
    };
  if (type === "FILE")
    return {
      allowedFileTypes: validation.allowedFileTypes,
      maxFileSizeMb: validation.maxFileSizeMb,
      maxFiles: validation.maxFiles,
    };
  return {};
};

export const previewSections = (preview: PreviewPayload): DraftSection[] =>
  preview.sections.map((section, sectionIndex) => ({
    ...section,
    clientKey:
      section.id ?? section.clientKey ?? `preview-section-${sectionIndex}`,
    questions: section.questions.map((question, questionIndex) => ({
      ...question,
      clientKey:
        question.id ?? `preview-question-${sectionIndex}-${questionIndex}`,
    })),
  }));

export const canCreateForm = (
  eventId: string,
  subeventId: string,
  eventLoaded: boolean,
  subevent?: { id: string; eventId: string },
) =>
  Boolean(
    eventId &&
    subeventId &&
    eventLoaded &&
    subevent?.id === subeventId &&
    subevent.eventId === eventId,
  );
