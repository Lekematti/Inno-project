# AI Website Builder

## Overview

AI Website Builder is a full-stack web application that allows users to instantly generate, customize, and edit modern, responsive websites for various business types using AI. The platform leverages OpenAI's GPT models to create production-ready HTML, Bootstrap-based designs, and even generates custom images (AI or manual upload) for your site. It supports editing, color palette customization, and accessibility best practices.

## Key Features

- **AI-Powered Website Generation**: Instantly create a complete, mobile-friendly website for your business (restaurant, logistics, professional services, or custom) by answering a guided form.
- **Business-Type Templates**: Each business type has tailored questions and design templates for relevant, high-converting layouts.
- **Simplicity In Customization**: Customize layouts, colors, and content with an intuitive interface.
- **AI & Manual Image Integration**: Generate images with AI based on your instructions, or upload your own. Images are automatically integrated into the generated site.
- **Preview & Editing**: Instantly preview your site. Use the visual editor to select and edit any element, with both direct and AI-assisted editing modes.
- **Color Palette Customization**: Choose or generate harmonious color schemes, with validation for accessibility and brand appropriateness.
- **SEO & Performance Optimized**: All sites include semantic HTML, meta tags, Open Graph/Twitter cards, and are optimized for speed and search engines.
- **Accessibility First**: Generated sites comply with WCAG standards for inclusivity.
- **Download & Share**: Download your site as a standalone HTML file or share it directly.
- **Authentication**: User authentication and profile management via NextAuth.
- **Version Control for Generated Sites**: Automatically saves generated sites in versioned folders for easy access and updates.

## How It Works

1. **Select Business Type**: Choose from Restaurant, Logistics or Professional Services.
2. **Answer Guided Questions**: Fill out a dynamic form tailored to your business type (name, services, specialties, etc.).
3. **Choose Image Source**: Select AI-generated images (describe what you want), upload your own, or opt for a text-only site.
4. **Customize Colors**: Pick a color scheme or let the AI suggest harmonious palettes.
5. **Generate Website**: The AI creates a complete, production-ready website with your content, images, and branding.
6. **Preview & Edit**: Instantly preview your site. Use the visual editor to select and edit any element (text, images, styles) directly or with AI help.
7. **Save & Download**: Save your generated site for future edits or download it as a standalone HTML package.

## How to Use

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- OpenAI API key (for AI generation)
- Azure BlobStorage API key
- Supabase / NextAuth

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Inno-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   - Copy `.example.env` to `.env` and add your API key:

     ```env
     OPENAI_API_KEY=your-key-here
     AZURE_STORAGE_ACCOUNT_KEY=your-key-here
     SUPABASE_SERVICE_ROLE_KEY=your-key-here
     ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the app**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Usage Flow

1. **Sign up or log in** (if authentication is enabled).
2. **Start a new website** by selecting your business type.
3. **Complete the guided form** (basic info, business-specific questions, image instructions, color scheme).
4. **Generate your website** and preview it live.
5. **Edit any element** visually—click to edit text, images, or styles, or use AI-powered suggestions.
6. **Download or share** your finished site.

### Advanced

- **Manual image uploads** are stored in `/public/uploads` and integrated into your generated site.
- **Generated sites** are saved in `/gen_comp/<business-type>-<timestamp>/` for easy access and versioning.
- **Edit mode** allows you to select any element in the preview and apply direct or AI-assisted changes.
- **API Endpoints**: Extend functionality with RESTful APIs for generating, editing, and managing websites.

## Technologies Used

- Next.js (App Router)
- React, TypeScript, JavaScript
- OpenAI API (GPT-4o)
- Bootstrap 5
- React-Bootstrap
- Custom AI prompt engineering for HTML, CSS, and image generation
- Local file storage for generated sites and uploads
- NextAuth for authentication
- Azure BlobStorage for scalable image storage

## Accessibility & Best Practices

- All generated sites use semantic HTML5, ARIA attributes, and pass WCAG AA color contrast checks.
- Responsive design for all devices.
- SEO meta tags and structured data included.
- Optimized for performance and scalability.

## Next steps

- Adding images through own profile for page generation.
- Hosted in some platfrom (e.g. Azure)
- Editing/Changing images in EditMode
- Correct HTML routing after editing
- More optimized website generation
- Able to lookup all generated sites from profile
- Template HTML which would get populated by the AI response
- Alot more ready made component modules to be used in Edit
