import { useEffect, useState } from "react";
import { CheckCircle2, Eye, FileText, Plus, Save, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FormFieldType, FormQuestion, RegistrationForm, RegistrationFormStatus, Subevent } from "@/types/events";

import { fieldTypes, optionFieldTypes } from "./field-types";
import { FormQuestionCard } from "./FormQuestionCard";

interface FormBuilderProps {
  form: RegistrationForm;
  subevent: Subevent;
}

const createQuestion = (formId: string, fieldType: FormFieldType, orderIndex: number): FormQuestion => {
  const id = `local-question-${Date.now()}`;
  const hasOptions = optionFieldTypes.includes(fieldType);
  return {
    id,
    registrationFormId: formId,
    label: "Untitled question",
    fieldKey: "untitled_question",
    fieldType,
    isRequired: true,
    helpText: null,
    orderIndex,
    status: "ACTIVE",
    options: hasOptions ? [{ id: `${id}-option-1`, formQuestionId: id, label: "Option 1", value: "option-1", isActive: true }] : [],
  };
};

const PreviewField = ({ question }: { question: FormQuestion }) => {
  const label = question.label || "Untitled question";
  const options = question.options.filter((option) => option.isActive);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}{question.isRequired && <span className="ml-1 text-semantic-danger">*</span>}</p>
      {question.helpText && <p className="text-xs leading-5 text-muted-foreground">{question.helpText}</p>}
      {question.fieldType === "TEXTAREA" ? <textarea disabled rows={3} className="w-full resize-none rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm" placeholder="Your answer" /> : question.fieldType === "SELECT" ? <select disabled className="h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"><option>Select an option</option>{options.map((option) => <option key={option.id}>{option.label}</option>)}</select> : question.fieldType === "RADIO" || question.fieldType === "CHECKBOX" ? <div className="space-y-2">{options.map((option) => <label key={option.id} className="flex items-center gap-2 text-sm text-foreground"><input disabled type={question.fieldType === "RADIO" ? "radio" : "checkbox"} /> {option.label}</label>)}</div> : <Input disabled type={question.fieldType === "FILE" ? "file" : question.fieldType.toLowerCase()} placeholder="Your answer" />}
    </div>
  );
};

