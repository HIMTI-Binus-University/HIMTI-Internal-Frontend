import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import materialsCsv from "../__fixtures__/learning_materials.csv?raw";
import softwareCsv from "../__fixtures__/software.csv?raw";
import { ResourceFormDialog } from "./resource-form-dialog";
import { ResourceImportDialog } from "./resource-import-dialog";
import { SoftwareImportDialog } from "./software-import-dialog";

vi.mock("@/components/notification", () => ({
  backendMessage: (_err: unknown, fallback: string) => fallback,
}));

afterEach(cleanup);

const paste = (text: string) =>
  fireEvent.change(screen.getByLabelText(/Or Paste CSV Data Directly/i), { target: { value: text } });

describe("ResourceImportDialog", () => {
  it("imports all 23 materials from learning_materials.csv with their majors", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResourceImportDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} existingTitles={[]} />);

    paste(materialsCsv);
    expect(screen.getByText("23 of 23 valid")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Import 23 Materials" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const rows = onSubmit.mock.calls[0][0];
    expect(rows).toHaveLength(23);
    expect(rows[0].majors).toHaveLength(10);
    expect(rows.find((r: { title: string }) => r.title === "Computer Security Fundamental").majors).toEqual([
      "Cyber Security",
    ]);
  });

  it("flags bad rows, lets them be fixed, and skips the rest", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ResourceImportDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} existingTitles={["Calculus"]} />
    );

    paste(
      [
        "Title,Description,Resource Link,Image Link,Majors",
        "Calculus,x,https://drive.google.com/a,,Computer Science",
        "Physics,x,https://drive.google.com/b,,Physics",
        "Statistics,x,not-a-link,,Data Science",
      ].join("\n")
    );

    expect(screen.getByText("Already exists, will be skipped")).toBeInTheDocument();
    expect(screen.getByText("Unknown major: Physics")).toBeInTheDocument();
    expect(screen.getByText("Must be a valid http(s) link")).toBeInTheDocument();
    expect(screen.getByText("0 of 3 valid")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Row 2 Majors (; separated)"), { target: { value: "Cyber Security" } });
    fireEvent.click(screen.getByRole("button", { name: "Import 1 Materials" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual([
      expect.objectContaining({ title: "Physics", majors: ["Cyber Security"] }),
    ]);
  });
});

describe("SoftwareImportDialog", () => {
  it("imports software.csv, mapping Title to name", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SoftwareImportDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} existingNames={[]} />);

    paste(softwareCsv);
    fireEvent.click(screen.getByRole("button", { name: "Import 1 Software" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual([
      expect.objectContaining({ name: "Software Guidebook", logoUrl: expect.stringMatching(/SOFTWARE%20LIST/) }),
    ]);
  });
});

describe("ResourceFormDialog majors checklist", () => {
  it("submits several majors and supports select all", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResourceFormDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Calculus" } });
    fireEvent.change(screen.getByLabelText(/Resource \/ Download Link URL/i), {
      target: { value: "https://drive.google.com/calc" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Data Science" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Computer Science" }));
    fireEvent.click(screen.getByRole("button", { name: /Create Material/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].majors).toEqual(["Computer Science", "Data Science"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all jurusan" }));
    expect(screen.getByText("10 of 10 selected")).toBeInTheDocument();
  });

  it("loads every major of the material being edited", () => {
    render(
      <ResourceFormDialog
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        initialData={{
          id: "r1",
          title: "Calculus",
          resourceUrl: "https://drive.google.com/calc",
          majors: ["Data Science", "Digital Psychology"],
        }}
      />
    );
    expect(screen.getByRole("checkbox", { name: "Data Science" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Digital Psychology" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Computer Science" })).not.toBeChecked();
    expect(screen.getByText("2 of 10 selected")).toBeInTheDocument();
  });
});
