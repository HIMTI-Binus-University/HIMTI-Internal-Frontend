import type { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { useEffect, useRef, useState, type FormEvent } from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import cpp from "highlight.js/lib/languages/cpp";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import { createLowlight } from "lowlight";
import {
  Bold,
  ChevronDown,
  Code,
  Heading,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Sigma,
  SquareCode,
  SquareSigma,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import "katex/dist/katex.min.css";
import "./responsi-editor.css";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function publicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
  } catch {
    return undefined;
  }
}

const editorExtensions = [
  CodeBlockLowlight.configure({
    lowlight: createLowlight({ cpp, javascript, python, sql }),
  }),
  Mathematics.configure({
    katexOptions: { trust: false, maxExpand: 1000, throwOnError: false },
  }),
  TableKit,
  Image.extend({
    renderHTML({ HTMLAttributes }) {
      const { src, alt } = HTMLAttributes;
      return [
        "img",
        {
          src: typeof src === "string" ? publicHttpsUrl(src) : undefined,
          alt: typeof alt === "string" ? alt : "",
          referrerpolicy: "no-referrer",
        },
      ];
    },
  }),
  Markdown,
];

const starterKit = (collaborative: boolean) => StarterKit.configure({
    codeBlock: false,
    ...(collaborative ? { undoRedo: false as const } : {}),
    trailingNode: false,
    link: {
      openOnClick: false,
      isAllowedUri: (url) => Boolean(publicHttpsUrl(url)),
    },
  });

type InsertKind = "Link" | "Image" | "Inline math" | "Block math";
const insertIcons = {
  Link,
  Image: ImageIcon,
  "Inline math": Sigma,
  "Block math": SquareSigma,
} satisfies Record<InsertKind, LucideIcon>;

