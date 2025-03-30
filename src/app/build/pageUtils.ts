import { 
  FormData,
  BusinessType,
  Template,
  Question,
  ValidationResult,
  FormProgress 
} from '@/types/formData';

// Define template structure with proper typing
export const templates: Record<BusinessType, Template> = {
  restaurant: {
    name: "Restaurant/Food/Catering",
    questions: [
      // ...restaurant questions...
    ]
  },
  logistics: {
    name: "Logistics/Transportation/Supply Chain",
    questions: [
      // ...logistics questions...
    ]
  },
  professional: {
    name: "Professional Services",
    questions: [
      // ...professional questions...
    ]
  }
};

// Type guard for business type validation
const isValidBusinessType = (type: string): type is BusinessType => {
  return ['restaurant', 'logistics', 'professional'].includes(type);
};

export const getQuestions = (businessType: string): Question[] => {
  if (!businessType) return [];
  
  const type = businessType.toLowerCase();
  if (!isValidBusinessType(type)) return [];
  
  const template = templates[type];
  return template?.questions || [];
};

export const validateBasicInfo = (formData: FormData): ValidationResult => {
  const isValid = !!(
    formData.businessType &&
    isValidBusinessType(formData.businessType) &&
    formData.address &&
    formData.phone &&
    formData.email
  );

  return {
    isValid,
    error: isValid ? '' : 'Please fill out all required fields'
  };
};

export const validateQuestions = (
  formData: FormData, 
  businessType: BusinessType, 
  startIndex: number, 
  endIndex: number
): ValidationResult => {
  const questions = getQuestions(businessType);
  
  for (let i = startIndex; i < endIndex; i++) {
    const fieldName = `question${i + 1}` as keyof FormData;
    const answer = formData[fieldName];
    
    if (i < questions.length && (!answer || answer.trim() === '')) {
      return {
        isValid: false,
        error: 'Please answer all questions before proceeding'
      };
    }
  }
  
  return { isValid: true, error: '' };
};

export const validateImageInstructions = (instructions: string): string => {
  if (!instructions || instructions.trim() === '') {
    return 'Please describe your image requirements or enter "none" if you don\'t need images';
  }
  return '';
};

export const calculateProgress = (formData: FormData, businessType: string): FormProgress => {
  const questions = getQuestions(businessType);
  const totalQuestions = questions.length;
  
  const answeredQuestions = Object.keys(formData)
    .filter(key => key.startsWith('question') && String(formData[key as keyof FormData]).trim() !== '')
    .length;
  
  return {
    answeredQuestions,
    totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  };
};