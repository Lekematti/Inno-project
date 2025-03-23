//This is a utility file that contains helper functions
import { templates } from '@/functions/inputGenerate';

type TemplateType = 'restaurant' | 'logistics' | 'professional';

export const getQuestions = (businessType: string) => {
  if (!businessType) return [];
  
  const type = businessType.toLowerCase();
  // Validate the type is one of the allowed template types
  if (type !== 'restaurant' && type !== 'logistics' && type !== 'professional') {
    return [];
  }
  
  const template = templates[type as TemplateType];
  return template?.questions || [];
};