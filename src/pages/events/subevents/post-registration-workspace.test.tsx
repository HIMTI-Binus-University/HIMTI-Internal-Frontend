import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PostRegistrationAssignment } from "@/api/post-registration/queries";
import { Answers } from "./post-registration-workspace";

describe("post-registration answers", () => {
  it("renders selected option labels instead of stored option IDs", () => {
    render(
      <Answers
        assignment={
          {
            response: {
              answers: [
                {
                  questionId: "transport",
                  type: "SELECT",
                  value: ["option-id"],
                  selectedOptions: [
                    { id: "option-id", value: "bus", label: "Bus" },
                  ],
                },
              ],
            },
            sections: [
              {
                id: "section",
                title: "Transportation",
                orderIndex: 0,
                questions: [
                  {
                    id: "transport",
                    label: "Vehicle",
                    orderIndex: 0,
                  },
                ],
              },
            ],
          } as PostRegistrationAssignment
        }
      />,
    );

    expect(screen.getByText("Bus")).toBeInTheDocument();
    expect(screen.queryByText("option-id")).not.toBeInTheDocument();
  });
});
