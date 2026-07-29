export interface UserMeResponse {
  msg: string;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  outlookEmail: string | null;
  outlookEmailVerified: boolean;
  image: string | null;
  status: string;
  memberType: "STUDENT" | "LECTURER" | "OTHER" | null;
  institutionType: "BINUS" | "NON_BINUS" | null;
  universityName: string | null;
  studyProgramName: string | null;
  department: string | null;
  affiliation: string | null;
  nim: string | null;
  universityId: string | null;
  studyProgramId: string | null;
  regionId: string | null;
  graduateBatch: string | null;
  phoneNumber: string | null;
  lineId: string | null;
  university: UserMeRelation | null;
  studyProgram: UserMeRelation | null;
  region: UserMeRelation | null;
  registrationCompleted: boolean;
  registrationCompletedAt: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  roles: string[];
  permissions: string[];
}

interface UserMeRelation {
  id: string;
  name: string;
  shortName: string | null;
}
