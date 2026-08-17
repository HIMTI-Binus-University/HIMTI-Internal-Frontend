import { describe, expect, it, vi } from "vitest";

import {
  canCreateForm,
  moveItem,
  newEditorDraft,
  nextOptionValue,
  persistNewDraft,
  toPayload,
  usesOptions,
  validateDraftLocally,
  validationForType,
  type EditorDraft,
  type DraftSection,
} from "./form-draft";

const validDraft = (): EditorDraft => ({
  ...newEditorDraft(),
  name: "Registration form",
  sections: [
    {
      clientKey: "section-new",
      title: "Details",
      questions: [
        {
          clientKey: "question-new",
          fieldType: "SELECT",
          isRequired: true,
          label: "Track",
          options: [
            { label: "Frontend", value: "frontend" },
            { label: "Backend", value: "backend" },
          ],
          validation: {},
        },
      ],
    },
  ],
});

describe("form draft helpers", () => {
  it("serializes a complete draft and retains new section client keys", () => {
    const sections: DraftSection[] = [
      {
        clientKey: "section-new",
        title: " Details ",
        description: " ",
        questions: [
          {
            clientKey: "question-new",
            fieldType: "TEXT",
            isRequired: true,
            label: " Name ",
            options: [],
            validation: { minLength: 2 },
          },
        ],
      },
    ];
    expect(
      toPayload({
        name: " Form ",
        description: " ",
        revision: 3,
        stage: "REGISTRATION",
        sections,
      }),
    ).toEqual({
      name: "Form",
      description: null,
      revision: 3,
      stage: "REGISTRATION",
      sections: [
        {
          clientKey: "section-new",
          title: "Details",
          description: null,
          questions: [
            {
              fieldType: "TEXT",
              isRequired: true,
              label: "Name",
              helpText: null,
              options: [],
              validation: { minLength: 2 },
            },
          ],
        },
      ],
    });
  });

  it("reorders without mutating and recognizes option-backed types", () => {
    const source = ["a", "b", "c"];
    expect(moveItem(source, 1, -1)).toEqual(["b", "a", "c"]);
    expect(source).toEqual(["a", "b", "c"]);
    expect([
      usesOptions("SELECT"),
      usesOptions("RADIO"),
      usesOptions("CHECKBOX"),
      usesOptions("FILE"),
    ]).toEqual([true, true, true, false]);
  });

  it("gates creation to matching loaded route ownership", () => {
    expect(
      canCreateForm("event-1", "sub-1", true, {
        id: "sub-1",
        eventId: "event-1",
      }),
    ).toBe(true);
    expect(
      canCreateForm("event-2", "sub-1", true, {
        id: "sub-1",
        eventId: "event-1",
      }),
    ).toBe(false);
    expect(canCreateForm("event-1", "sub-1", false)).toBe(false);
  });

  it("generates unique option values and preserves compatible validation", () => {
    expect(nextOptionValue(["option_1", "custom", "option_3"])).toBe(
      "option_2",
    );
    expect(
      validationForType({ minLength: 2, maxLength: 8 }, "TEXTAREA"),
    ).toEqual({ minLength: 2, maxLength: 8 });
    expect(validationForType({ minLength: 2, max: 10 }, "NUMBER")).toEqual({
      min: undefined,
      max: 10,
    });
  });

  it("never serializes non-finite numeric validation values", () => {
    const payload = toPayload({
      name: "Form",
      revision: 1,
      stage: "REGISTRATION",
      sections: [
        {
          clientKey: "section",
          title: "Section",
          questions: [
            {
              clientKey: "question",
              label: "Number",
              fieldType: "NUMBER",
              isRequired: true,
              options: [],
              validation: { min: Number.NaN, max: 10 },
            },
          ],
        },
      ],
    });
    expect(payload.sections[0].questions[0].validation).toEqual({ max: 10 });
  });

  it("validates the complete draft rules locally", () => {
    const draft = validDraft();
    draft.sections[0].questions[0].options[1] = {
      label: " Frontend ",
      value: "frontend",
    };
    draft.sections[0].questions[0].fieldType = "CHECKBOX";
    draft.sections[0].questions[0].validation = {
      minSelections: 4,
      maxSelections: 3,
    };

    expect(validateDraftLocally(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "OPTION_LABEL_DUPLICATE" }),
        expect.objectContaining({ code: "OPTION_VALUE_DUPLICATE" }),
        expect.objectContaining({ code: "INVALID_VALIDATION_RANGE" }),
        expect.objectContaining({ code: "SELECTION_LIMIT_EXCEEDS_OPTIONS" }),
      ]),
    );
  });

  it("does not create anything until explicit persistence and saves with the created identity", async () => {
    const calls: string[] = [];
    const create = vi.fn(async () => {
      calls.push("create");
      return { id: "form-created", revision: 7 };
    });
    const save = vi.fn(
      async (id: string, draft: ReturnType<typeof toPayload>) => {
        calls.push("save");
        return { id, revision: draft.revision + 1 };
      },
    );

    expect(create).not.toHaveBeenCalled();
    const result = await persistNewDraft({
      draft: validDraft(),
      subEventId: "sub-1",
      created: null,
      create,
      save,
    });

    expect(result.status).toBe("saved");
    expect(calls).toEqual(["create", "save"]);
    expect(create).toHaveBeenCalledWith({
      name: "Registration form",
      description: null,
      stage: "REGISTRATION",
      subEventId: "sub-1",
    });
    expect(save).toHaveBeenCalledWith(
      "form-created",
      expect.objectContaining({ revision: 7 }),
    );
  });

  it("does not create or save an invalid local draft", async () => {
    const create = vi.fn();
    const save = vi.fn();

    const result = await persistNewDraft({
      draft: newEditorDraft(),
      subEventId: "sub-1",
      created: null,
      create,
      save,
    });

    expect(result.status).toBe("invalid");
    expect(create).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("retries a post-create save without creating a duplicate form", async () => {
    const created = { id: "form-created", revision: 4 };
    const create = vi.fn(async () => created);
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValueOnce({ id: created.id, revision: 5 });
    const draft = validDraft();

    const first = await persistNewDraft({
      draft,
      subEventId: "sub-1",
      created: null,
      create,
      save,
    });
    expect(first.status).toBe("save-failed");
    if (first.status !== "save-failed")
      throw new Error("Expected save failure");

    const second = await persistNewDraft({
      draft,
      subEventId: "sub-1",
      created: first.created,
      create,
      save,
    });

    expect(second.status).toBe("saved");
    expect(create).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(
      created.id,
      expect.objectContaining({ revision: created.revision }),
    );
  });
});
