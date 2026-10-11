export interface QuestionItem {
  id: string;
  questionNumber: string;
  originalText: string;
  questionType?: string;
  options?: string[];
  finalAnswer: string;
  steps?: string[];
  explanation?: string;
  notesOrTips?: string;
  isUserEdited?: boolean;
}

export interface PageSolution {
  pageTitle: string;
  detectedSubject: string;
  hasHandwriting: boolean;
  handwrittenTranscription: string;
  pageSummary: string;
  questions: QuestionItem[];
  additionalNotes?: string;
}

export interface BookPage {
  id: string;
  pageNumber: number;
  originalFilename?: string;
  imageDataUrl: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  solution?: PageSolution;
  timestamp?: number;
}

export type SolverMode = 'full-solve' | 'ocr-handwriting' | 'verify-only';
export type SubjectType = 'general' | 'math_science' | 'languages' | 'humanities';
export type SolutionDepth = 'detailed' | 'concise' | 'with-explanations';

export type TaskType = 'solving' | 'export-pdf' | 'export-docx' | 'export-txt';

export interface BackgroundTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  progress: number; // 0 to 100
  currentStep?: number;
  totalSteps?: number;
  status: 'running' | 'paused' | 'completed' | 'error';
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}
