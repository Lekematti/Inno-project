import { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { BusinessType, TemplateStyle } from './business/types';
export type { BusinessType };

export type ImageSourceType = 'ai' | 'manual' | 'none';

// Form data structure
export interface FormData {
  businessType: BusinessType;
  address: string;
  phone: string;
  email: string;
  businessName?: string;
  imageInstructions?: string;
  uploadedImages?: File[];
  userImageUrls?: string[];
  generatedImageUrls?: string[];
  imageSource?: ImageSourceType;
  filePath?: string;
  colorScheme?: string;
  [key: `question${number}`]: string;
  templateStyle?: TemplateStyle;
  templateVariant?: string;
  standaloneHtml?: string;
}

// Use the imported TemplateStyle for DefaultTemplateStyle
export const DefaultTemplateStyle: TemplateStyle = {
  layout: 'standard',
  components: ['header', 'content', 'footer'],
  animations: ['fade'],
  navigation: 'simple-top'
};

// Question and template types
export type QuestionType = 'text' | 'boolean' | 'color';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  placeholder?: string;
};

export interface Template {
  name: string;
  questions: Question[];
};

// Component props interfaces
export interface BaseStepProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (data?: Partial<FormData>) => void;
  error: string;
};

export interface StepWithBackProps extends BaseStepProps {
  handleBack: () => void;
  setFormData: (data: Partial<FormData>) => void;
};

// Preview related types
export interface WebsitePreviewProps {
  isLoading: boolean;
  isReady: boolean;
  generatedHtml: string;
  error: string;
  formData: FormData;
};

export interface PreviewProps {
  htmlContent: string;
  width?: string | number;
  height?: string | number;
  sandboxOptions?: string;
  onError?: (error: string) => void;
};

// Color related types
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  lightShade: string;
  darkShade: string;
  analogous: [string, string];
}

export interface ColorPreset {
  name: string;
  colors: string[];
}

export interface ColorPickerProps {
  index: number;
  formData: FormData;
  setFormData: (updater: (prev: FormData) => FormData) => void;
}

// Image processing types
export interface ImageRequest {
  description: string;
  subject: string;
  style: string;
  width: number;
  height: number;
}

export interface OptimizedImagePrompt {
  description: string;
  style: 'real' | 'artistic';
  width: number;
  height: number;
}

// Form handling types
export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export interface FormProgress {
  answeredQuestions: number;
  totalQuestions: number;
  percentage: number;
}

export interface FormHandlerHook {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>; // Add this
  isReady: boolean;
  setIsReady: Dispatch<SetStateAction<boolean>>; // Add this
  generatedHtml: string;
  setGeneratedHtml: Dispatch<SetStateAction<string>>; // Add this
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  allQuestionsAnswered: boolean;
  setAllQuestionsAnswered: Dispatch<SetStateAction<boolean>>;
  checkAllQuestionsAnswered: () => boolean;
  generateWebsite: () => Promise<void>;
  clearSavedContent?: () => void; // Optional function to clear saved content
}

// API response types
export interface GeneratePageResponse {
  htmlContent: string;
  filePath: string;
  imageUrls: string[];
  isFallback?: boolean;
  status?: 'success' | 'limited' | 'error';
}

// API request types
export interface GeneratePageRequest {
  businessType: string;
  address: string;
  phone: string;
  email: string;
  imageSource: ImageSourceType;
  imageInstructions?: string;
  userUploads?: File[] | { url: string; name: string }[]; 
  [key: string]: unknown; 
}

// Constants
export const defaultFormData: FormData = {
  businessType: '',
  address: '',
  phone: '',
  email: '',
  imageSource: 'none'
};