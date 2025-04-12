import { BusinessType, TemplateStyle } from './types';
import { DefaultTemplateStyle } from '../formData';
import { businessTemplates } from './templates';

export function determineTemplateStyle(
  businessType: BusinessType
): { style: TemplateStyle; variant: string } {
  const template = businessTemplates[businessType];

  // Return a default or computed value
  return {
    style: template?.baseStyle || DefaultTemplateStyle, // Use baseStyle for fallback
    variant: template?.variant ?? 'defaultVariant', // Replace 'defaultVariant' with an appropriate default
  };
}

export function getBusinessRequirements(businessType: BusinessType) {
  // Add business-specific requirements logic here
  return businessTemplates[businessType];
}