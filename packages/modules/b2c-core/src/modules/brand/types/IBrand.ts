export interface IBrand {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  logo: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
