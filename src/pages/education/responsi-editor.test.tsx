import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ResponsiEditor from "./responsi-editor";

it("renders stored Markdown with code highlighting, math, tables and safe images", async () => {
  const onChange = vi.fn();
  render(
    <ResponsiEditor
      readOnly
      onChange={onChange}
      value={
        "## Notes\n\n- First\n- Second\n\n$x^2$\n\n```python\nreturn 2\n```\n\n" +
        "| Topic |\n| --- |\n| Functions |\n\n" +
        "![Diagram](https://example.org/diagram.png)\n\n![Unsafe](http://example.org/unsafe.png)"
      }
    />,
  );
  const doc = await screen.findByRole("document", { name: "Summary preview" });
  expect(
    within(doc).getByRole("heading", { name: "Notes", level: 2 }),
  ).toBeInTheDocument();
  expect(within(doc).getAllByRole("listitem")).toHaveLength(2);
  expect(within(doc).getByRole("table")).toHaveTextContent("Functions");
  expect(doc.querySelector(".katex")).not.toBeNull();
  expect(doc.querySelector(".hljs-keyword")).toHaveTextContent("return");
  expect(within(doc).getByRole("img", { name: "Diagram" })).toHaveAttribute(
    "src",
    "https://example.org/diagram.png",
  );
  expect(within(doc).getByRole("img", { name: "Unsafe" })).not.toHaveAttribute(
    "src",
  );
  expect(onChange).not.toHaveBeenCalled();
});

it("inserts formatted math and rejects non-HTTPS links", async () => {
  const onChange = vi.fn();
  render(<ResponsiEditor value="" onChange={onChange} />);
  fireEvent.click(await screen.findByRole("button", { name: "Inline math" }));
  fireEvent.change(screen.getByLabelText("Inline math (LaTeX)"), {
    target: { value: "x^2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply inline math" }));
  expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining("$x^2$"));

  fireEvent.click(screen.getByRole("button", { name: "Link" }));
  fireEvent.change(screen.getByLabelText("Link URL"), {
    target: { value: "http://example.org" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply link" }));
  expect(screen.getByRole("alert")).toHaveTextContent("HTTPS");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("exposes icon-only formatting controls with labels and pressed states", async () => {
  render(<ResponsiEditor value="" />);
  const bold = await screen.findByRole("button", { name: "Bold" });
  expect(bold).toHaveTextContent(/^$/);
  expect(bold).toHaveAttribute("title", "Bold");
  expect(bold).toHaveAttribute("aria-pressed", "false");
  expect(bold.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  fireEvent.click(bold);
  expect(bold).toHaveAttribute("aria-pressed", "true");
});

it("undoes and redoes edits while continuing to emit Markdown", async () => {
  const onChange = vi.fn();
  render(<ResponsiEditor value="" onChange={onChange} />);
  const editor = await screen.findByRole("textbox", {
    name: "Summary content",
  });
  const undo = screen.getByRole("button", { name: "Undo" });
  const redo = screen.getByRole("button", { name: "Redo" });
  expect(undo).toBeDisabled();
  expect(redo).toBeDisabled();

  fireEvent.paste(editor, {
    clipboardData: {
      getData: (type: string) =>
        type === "text/html" ? "<p><strong>History check</strong></p>" : "",
    },
  });
  expect(undo).toBeEnabled();
  expect(onChange).toHaveBeenLastCalledWith("**History check**");

  fireEvent.click(undo);
  expect(editor).not.toHaveTextContent("History check");
  expect(redo).toBeEnabled();

  fireEvent.click(redo);
  expect(editor).toHaveTextContent("History check");
  expect(onChange).toHaveBeenLastCalledWith("**History check**");
});

it("opens the heading menu from the keyboard and applies the selected level", async () => {
  render(<ResponsiEditor value="Section to format" />);
  const trigger = await screen.findByRole("button", { name: "Text style" });
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.click(
    await screen.findByRole("menuitemradio", { name: "Heading 2" }),
  );
  expect(
    screen.getByRole("heading", { level: 2, name: "Section to format" }),
  ).toBeInTheDocument();
});
