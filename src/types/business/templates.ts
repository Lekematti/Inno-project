import { BusinessTemplates } from './types';

export const businessTemplates: BusinessTemplates = {
  restaurant: {
    baseStyle: {
      layout: 'vertical-scroll',
      components: ['menu', 'gallery', 'reservations'],
      animations: ['fade-in', 'slide-up'],
      navigation: 'sticky-top'
    },
    variants: {
      fineDining: {
        layout: 'elegant',
        components: ['menu', 'gallery', 'reservations', 'chef-specials']
      }
    }
  },
  logistics: {
    baseStyle: {
      layout: 'grid',
      components: ['tracking', 'pricing', 'contact'],
      animations: ['zoom-in', 'fade-out'],
      navigation: 'side-bar'
    },
    variants: {
      courier: {
        layout: 'compact',
        components: ['tracking', 'pricing']
      }
    }
  },
  professional: {
    baseStyle: {
      layout: 'single-page',
      components: ['portfolio', 'testimonials', 'contact-form'],
      animations: ['fade-in', 'slide-left'],
      navigation: 'top-bar'
    },
    variants: {
      consulting: {
        layout: 'modern',
        components: ['portfolio', 'testimonials', 'contact-form', 'services']
      }
    }
  }
};

export const defaultColors = {
  restaurant: '#8D5524',
  logistics: '#1C3D5A',
  professional: '#2E5984'
} as const;