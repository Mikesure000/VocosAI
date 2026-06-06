export interface Report {
  id: string;
  taskId: string;
  reportType: string;
  reportTitle: string;
  reportJson: string;
  markdownContent?: string;
  version: number;
  status: string;
  createdAt: string;
}

export interface ShareLink {
  id: string;
  reportId: string;
  shareToken: string;
  permission: string;
  expiresAt?: string;
  viewCount: number;
}
