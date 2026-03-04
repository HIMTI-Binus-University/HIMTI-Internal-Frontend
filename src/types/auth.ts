export interface UserMeResponse {
  msg: string;
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  // ... tambahkan field lain jika perlu
}
