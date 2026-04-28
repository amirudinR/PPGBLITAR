import { Role } from './user';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRoles: Role[];
  createdAt: any; // Firestore Timestamp
}
