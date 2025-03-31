import { Dispatch, SetStateAction, ChangeEvent } from 'react';

// Core types
export type BusinessType = 'restaurant' | 'logistics' | 'professional';

// Form data structure
export interface FormData {
  businessType: BusinessType | '';
  address: string;
  phone: string;
  email: string;
  businessName?: string;
  imageInstructions?: string;
  filePath?: string;
  colorScheme?: string;
  [key: `question${number}`]: string;
}

// Question and template types
export type QuestionType = 'text' | 'boolean' | 'color';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  placeholder?: string;
}

export interface Template {
  name: string;
  questions: Question[];
}

// Component props interfaces
export interface BaseStepProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: () => void;
  error: string;
}

export interface StepWithBackProps extends BaseStepProps {
  handleBack: () => void;
  setFormData: (data: Partial<FormData>) => void;
}

// Preview related types
export interface WebsitePreviewProps {
  isLoading: boolean;
  isReady: boolean;
  generatedHtml: string;
  error: string;
  formData: FormData;
}

export interface PreviewProps {
  htmlContent: string;
  width?: string | number;
  height?: string | number;
  sandboxOptions?: string;
}

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
  primary: string;
  description: string;
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
}

export interface ImageRequirement {
  description: string;
  subject: 'food' | 'interior' | 'exterior' | 'people' | 'product' | 'logo' | 'general';
  style: 'real' | 'artistic';
  width: number;
  height: number;
}

export interface OptimizedImagePrompt {
  description: string;
  style: 'real' | 'artistic';
  width: number;
  height: number;
}

export type TemplateImageRequirements = {
  [K in BusinessType]: ImageRequirement[];
};

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
  isReady: boolean;
  generatedHtml: string;
  error: string;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  allQuestionsAnswered: boolean;
  setAllQuestionsAnswered: Dispatch<SetStateAction<boolean>>;
  checkAllQuestionsAnswered: () => boolean;
  generateWebsite: () => Promise<void>;
  setError: Dispatch<SetStateAction<string>>;
}

// API response types
export interface GeneratePageResponse {
  htmlContent: string;
  filePath: string;
  imageUrls: string[];
}

// Constants
export const defaultFormData: FormData = {
  businessType: '',
  address: '',
  phone: '',
  email: ''
};

export const defaultColors: Record<BusinessType, string> = {
  restaurant: '#8D5524',
  logistics: '#1C3D5A',
  professional: '#2E5984'
};