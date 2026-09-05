import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, Plus, Trash2 } from "lucide-react";
import {
  useRegistrationForm,
  useRegistrationFormAction,
  useSaveRegistrationForm,
} from "@/api/event-registration/queries";
import { StatusBadge } from "@/components/events/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FormQuestionDraft,
  RegistrationFormDraft,
  QuestionType,
} from "@/types/event-registration";
import {
  buildRegistrationFormPayload,
  newQuestion,
  validateRegistrationFormDraft,
} from "@/types/event-registration";

const types: { value: QuestionType; label: string }[] = [
  { value: "TEXT", label: "Short text" },
  { value: "TEXTAREA", label: "Long text" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "SELECT", label: "Dropdown" },
  { value: "RADIO", label: "Single choice" },
  { value: "CHECKBOX", label: "Multiple choice" },
  { value: "FILE", label: "File upload" },
];
const choices = new Set<QuestionType>(["SELECT", "RADIO", "CHECKBOX"]);
const emptyForm = (): RegistrationFormDraft => ({
  name: "Registration form",
  description: "",
  sections: [],
});

export function RegistrationFormBuilder({
  eventId,
  canEdit,
}: {
  eventId: string;
  canEdit: boolean;
}) {
  const query = useRegistrationForm(eventId);
  const save = useSaveRegistrationForm(eventId);
  const action = useRegistrationFormAction(eventId);
  const [draft, setDraft] = useState<RegistrationFormDraft>(emptyForm);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (!query.data) return;
    setDraft({
      name: query.data.name,
      description: query.data.description ?? "",
      sections: query.data.sections.map((section) => ({
        title: section.title,
        description: section.description ?? "",
        questions: section.questions.map((question) => ({
          fieldKey: question.fieldKey,
          label: question.label,
          type: question.type,
          isRequired: question.isRequired ?? true,
          options: question.options ?? [],
          validation: question.validation ?? {},
        })) as FormQuestionDraft[],
      })),
    });
  }, [query.data]);
  const payload = useMemo(() => buildRegistrationFormPayload(draft), [draft]);
  const setSection = (
    index: number,
    patch: Partial<RegistrationFormDraft["sections"][number]>,
  ) =>
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, at) =>
        at === index ? { ...section, ...patch } : section,
      ),
    }));
  const setQuestion = (
    sectionIndex: number,
    questionIndex: number,
    patch: Partial<FormQuestionDraft>,
  ) => {
    const section = draft.sections[sectionIndex];
    setSection(sectionIndex, {
      questions: section.questions.map((question, at) =>
        at === questionIndex ? { ...question, ...patch } : question,
      ),
    });
  };
  const move = <T,>(values: T[], index: number, offset: number) => {
    const result = [...values];
    const target = index + offset;
    if (target < 0 || target >= result.length) return result;
    [result[index], result[target]] = [result[target], result[index]];
    return result;
  };
  const saveDraft = () => {
    const problem = validateRegistrationFormDraft(payload);
    if (problem) return setMessage(problem);
    save.mutate(payload, { onSuccess: () => setMessage("Draft saved.") });
  };
  const run = (
    name: "validate" | "preview" | "publish" | "close" | "duplicate",
  ) => {
    setMessage("");
    action.mutate(name, {
      onSuccess: () => {
        setMessage(
          name === "validate"
            ? "Form is valid."
            : `${name[0].toUpperCase()}${name.slice(1)} complete.`,
        );
        if (name === "preview") setPreview(true);
      },
    });
  };
  if (query.isLoading)
    return <p className="py-10 text-center text-sm">Loading form builder...</p>;
  const status = query.data?.status ?? "DRAFT";
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Registration form</CardTitle>
              <StatusBadge status={status} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Field label="Form name">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                disabled={!canEdit}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="min-h-20 rounded-lg border bg-card px-3 py-2 text-sm disabled:bg-muted"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                disabled={!canEdit}
              />
            </Field>
          </CardContent>
        </Card>
        {draft.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Input
                  aria-label={`Section ${sectionIndex + 1} title`}
                  value={section.title}
                  onChange={(e) =>
                    setSection(sectionIndex, { title: e.target.value })
                  }
                  disabled={!canEdit}
                />
                <OrderButtons
                  onUp={() =>
                    setDraft({
                      ...draft,
                      sections: move(draft.sections, sectionIndex, -1),
                    })
                  }
                  onDown={() =>
                    setDraft({
                      ...draft,
                      sections: move(draft.sections, sectionIndex, 1),
                    })
                  }
                  remove={() =>
                    setDraft({
                      ...draft,
                      sections: draft.sections.filter(
                        (_, at) => at !== sectionIndex,
                      ),
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
              <Input
                placeholder="Optional section description"
                value={section.description}
                onChange={(e) =>
                  setSection(sectionIndex, { description: e.target.value })
                }
                disabled={!canEdit}
              />
            </CardHeader>
            <CardContent className="grid gap-3">
              {section.questions.map((question, questionIndex) => (
                <div
                  className="rounded-lg border bg-muted/20 p-3"
                  key={questionIndex}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      {questionIndex + 1}
                    </span>
                    <Input
                      aria-label="Question label"
                      value={question.label}
                      onChange={(e) =>
                        setQuestion(sectionIndex, questionIndex, {
                          label: e.target.value,
                        })
                      }
                      disabled={!canEdit}
                    />
                    <OrderButtons
                      onUp={() =>
                        setSection(sectionIndex, {
                          questions: move(section.questions, questionIndex, -1),
                        })
                      }
                      onDown={() =>
                        setSection(sectionIndex, {
                          questions: move(section.questions, questionIndex, 1),
                        })
                      }
                      remove={() =>
                        setSection(sectionIndex, {
                          questions: section.questions.filter(
                            (_, at) => at !== questionIndex,
                          ),
                        })
                      }
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Field key">
                      <Input
                        value={question.fieldKey}
                        onChange={(e) =>
                          setQuestion(sectionIndex, questionIndex, {
                            fieldKey: e.target.value
                              .replace(/\s+/g, "_")
                              .toLowerCase(),
                          })
                        }
                        disabled={!canEdit}
                      />
                    </Field>
                    <Field label="Answer type">
                      <Select
                        value={question.type}
                        onValueChange={(value) =>
                          setQuestion(sectionIndex, questionIndex, {
                            type: value as QuestionType,
                            options: choices.has(value as QuestionType)
                              ? question.options
                              : [],
                            validation:
                              value === "FILE"
                                ? {
                                    maxBytes: 5242880,
                                    acceptedTypes: [
                                      "image/jpeg",
                                      "image/png",
                                      "application/pdf",
                                    ],
                                  }
                                : {},
                          })
                        }
                        disabled={!canEdit}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={question.isRequired}
                      onCheckedChange={(checked) =>
                        setQuestion(sectionIndex, questionIndex, {
                          isRequired: checked === true,
                        })
                      }
                      disabled={!canEdit}
                    />
                    Required
                  </label>
                  <ValidationFields
                    question={question}
                    disabled={!canEdit}
                    onChange={(validation) =>
                      setQuestion(sectionIndex, questionIndex, { validation })
                    }
                  />
                  {choices.has(question.type) && (
                    <div className="mt-3 grid gap-2">
                      <p className="text-sm font-semibold">Options</p>
                      {question.options.map((option, optionIndex) => (
                        <div className="flex gap-2" key={optionIndex}>
                          <Input
                            aria-label="Option label"
                            placeholder="Label"
                            value={option.label}
                            onChange={(e) =>
                              setQuestion(sectionIndex, questionIndex, {
                                options: question.options.map((item, at) =>
                                  at === optionIndex
                                    ? { ...item, label: e.target.value }
                                    : item,
                                ),
                              })
                            }
                            disabled={!canEdit}
                          />
                          <Input
                            aria-label="Option value"
                            placeholder="value"
                            value={option.value}
                            onChange={(e) =>
                              setQuestion(sectionIndex, questionIndex, {
                                options: question.options.map((item, at) =>
                                  at === optionIndex
                                    ? { ...item, value: e.target.value }
                                    : item,
                                ),
                              })
                            }
                            disabled={!canEdit}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remove option"
                            onClick={() =>
                              setQuestion(sectionIndex, questionIndex, {
                                options: question.options.filter(
                                  (_, at) => at !== optionIndex,
                                ),
                              })
                            }
                            disabled={!canEdit}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                      {canEdit && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-fit"
                          onClick={() =>
                            setQuestion(sectionIndex, questionIndex, {
                              options: [
                                ...question.options,
                                {
                                  label: `Option ${question.options.length + 1}`,
                                  value: `option_${question.options.length + 1}`,
                                },
                              ],
                            })
                          }
                        >
                          <Plus />
                          Add option
                        </Button>
                      )}
                    </div>
                  )}
                  {question.type === "FILE" && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Field label="Max file size (bytes)">
                        <Input
                          type="number"
                          value={
                            Number(question.validation.maxBytes) || 5242880
                          }
                          onChange={(e) =>
                            setQuestion(sectionIndex, questionIndex, {
                              validation: {
                                ...question.validation,
                                maxBytes: Number(e.target.value),
                                acceptedTypes: question.validation
                                  .acceptedTypes ?? [
                                  "image/jpeg",
                                  "image/png",
                                  "application/pdf",
                                ],
                              },
                            })
                          }
                          disabled={!canEdit}
                        />
                      </Field>
                      <Field label="Accepted MIME types">
                        <Input
                          value={
                            Array.isArray(question.validation.acceptedTypes)
                              ? question.validation.acceptedTypes.join(",")
                              : "image/jpeg,image/png,application/pdf"
                          }
                          onChange={(e) =>
                            setQuestion(sectionIndex, questionIndex, {
                              validation: {
                                ...question.validation,
                                acceptedTypes: e.target.value
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean),
                                maxBytes:
                                  question.validation.maxBytes ?? 5242880,
                              },
                            })
                          }
                          disabled={!canEdit}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
              {canEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-fit"
                  onClick={() =>
                    setSection(sectionIndex, {
                      questions: [
                        ...section.questions,
                        newQuestion(section.questions.length + 1),
                      ],
                    })
                  }
                >
                  <Plus />
                  Add question
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {canEdit && (
          <Button
            type="button"
            variant="secondary"
            className="w-fit"
            onClick={() =>
              setDraft({
                ...draft,
                sections: [
                  ...draft.sections,
                  {
                    title: `Section ${draft.sections.length + 1}`,
                    description: "",
                    questions: [],
                  },
                ],
              })
            }
          >
            <Plus />
            Add section
          </Button>
        )}
      </div>
      <aside>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Draft actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {canEdit && (
              <Button onClick={saveDraft} disabled={save.isPending}>
                Save draft
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => run("validate")}
              disabled={!query.data || action.isPending}
            >
              Validate
            </Button>
            <Button
              variant="secondary"
              onClick={() => run("preview")}
              disabled={!query.data || action.isPending}
            >
              <Eye />
              Preview
            </Button>
            {canEdit && status === "DRAFT" && (
              <Button
                onClick={() => run("publish")}
                disabled={!query.data || action.isPending}
              >
                Publish
              </Button>
            )}
            {canEdit && status === "PUBLISHED" && (
              <Button
                variant="secondary"
                onClick={() => run("close")}
                disabled={action.isPending}
              >
                Close form
              </Button>
            )}
            {canEdit && status !== "DRAFT" && (
              <Button
                variant="secondary"
                onClick={() => run("duplicate")}
                disabled={action.isPending}
              >
                <Copy />
                Duplicate to draft
              </Button>
            )}
            <p
              aria-live="polite"
              className="pt-2 text-sm text-muted-foreground"
            >
              {message ||
                (action.isError || save.isError
                  ? "Action failed. Check the form and try again."
                  : "Save before server validation or preview.")}
            </p>
          </CardContent>
        </Card>
      </aside>
      {preview && (
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Form preview</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreview(false)}
              >
                Close preview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            {draft.sections.map((section, index) => (
              <section key={index}>
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
                <div className="mt-3 grid gap-3">
                  {section.questions.map((question, at) => (
                    <Field
                      key={at}
                      label={`${question.label}${question.isRequired ? " *" : ""}`}
                    >
                      <PreviewInput question={question} />
                    </Field>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PreviewInput({ question }: { question: FormQuestionDraft }) {
  if (question.type === "TEXTAREA")
    return (
      <textarea
        disabled
        className="min-h-20 rounded-lg border bg-muted px-3 py-2"
      />
    );
  if (choices.has(question.type))
    return (
      <div className="grid gap-2">
        {question.options.map((option) => (
          <label className="flex items-center gap-2 text-sm" key={option.value}>
            <input
              type={question.type === "CHECKBOX" ? "checkbox" : "radio"}
              disabled
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  return (
    <Input
      disabled
      type={
        question.type === "NUMBER"
          ? "number"
          : question.type === "DATE"
            ? "date"
            : question.type === "FILE"
              ? "file"
              : "text"
      }
    />
  );
}
function ValidationFields({
  question,
  disabled,
  onChange,
}: {
  question: FormQuestionDraft;
  disabled: boolean;
  onChange: (value: FormQuestionDraft["validation"]) => void;
}) {
  const setValue = (key: string, value: number | string | "") => {
    const next = { ...question.validation };
    if (value === "") delete next[key];
    else next[key] = value;
    onChange(next);
  };
  const numberField = (label: string, key: string) => (
    <Field label={label}>
      <Input
        type="number"
        value={
          typeof question.validation[key] === "number"
            ? String(question.validation[key])
            : ""
        }
        onChange={(event) =>
          setValue(
            key,
            event.target.value === "" ? "" : Number(event.target.value),
          )
        }
        disabled={disabled}
      />
    </Field>
  );
  if (["TEXT", "TEXTAREA"].includes(question.type))
    return (
      <div className="mt-3 grid grid-cols-2 gap-3">
        {numberField("Minimum length", "minLength")}
        {numberField("Maximum length", "maxLength")}
      </div>
    );
  if (question.type === "NUMBER")
    return (
      <div className="mt-3 grid grid-cols-2 gap-3">
        {numberField("Minimum", "min")}
        {numberField("Maximum", "max")}
        <label className="col-span-2 flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={question.validation.integer === true}
            onCheckedChange={(checked) =>
              onChange({ ...question.validation, integer: checked === true })
            }
            disabled={disabled}
          />
          Whole numbers only
        </label>
      </div>
    );
  if (question.type === "DATE")
    return (
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Earliest date">
          <Input
            type="date"
            value={
              typeof question.validation.min === "string"
                ? question.validation.min
                : ""
            }
            onChange={(event) => setValue("min", event.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field label="Latest date">
          <Input
            type="date"
            value={
              typeof question.validation.max === "string"
                ? question.validation.max
                : ""
            }
            onChange={(event) => setValue("max", event.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>
    );
  if (question.type === "CHECKBOX")
    return (
      <div className="mt-3 grid grid-cols-2 gap-3">
        {numberField("Minimum selections", "minSelections")}
        {numberField("Maximum selections", "maxSelections")}
      </div>
    );
  return null;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
function OrderButtons({
  onUp,
  onDown,
  remove,
  disabled,
}: {
  onUp: () => void;
  onDown: () => void;
  remove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Move up"
        onClick={onUp}
        disabled={disabled}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Move down"
        onClick={onDown}
        disabled={disabled}
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Remove"
        onClick={remove}
        disabled={disabled}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
