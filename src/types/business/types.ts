// This file contains the types for business-related data structures.
// It includes types for business templates, template styles, and form data structures.
export type BusinessType = 'restaurant' | 'logistics' | 'professional' | 'custom';

// Define TemplateStyle here to avoid circular imports
export interface TemplateStyle {
  layout: string;
  components: string[];
  animations: string[];
  navigation: string;
}

export interface BusinessTemplate {
  baseStyle: TemplateStyle;
  variants: {
    [key: string]: Partial<TemplateStyle>;
  };
  style?: TemplateStyle; // Optional style property
  variant?: string; // Optional variant property
}

export type BusinessTemplates = Record<BusinessType, BusinessTemplate>;