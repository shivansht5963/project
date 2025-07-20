export interface ScanResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  imageUri?: string;
}

export interface ScannerState {
  isLoading: boolean;
  error: string | null;
  progress: number;
  result: ScanResult | null;
}

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
  progress: number;
}

export interface ScannerProps {
  onScanComplete?: (result: ScanResult) => void;
  onError?: (error: string) => void;
  maxImageSize?: number;
  compressionQuality?: number;
}

export interface ApiResponse {
  success: boolean;
  data?: {
    text: string;
    confidence: number;
  };
  error?: string;
}