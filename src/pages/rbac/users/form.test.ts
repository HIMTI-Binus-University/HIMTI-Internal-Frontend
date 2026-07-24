import { expect, it } from "vitest";

import type { RbacUserDetail } from "@/types/rbac";
import { buildUserUpdate, type UserFormState } from "./form";

it("keeps only the canonical fields for a changed membership path", () => {
  const user = {
    name: "Member",
    email: "member@example.com",
    image: null,
    status: "ACTIVE",
    memberType: "STUDENT",
    institutionType: "BINUS",
    phoneNumber: "0812",
    lineId: null,
    universityId: "binus",
    universityName: null,
    regionId: "jakarta",
    outlookEmail: "member@binus.ac.id",
    nim: "2600000000",
    studyProgramId: "cs",
    studyProgramName: null,
    graduateBatch: "2026",
    department: null,
    affiliation: null,
    emailVerified: true,
    outlookEmailVerified: true,
  } as RbacUserDetail;
  const form: UserFormState = {
    name: user.name,
    email: user.email,
    image: "",
    status: user.status,
    memberType: "LECTURER",
    institutionType: "NON_BINUS",
    phoneNumber: "0812",
    lineId: "",
    universityId: "binus",
    universityName: "Example University",
    regionId: "jakarta",
    outlookEmail: "member@binus.ac.id",
    nim: "2600000000",
    studyProgramId: "cs",
    studyProgramName: "",
    graduateBatch: "2026",
    department: "Computing",
    affiliation: "",
  };

  expect(buildUserUpdate(form, user)).toMatchObject({
    memberType: "LECTURER",
    institutionType: "NON_BINUS",
    universityId: null,
    universityName: "Example University",
    regionId: null,
    outlookEmail: null,
    nim: null,
    studyProgramId: null,
    graduateBatch: null,
    department: "Computing",
  });
  expect(buildUserUpdate(form, user)).not.toHaveProperty("emailVerified");
  expect(buildUserUpdate(form, user)).not.toHaveProperty(
    "outlookEmailVerified",
  );
});
