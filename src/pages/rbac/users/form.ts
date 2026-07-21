import type {
  InstitutionType,
  MemberType,
  RbacUserDetail,
  UpdateUserPayload,
  UserStatus,
} from "@/types/rbac";

export interface UserFormState {
  name: string;
  email: string;
  outlookEmail: string;
  image: string;
  status: UserStatus;
  memberType: MemberType | "";
  institutionType: InstitutionType | "";
  universityId: string;
  universityName: string;
  studyProgramId: string;
  studyProgramName: string;
  regionId: string;
  nim: string;
  graduateBatch: string;
  department: string;
  affiliation: string;
  phoneNumber: string;
  lineId: string;
}

export const buildUserUpdate = (
  form: UserFormState,
  user: RbacUserDetail,
): UpdateUserPayload => {
  const isBinus = form.institutionType === "BINUS";
  const isStudent = form.memberType === "STUDENT";
  const candidate: UpdateUserPayload = {
    name: form.name,
    email: form.email,
    image: nullable(form.image),
    status: form.status,
    memberType: form.memberType || null,
    institutionType: form.institutionType || null,
    phoneNumber: nullable(form.phoneNumber),
    lineId: nullable(form.lineId),
    universityId: isBinus ? nullable(form.universityId) : null,
    universityName: isBinus ? null : nullable(form.universityName),
    regionId: isBinus ? nullable(form.regionId) : null,
    outlookEmail: isBinus ? nullable(form.outlookEmail) : null,
    nim: isStudent ? nullable(form.nim) : null,
    studyProgramId:
      isBinus && isStudent ? nullable(form.studyProgramId) : null,
    studyProgramName:
      !isBinus && isStudent ? nullable(form.studyProgramName) : null,
    graduateBatch:
      isBinus && isStudent ? nullable(form.graduateBatch) : null,
    department:
      form.memberType === "LECTURER" ? nullable(form.department) : null,
    affiliation:
      form.memberType === "OTHER" ? nullable(form.affiliation) : null,
  };

  return Object.fromEntries(
    Object.entries(candidate).filter(
      ([key, value]) => value !== user[key as keyof RbacUserDetail],
    ),
  ) as UpdateUserPayload;
};

const nullable = (value: string) => value.trim() || null;
