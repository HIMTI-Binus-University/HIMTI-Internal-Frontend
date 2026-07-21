import type { RbacUser } from "@/types/rbac";

const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export const usersCsv = (users: RbacUser[]) => [
  ["ID", "Name", "Email", "Outlook email", "Phone", "NIM", "University", "Study program", "Status", "Roles", "Registered"],
  ...users.map((user) => [user.id, user.name, user.email, user.outlookEmail, user.phoneNumber, user.nim, user.university?.name, user.studyProgram?.name, user.status, user.roles?.map((role) => role.roleName).join("; "), user.createdAt]),
].map((row) => row.map(cell).join(",")).join("\n");
