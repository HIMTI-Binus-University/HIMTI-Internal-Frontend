import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResourceFormDialog } from "./resource-form-dialog";
import { SoftwareFormDialog } from "./software-form-dialog";

describe("HimtiKit Form Dialogs - Download Link Validation", () => {
  afterEach(cleanup);

  describe("ResourceFormDialog", () => {
    it("displays error properly below the download link input field when link is invalid or empty", async () => {
      const handleSubmit = vi.fn();
      render(
        <ResourceFormDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={handleSubmit}
        />
      );

      const titleInput = screen.getByLabelText(/Title/i);
      const urlInput = screen.getByLabelText(/Resource \/ Download Link URL/i);

      fireEvent.change(titleInput, { target: { value: "Algorithms Summary" } });

      // 1. Submit while download URL is empty
      fireEvent.click(screen.getByRole("button", { name: /Create Material/i }));
      expect(handleSubmit).not.toHaveBeenCalled();

      const errorMsg = screen.getByRole("alert");
      expect(errorMsg).toHaveTextContent("Download link is required.");
      expect(urlInput).toHaveAttribute("aria-invalid", "true");
      expect(urlInput).toHaveAttribute("aria-describedby", "resource-url-error");

      // 2. Type an invalid URL missing protocol
      fireEvent.change(urlInput, { target: { value: "drive.google.com/file/123" } });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Download link must start with http:// or https://"
      );

      // 3. Fix to a valid HTTPS URL
      fireEvent.change(urlInput, {
        target: { value: "https://drive.google.com/file/123" },
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(urlInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("SoftwareFormDialog", () => {
    it("displays error properly below the download link input field when link is invalid or empty", async () => {
      const handleSubmit = vi.fn();
      render(
        <SoftwareFormDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={handleSubmit}
        />
      );

      const nameInput = screen.getByLabelText(/Software Name/i);
      const urlInput = screen.getByLabelText(/Official Website \/ Download URL/i);
      const descInput = screen.getByLabelText(/Description/i);

      fireEvent.change(nameInput, { target: { value: "VS Code" } });
      fireEvent.change(descInput, { target: { value: "Code editor" } });

      // 1. Submit while download URL is empty
      fireEvent.click(screen.getByRole("button", { name: /Create Software/i }));
      expect(handleSubmit).not.toHaveBeenCalled();

      const errorMsg = screen.getByRole("alert");
      expect(errorMsg).toHaveTextContent("Download or website URL is required.");
      expect(urlInput).toHaveAttribute("aria-invalid", "true");
      expect(urlInput).toHaveAttribute("aria-describedby", "software-url-error");

      // 2. Type an invalid URL missing protocol
      fireEvent.change(urlInput, { target: { value: "code.visualstudio.com" } });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Download URL must start with http:// or https://"
      );

      // 3. Fix to a valid HTTPS URL
      fireEvent.change(urlInput, {
        target: { value: "https://code.visualstudio.com" },
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(urlInput).toHaveAttribute("aria-invalid", "false");
    });
  });
});
