import { describe, expect, it } from "vitest";
import { Api } from "@/constants/api";
import {
  transformBackendAttendee,
  transformBackendResource,
  transformBackendSoftware,
  transformResourceCreatePayload,
  transformResourceUpdatePayload,
  transformSoftwareCreatePayload,
  transformSoftwareUpdatePayload,
} from "./queries";
import { BACKEND_ENUM_TO_MAJOR, MAJOR_TO_BACKEND_ENUM } from "@/types/himti-kit";

describe("HIMTI-KIT API Constants", () => {
  it("uses the correct backend routes without /v1/admin prefix", () => {
    expect(Api.himtiKitResources).toMatch(/\/api\/himti-kit\/resources$/);
    expect(Api.himtiKitResource).toMatch(/\/api\/himti-kit\/resources\/:id$/);
    expect(Api.himtiKitSoftwares).toMatch(/\/api\/himti-kit\/software$/);
    expect(Api.himtiKitSoftware).toMatch(/\/api\/himti-kit\/software\/:id$/);
    expect(Api.himtiKitAttendees).toMatch(/\/api\/himti-kit\/attendees$/);
    expect(Api.himtiKitAttendeeBulk).toMatch(/\/api\/himti-kit\/attendees\/bulk-import$/);
    expect(Api.himtiKitAttendee).toMatch(/\/api\/himti-kit\/attendees\/:id$/);
    expect(Api.himtiKitAppearance).toMatch(/\/api\/himti-kit\/appearance$/);
  });
});

describe("HIMTI-KIT Major Enum Mappings", () => {
  it("maps all 10 BINUS IT majors bidirectionally", () => {
    const majors = [
      ["Computer Science", "COMPUTER_SCIENCE"],
      ["Mobile Application and Technology", "MOBILE_APPLICATION_AND_TECHNOLOGY"],
      ["Game Application and Technology", "GAME_APPLICATION_AND_TECHNOLOGY"],
      ["Data Science", "DATA_SCIENCE"],
      ["Cyber Security", "CYBER_SECURITY"],
      ["Computer Science & Mathematics", "COMPUTER_SCIENCE_AND_MATHEMATICS"],
      ["Computer Science & Statistics", "COMPUTER_SCIENCE_AND_STATISTIC"],
      ["Computer Science - Software Engineering", "COMPUTER_SCIENCE_SOFTWARE_ENGINEERING"],
      ["Artificial Intelligence", "ARTIFICIAL_INTELLIGENCE"],
      ["Digital Psychology", "DIGITAL_PSYCHOLOGY"],
    ];

    for (const [uiLabel, backendEnum] of majors) {
      expect(MAJOR_TO_BACKEND_ENUM[uiLabel]).toBe(backendEnum);
      expect(BACKEND_ENUM_TO_MAJOR[backendEnum]).toBe(uiLabel);
    }
  });
});

describe("HIMTI-KIT Data Transformers", () => {
  describe("Resources", () => {
    it("transforms backend resource to frontend model", () => {
      const backendRow = {
        id: "res-101",
        title: "Algorithms Guide",
        description: "Study material",
        downloadUrl: "https://drive.google.com/test",
        coverImageUrl: "https://images.com/cover.jpg",
        major: "COMPUTER_SCIENCE",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-02T00:00:00Z",
      };

      const transformed = transformBackendResource(backendRow);
      expect(transformed).toEqual({
        id: "res-101",
        title: "Algorithms Guide",
        description: "Study material",
        major: "Computer Science",
        downloadUrl: "https://drive.google.com/test",
        resourceUrl: "https://drive.google.com/test",
        coverImageUrl: "https://images.com/cover.jpg",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-02T00:00:00Z",
      });
    });

    it("transforms frontend create payload to backend schema", () => {
      const input = {
        title: "Data Science 101",
        description: "Intro notes",
        major: "Data Science",
        resourceUrl: "https://drive.google.com/ds101",
        coverImageUrl: "https://images.com/cover.jpg",
      };

      const payload = transformResourceCreatePayload(input);
      expect(payload).toEqual({
        title: "Data Science 101",
        description: "Intro notes",
        major: "DATA_SCIENCE",
        downloadUrl: "https://drive.google.com/ds101",
        coverImageUrl: "https://images.com/cover.jpg",
      });
    });

    it("transforms frontend update payload to backend schema", () => {
      const update = {
        major: "Cyber Security",
        resourceUrl: "https://drive.google.com/updated",
      };

      const payload = transformResourceUpdatePayload(update);
      expect(payload).toEqual({
        major: "CYBER_SECURITY",
        downloadUrl: "https://drive.google.com/updated",
      });
    });
  });

  describe("Software", () => {
    it("transforms backend software to frontend model", () => {
      const backendRow = {
        id: "soft-101",
        name: "VS Code",
        description: "Code editor",
        downloadUrl: "https://code.visualstudio.com",
        coverImageUrl: "https://icons.com/vscode.png",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-02T00:00:00Z",
      };

      const transformed = transformBackendSoftware(backendRow);
      expect(transformed).toEqual({
        id: "soft-101",
        name: "VS Code",
        description: "Code editor",
        downloadUrl: "https://code.visualstudio.com",
        logoUrl: "https://icons.com/vscode.png",
        coverImageUrl: "https://icons.com/vscode.png",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-02T00:00:00Z",
      });
    });

    it("transforms frontend create payload to backend software schema", () => {
      const input = {
        name: "Docker Desktop",
        description: "Containerization engine",
        downloadUrl: "https://docker.com",
        logoUrl: "https://icons.com/docker.png",
      };

      const payload = transformSoftwareCreatePayload(input);
      expect(payload).toEqual({
        name: "Docker Desktop",
        description: "Containerization engine",
        downloadUrl: "https://docker.com",
        coverImageUrl: "https://icons.com/docker.png",
      });
    });

    it("transforms frontend update payload to backend software schema", () => {
      const update = {
        name: "Docker Desktop v2",
        logoUrl: "https://icons.com/docker-new.png",
      };

      const payload = transformSoftwareUpdatePayload(update);
      expect(payload).toEqual({
        name: "Docker Desktop v2",
        coverImageUrl: "https://icons.com/docker-new.png",
      });
    });
  });

  describe("Attendees", () => {
    it("transforms backend attendee to frontend attendee model", () => {
      const backendRow = {
        id: "att-101",
        name: "John Doe",
        nim: "2602111111",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-02T00:00:00Z",
      };

      const transformed = transformBackendAttendee(backendRow);
      expect(transformed).toEqual({
        id: "att-101",
        name: "John Doe",
        nim: "2602111111",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-02T00:00:00Z",
      });
    });
  });
});
