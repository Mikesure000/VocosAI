export interface Project {
  id: string;
  teamId: string;
  projectName: string;
  brandName?: string;
  productName?: string;
  industry?: string;
  description?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  taskCount?: number;
}

export interface ProjectCreateInput {
  teamId: string;
  projectName: string;
  brandName?: string;
  productName?: string;
  industry?: string;
  description?: string;
}
