export interface AnalysisTask {
  id: string;
  teamId: string;
  projectId: string;
  taskName: string;
  platform: string;
  contentUrl?: string;
  contentTitle?: string;
  contentBody?: string;
  contentGoal?: string;
  contentData?: string;
  brandInfo?: string;
  productInfo?: string;
  competitorInfo?: string;
  outputOptions?: string;
  status: string;
  progress?: string;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskCreateInput {
  teamId: string;
  projectId: string;
  taskName: string;
  platform: string;
  contentUrl?: string;
  contentTitle?: string;
  contentBody?: string;
  contentGoal?: string;
  contentData?: string;
  brandInfo?: string;
  productInfo?: string;
  competitorInfo?: string;
  outputOptions?: string[];
}

export interface TaskProgress {
  currentStep: number;
  totalSteps: number;
  steps: {
    code: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  }[];
}

export interface Comment {
  id: string;
  taskId: string;
  commentText: string;
  normalizedText?: string;
  likeCount: number;
  cleanStatus: string;
  valueScore: number;
  sentimentLabel?: string;
  intentLabel?: string;
  signalLabels?: string;
}
