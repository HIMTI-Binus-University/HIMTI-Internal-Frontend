import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { RegistrationDetail } from "@/api/event-registrations/queries";
import { Answers } from "./registration-review";

const registration = {
  answersVisible: true,
  sections: [
    {
      id: "section-1",
      title: "Profile",
      orderIndex: 0,
      answers: [
        {
          question: { id: "q1", label: "Motivation", fieldType: "TEXTAREA" },
          answer: {
            questionId: "q1",
            type: "TEXTAREA",
            value: "Learn and contribute",
          },
        },
        {
          question: { id: "q2", label: "Tracks", fieldType: "CHECKBOX" },
          answer: {
            questionId: "q2",
            type: "CHECKBOX",
            value: ["Web", "Data"],
          },
        },
        {
          question: { id: "q3", label: "Attachment", fieldType: "FILE" },
          answer: {
            questionId: "q3",
            type: "FILE",
            value: null,
            fileAvailable: true,
          },
        },
      ],
    },
  ],
} as RegistrationDetail;

describe("registration answers", () => {
  it("renders supported answers but never exposes a file URL or key", () => {
    render(<Answers registration={registration} />);
    expect(screen.getByText("Learn and contribute")).toBeInTheDocument();
    expect(screen.getByText("Web")).toBeInTheDocument();
    expect(screen.getByText(/preview unavailable/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /attachment/i }),
    ).not.toBeInTheDocument();
  });

  it("explains answer permission without rendering sections", () => {
    render(
      <Answers registration={{ ...registration, answersVisible: false }} />,
    );
    expect(screen.getByText("Answers are restricted")).toBeInTheDocument();
    expect(screen.getByText(/view_event_answers/)).toBeInTheDocument();
    expect(screen.queryByText("Learn and contribute")).not.toBeInTheDocument();
  });
});
