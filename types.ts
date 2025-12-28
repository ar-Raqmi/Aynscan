export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface DocImage {
  id: string;
  file: File;
  previewUrl: string;
  status: ProcessingStatus;
  extractedText: string | null;
  errorMessage?: string;
}

export interface ProcessingStats {
  total: number;
  completed: number;
  pending: number;
  processing: number;
  failed: number;
}
