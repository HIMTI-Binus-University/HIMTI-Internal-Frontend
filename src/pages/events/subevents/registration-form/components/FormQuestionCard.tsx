import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import type { FormQuestion, FormFieldType } from "@/types/events";

import { getFieldType, optionFieldTypes } from "./field-types";

interface FormQuestionCardProps {
  question: FormQuestion;
  index: number;
  total: number;
  onChange: (question: FormQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  disabled?: boolean;
  isRemoving?: boolean;
  isFocused?: boolean;
}

const fieldClassName =
  "flex w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

export const FormQuestionCard = ({
  question,
  index,
  total,
  onChange,
  onDuplicate,
  onDelete,
  onMove,
  disabled = false,
  isRemoving = false,
  isFocused = false,
}: FormQuestionCardProps) => {
  const fieldType = getFieldType(question.fieldType);
  const FieldIcon = fieldType.icon;
  const hasOptions = optionFieldTypes.includes(question.fieldType);

  const update = (updates: Partial<FormQuestion>) => onChange({ ...question, ...updates });

  const updateOption = (optionId: string, label: string) =>
    update({
      options: question.options.map((option) =>
        option.id === optionId
          ? { ...option, label, value: label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
          : option,
      ),
    });

  return (
    <article id={`form-question-${question.id}`} tabIndex={-1} aria-disabled={disabled} className={`rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isRemoving ? "form-question-exit" : ""} ${isFocused ? "form-question-focus" : ""}`}>
      <div className="flex items-center gap-2 border-b border-border bg-muted/35 px-3 py-2.5 sm:px-4">
        <GripVertical aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        <Badge variant="info" className="gap-1.5 font-medium">
          <FieldIcon aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.75]" />
          {fieldType.label}
        </Badge>
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton label="Move question up" size="sm" disabled={disabled || index === 0} onClick={() => onMove("up")}>
            <ChevronUp />
          </IconButton>
          <IconButton label="Move question down" size="sm" disabled={disabled || index === total - 1} onClick={() => onMove("down")}>
            <ChevronDown />
          </IconButton>
          <IconButton label="Duplicate question" size="sm" disabled={disabled} onClick={onDuplicate}>
            <Copy />
          </IconButton>
          <IconButton label="Delete question" tone="danger" size="sm" disabled={disabled} onClick={onDelete}>
            <Trash2 />
          </IconButton>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor={`${question.id}-label`}>Question</label>
            <Input id={`${question.id}-label`} disabled={disabled} value={question.label} placeholder="e.g. Student ID number" onChange={(event) => update({ label: event.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor={`${question.id}-type`}>Answer type</label>
            <select id={`${question.id}-type`} disabled={disabled} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60" value={question.fieldType} onChange={(event) => update({ fieldType: event.target.value as FormFieldType, options: optionFieldTypes.includes(event.target.value as FormFieldType) && question.options.length === 0 ? [{ id: `${question.id}-option-1`, formQuestionId: question.id, label: "Option 1", value: "option-1", isActive: true }] : question.options })}>
              {(["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "RADIO", "CHECKBOX", "FILE"] as FormFieldType[]).map((type) => <option key={type} value={type}>{getFieldType(type).label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor={`${question.id}-help`}>Help text <span className="font-normal text-muted-foreground">(optional)</span></label>
          <textarea id={`${question.id}-help`} disabled={disabled} className={fieldClassName} rows={2} value={question.helpText ?? ""} placeholder="Add a short hint that helps participants answer correctly." onChange={(event) => update({ helpText: event.target.value || null })} />
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-3.5 py-3">
          <span>
            <span className="block text-sm font-semibold text-foreground">Required answer</span>
            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Participants must complete this before they can submit.</span>
          </span>
          <input aria-label={`Required: ${question.label || "untitled question"}`} disabled={disabled} className="h-5 w-5 rounded border-input text-primary focus:ring-ring" type="checkbox" checked={question.isRequired} onChange={(event) => update({ isRequired: event.target.checked })} />
        </label>

        {hasOptions && (
          <section aria-label="Question options" className="space-y-3 rounded-lg border border-border p-3.5">
            <div><h3 className="text-sm font-semibold text-foreground">Options</h3><p className="mt-0.5 text-xs text-muted-foreground">Participants will see these choices in the registration form.</p></div>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={option.id} className="flex gap-2">
                  <Input aria-label={`Option ${optionIndex + 1}`} disabled={disabled} value={option.label} onChange={(event) => updateOption(option.id, event.target.value)} />
                  <IconButton label={`Remove option ${optionIndex + 1}`} tone="danger" disabled={disabled || question.options.length === 1} onClick={() => update({ options: question.options.filter((item) => item.id !== option.id) })}><Trash2 /></IconButton>
                </div>
              ))}
            </div>
            <button type="button" disabled={disabled} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" onClick={() => update({ options: [...question.options, { id: `${question.id}-option-${question.options.length + 1}`, formQuestionId: question.id, label: `Option ${question.options.length + 1}`, value: `option-${question.options.length + 1}`, isActive: true }] })}><Plus className="h-4 w-4 stroke-[2]" /> Add option</button>
          </section>
        )}
      </div>
    </article>
  );
};
