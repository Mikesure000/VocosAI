export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
}

export interface Team {
  id: string;
  teamName: string;
  ownerUserId: string;
  planType: string;
  monthlyQuota: number;
  usedQuota: number;
  status: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  status: string;
  user?: User;
}
