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