export default function ResponsiEditor({
  value,
  onChange,
  readOnly = false,
  provider,
  collaboratorName,
}: {
  value: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  provider?: HocuspocusProvider;
  collaboratorName?: string;
}) {
  const lastMarkdown = useRef(value);
  const insertInput = useRef<HTMLInputElement>(null);
  const returnFocusToEditor = useRef(false);
  const [insert, setInsert] = useState<InsertKind | null>(null);
  const [field, setField] = useState("");
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [
      starterKit(Boolean(provider)),
      ...editorExtensions,
      ...(provider ? [
        Collaboration.configure({ document: provider.document }),
        CollaborationCaret.configure({
          provider,
          user: { name: collaboratorName, color: "#2563eb" },
        }),
      ] : []),
    ],
    content: provider ? undefined : value,
    contentType: "markdown",
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: {
      attributes: {
        role: readOnly ? "document" : "textbox",
        "aria-label": readOnly ? "Summary preview" : "Summary content",
        ...(readOnly ? {} : { "aria-multiline": "true" }),
        class:
          "responsi-document min-h-64 p-4 text-sm leading-7 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6",
      },
    },
    onCreate: ({ editor }) => {
      if (provider) onChange?.(editor.getMarkdown());
    },
    onUpdate: ({ editor }) => {
      lastMarkdown.current = editor.getMarkdown();
      onChange?.(lastMarkdown.current);
    },
  }, [provider]);

  useEffect(() => {
    if (provider || !editor || value === lastMarkdown.current) return;
    editor.commands.setContent(value, {
      contentType: "markdown",
      emitUpdate: false,
    });
    lastMarkdown.current = value;
  }, [editor, provider, value]);

  useEffect(() => {
    if (insert) insertInput.current?.focus();
  }, [insert]);

  const active = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            strike: editor.isActive("strike"),
            heading2: editor.isActive("heading", { level: 2 }),
            heading3: editor.isActive("heading", { level: 3 }),
            bullets: editor.isActive("bulletList"),
            numbered: editor.isActive("orderedList"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
            quote: editor.isActive("blockquote"),
            code: editor.isActive("code"),
            codeBlock: editor.isActive("codeBlock"),
            language: editor.getAttributes("codeBlock").language as
              | string
              | undefined,
            link: editor.isActive("link"),
          }
        : null,
  });

  if (!editor)
    return (
      <p role="status" className="p-4">
        Loading editor...
      </p>
    );
  if (readOnly) return <EditorContent editor={editor} />;

  const toggle = (
    label: string,
    Icon: LucideIcon,
    pressed: boolean | undefined,
    run: () => void,
  ) => (
    <IconButton
      label={label}
      className="size-11 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
      aria-pressed={pressed ?? false}
      onClick={run}
    >
      <Icon aria-hidden="true" />
    </IconButton>
  );

  const formatMenu = (
    label: string,
    Icon: LucideIcon,
    selected: string,
    items: { label: string; icon: LucideIcon; run: () => void }[],
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          label={label}
          className="h-11 min-w-11 gap-0.5 px-1.5 aria-expanded:bg-accent [&>svg:last-child]:size-3"
        >
          <Icon aria-hidden="true" />
          <ChevronDown aria-hidden="true" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        onCloseAutoFocus={(event) => {
          if (!returnFocusToEditor.current) return;
          returnFocusToEditor.current = false;
          event.preventDefault();
          editor.commands.focus();
        }}
      >
        <DropdownMenuRadioGroup value={selected}>
          {items.map(({ label: itemLabel, icon: ItemIcon, run }) => (
            <DropdownMenuRadioItem
              key={itemLabel}
              value={itemLabel}
              className="min-h-11 gap-2"
              onSelect={() => {
                returnFocusToEditor.current = true;
                run();
              }}
            >
              <ItemIcon className="size-4" aria-hidden="true" />
              {itemLabel}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const openInsert = (kind: InsertKind) => {
    setInsert(kind);
    setField(kind === "Link" ? (editor.getAttributes("link").href ?? "") : "");
    setError("");
  };

  const submitInsert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = field.trim();
    if (!input) return;
    const data = new FormData(event.currentTarget);
    if (insert === "Link" || insert === "Image") {
      const url = publicHttpsUrl(input);
      if (!url) return setError("Enter a valid HTTPS URL without credentials.");
      if (insert === "Link") {
        if (editor.state.selection.empty && !editor.isActive("link")) {
          const label = String(data.get("label") ?? "").trim() || url;
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text: label,
              marks: [{ type: "link", attrs: { href: url } }],
            })
            .run();
        } else {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }
      } else {
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: String(data.get("label") ?? "").trim() })
          .run();
      }
    } else if (insert === "Inline math") {
      editor.chain().focus().insertInlineMath({ latex: input }).run();
    } else if (insert === "Block math") {
      editor.chain().focus().insertBlockMath({ latex: input }).run();
    }
    setInsert(null);
  };

  const isUrl = insert === "Link" || insert === "Image";
  return (
    <>
      <div
        role="group"
        aria-label="Formatting"
        className="flex shrink-0 flex-wrap items-center gap-y-1 border-b border-border px-3 py-2"
      >
        <div className="flex items-center border-r border-border pr-1">
          <IconButton
            label="Undo"
            className="size-11"
            disabled={!active?.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 aria-hidden="true" />
          </IconButton>
          <IconButton
            label="Redo"
            className="size-11"
            disabled={!active?.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 aria-hidden="true" />
          </IconButton>
        </div>
        <div className="flex items-center border-r border-border px-1">
          {formatMenu(
            "Text style",
            active?.heading2 ? Heading2 : active?.heading3 ? Heading3 : Heading,
            active?.heading2
              ? "Heading 2"
              : active?.heading3
                ? "Heading 3"
                : "Paragraph",
            [
              {
                label: "Paragraph",
                icon: Pilcrow,
                run: () => editor.commands.setParagraph(),
              },
              {
                label: "Heading 2",
                icon: Heading2,
                run: () => editor.commands.setHeading({ level: 2 }),
              },
              {
                label: "Heading 3",
                icon: Heading3,
                run: () => editor.commands.setHeading({ level: 3 }),
              },
            ],
          )}
          {formatMenu(
            "List style",
            active?.numbered ? ListOrdered : List,
            active?.numbered
              ? "Numbered list"
              : active?.bullets
                ? "Bullets"
                : "",
            [
              {
                label: "Bullets",
                icon: List,
                run: () => editor.commands.toggleBulletList(),
              },
              {
                label: "Numbered list",
                icon: ListOrdered,
                run: () => editor.commands.toggleOrderedList(),
              },
            ],
          )}
          {toggle("Quote", Quote, active?.quote, () =>
            editor.chain().focus().toggleBlockquote().run(),
          )}
          {toggle("Code block", SquareCode, active?.codeBlock, () =>
            editor.chain().focus().toggleCodeBlock().run(),
          )}
        </div>
        <div className="flex items-center border-r border-border px-1">
          {toggle("Bold", Bold, active?.bold, () =>
            editor.chain().focus().toggleBold().run(),
          )}
          {toggle("Italic", Italic, active?.italic, () =>
            editor.chain().focus().toggleItalic().run(),
          )}
          {toggle("Strike", Strikethrough, active?.strike, () =>
            editor.chain().focus().toggleStrike().run(),
          )}
          {toggle("Code", Code, active?.code, () =>
            editor.chain().focus().toggleCode().run(),
          )}
        </div>
        <div className="flex items-center pl-1">
          {(Object.keys(insertIcons) as InsertKind[]).map((kind) => {
            const Icon = insertIcons[kind];
            return (
              <IconButton
                key={kind}
                label={kind}
                className="size-11 aria-expanded:bg-accent aria-expanded:text-accent-foreground"
                aria-expanded={insert === kind}
                onClick={() => openInsert(kind)}
              >
                <Icon aria-hidden="true" />
              </IconButton>
            );
          })}
        </div>
        {active?.codeBlock && (
          <select
            aria-label="Code language"
            className="min-h-11 rounded-lg border border-input bg-card px-2 text-sm focus-visible:outline focus-visible:outline-ring"
            value={active.language ?? ""}
            onChange={(event) =>
              editor
                .chain()
                .focus()
                .updateAttributes("codeBlock", {
                  language: event.target.value || null,
                })
                .run()
            }
          >
            <option value="">Plain text</option>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            {active.language &&
              !["cpp", "javascript", "python", "sql"].includes(
                active.language,
              ) && <option value={active.language}>{active.language}</option>}
          </select>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {insert && (
          <form
            onSubmit={submitInsert}
            className="space-y-3 border-b border-border p-4"
          >
            <Label htmlFor="responsi-insert-option">
              {isUrl ? `${insert} URL` : `${insert} (LaTeX)`}
            </Label>
            <Input
              ref={insertInput}
              id="responsi-insert-option"
              value={field}
              onChange={(event) => {
                setField(event.target.value);
                setError("");
              }}
              required
              maxLength={2048}
            />
            {(insert === "Image" ||
              (insert === "Link" &&
                editor.state.selection.empty &&
                !active?.link)) && (
              <>
                <Label htmlFor="responsi-insert-label">
                  {insert === "Image" ? "Alt text" : "Link text (optional)"}
                </Label>
                <Input
                  id="responsi-insert-label"
                  name="label"
                  required={insert === "Image"}
                />
              </>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" className="min-h-11">
                Apply {insert.toLowerCase()}
              </Button>
              {insert === "Link" && active?.link && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                    setInsert(null);
                  }}
                >
                  Remove link
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => {
                  setInsert(null);
                  editor.commands.focus();
                }}
              >
                Cancel insert
              </Button>
            </div>
          </form>
        )}
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
