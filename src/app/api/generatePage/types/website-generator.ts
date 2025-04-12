export interface CacheEntry {
  lastRequest: string;
  lastResult: string;
  timestamp: number;
}

export interface FormData {
  businessType: string;
  address: string;
  phone: string;
  email: string;
  imageUrls?: string[];
  [key: string]: unknown;
}

export interface LayoutVariation {
  layoutStructure: string;
  visualStyle: string;
  interactiveElements: string;
  colorScheme: string;
  specialtySection: string;
  structuralElement: string;
  iconSet: string;
  restaurantSpecifics: string;
  logisticsSpecifics: string;
  professionalSpecifics: string;
}