export const FormBuilder = ({ form, subevent }: FormBuilderProps) => {
  const [questions, setQuestions] = useState(() => [...form.questions].sort((a, b) => a.orderIndex - b.orderIndex));
  const [status, setStatus] = useState<RegistrationFormStatus>(form.status);
  const [isSaved, setIsSaved] = useState(false);
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);
  const [removingQuestionId, setRemovingQuestionId] = useState<string | null>(null);
  const canEditQuestions = status !== "CLOSED";

  const focusQuestion = (questionId: string) => {
    setFocusedQuestionId(null);
    window.requestAnimationFrame(() => setFocusedQuestionId(questionId));
  };

  useEffect(() => {
    if (!focusedQuestionId) return;
    const question = document.getElementById(`form-question-${focusedQuestionId}`);
    question?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    question?.focus({ preventScroll: true });
  }, [focusedQuestionId]);

  const updateQuestions = (nextQuestions: FormQuestion[]) =>
    setQuestions(nextQuestions.map((question, orderIndex) => ({ ...question, orderIndex })));

  const addQuestion = (fieldType: FormFieldType) => {
    const question = createQuestion(form.id, fieldType, questions.length);
    updateQuestions([...questions, question]);
    focusQuestion(question.id);
    setIsSaved(false);
  };

  const updateQuestion = (index: number, question: FormQuestion) => {
    const next = [...questions];
    next[index] = question;
    updateQuestions(next);
    focusQuestion(question.id);
    setIsSaved(false);
  };

  const removeQuestion = (index: number) => {
    const questionId = questions[index].id;
    const nextFocusId = questions[index + 1]?.id ?? questions[index - 1]?.id ?? null;
    setRemovingQuestionId(questionId);
    window.setTimeout(() => {
      updateQuestions(questions.filter((question) => question.id !== questionId));
      setRemovingQuestionId(null);
      if (nextFocusId) focusQuestion(nextFocusId);
    }, 170);
    setIsSaved(false);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    const next = [...questions];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    updateQuestions(next);
    focusQuestion(questions[index].id);
    setIsSaved(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 overflow-hidden rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-sm">
        <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.1em] text-primary-foreground/75">REGISTRATION FORM</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{subevent.name}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-primary-foreground/80">Shape the details participants share before joining this sub-event.</p>
          </div>
          <div className="flex items-center gap-2"><Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/15">{status === "PUBLISHED" ? "Open" : status}</Badge><span className="text-sm font-medium text-primary-foreground/80">No responses yet</span></div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section aria-labelledby="form-builder-heading" className="min-w-0">
          <div className="sticky top-4 z-10 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur sm:px-4">
            <div><h2 id="form-builder-heading" className="text-base font-semibold text-foreground">Questions</h2><p className="text-sm text-muted-foreground">{questions.length} {questions.length === 1 ? "question" : "questions"} in this form</p></div>
            <Popover>
              <PopoverTrigger asChild><Button type="button" size="sm" disabled={!canEditQuestions}><Plus /> Add question</Button></PopoverTrigger>
              <PopoverContent align="end" className="w-[22rem] p-2">
                <p className="px-2 pb-2 pt-1 text-xs font-bold tracking-[0.08em] text-muted-foreground">ANSWER TYPE</p>
                <div className="grid grid-cols-2 gap-1">
                  {fieldTypes.map((fieldType) => { const Icon = fieldType.icon; return <button key={fieldType.value} type="button" className="flex items-start gap-2 rounded-lg p-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => addQuestion(fieldType.value)}><Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><span className="block text-sm font-semibold text-foreground">{fieldType.label}</span><span className="block text-xs text-muted-foreground">{fieldType.description}</span></span></button>; })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => <FormQuestionCard key={question.id} question={question} index={index} total={questions.length} disabled={!canEditQuestions} isRemoving={removingQuestionId === question.id} isFocused={focusedQuestionId === question.id} onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)} onDuplicate={() => { const id = `local-question-${Date.now()}`; const duplicate = { ...question, id, label: `${question.label} (copy)`, options: question.options.map((option, optionIndex) => ({ ...option, id: `local-option-${Date.now()}-${optionIndex}`, formQuestionId: id })) }; updateQuestions([...questions.slice(0, index + 1), duplicate, ...questions.slice(index + 1)]); focusQuestion(id); setIsSaved(false); }} onDelete={() => removeQuestion(index)} onMove={(direction) => moveQuestion(index, direction)} />)}
            {questions.length === 0 && <div className="rounded-xl border border-dashed border-input bg-muted/25 px-5 py-12 text-center"><FileText aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-3 text-base font-semibold">Start with a question</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Ask only for information your team will actually use.</p></div>}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4 text-primary" /> Form settings</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><label className="text-sm font-semibold text-foreground" htmlFor="registration-form-status">Registration status</label><select id="registration-form-status" className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20" value={status} onChange={(event) => { setStatus(event.target.value as RegistrationFormStatus); setIsSaved(false); }}><option value="DRAFT">Draft — not open</option><option value="PUBLISHED">Open for registrations</option><option value="CLOSED">Closed</option></select><p className="text-xs leading-5 text-muted-foreground">Closing a form keeps it available here but locks all question editing.</p></div><div className="space-y-3 border-t border-border pt-3"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Questions</span><span className="font-semibold text-foreground">{questions.length}</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Responses</span><span className="font-semibold text-foreground">0</span></div></div></CardContent></Card>
          <Dialog>
          <DialogTrigger asChild><Button type="button" variant="secondary" className="w-full"><Eye /> Preview form</Button></DialogTrigger>
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>Participant preview</DialogTitle><DialogDescription>How the registration questions will appear to participants.</DialogDescription></DialogHeader><div className="mt-2 space-y-6">{questions.map((question) => <PreviewField key={question.id} question={question} />)}</div></DialogContent>
          </Dialog>
          <Button type="button" className="w-full" onClick={() => setIsSaved(true)}><Save /> Save changes</Button>
          {isSaved && <p role="status" className="flex items-center gap-2 rounded-lg border border-semantic-success-border bg-semantic-success-background px-3 py-2.5 text-sm text-semantic-success"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Saved locally</p>}
        </aside>
      </div>
    </div>
  );
};
