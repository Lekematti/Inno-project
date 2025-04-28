import { ImageRequest, OptimizedImagePrompt } from '@/types/formData'
import { BusinessType } from '@/types/business/types'

/**
 * Advanced image processing for website generation with improved AI prompting
 */

// Enhanced template image requirements with wider variety and higher quality specifications
const templateImageRequirements: Record<BusinessType, ImageRequest[]> = {
  restaurant: [
    {
      description: 'modern restaurant interior with ambient lighting',
      subject: 'interior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: "chef's signature dish beautifully plated",
      subject: 'food',
      style: 'artistic',
      width: 800,
      height: 600,
    },
    {
      description: 'inviting restaurant exterior with outdoor seating',
      subject: 'exterior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'chef preparing gourmet meal in professional kitchen',
      subject: 'people',
      style: 'real',
      width: 800,
      height: 800,
    },
    {
      description: 'elegant table setting with fine dining presentation',
      subject: 'product',
      style: 'real',
      width: 800,
      height: 600,
    },
  ],
  logistics: [
    {
      description: 'modern logistics facility with automated systems',
      subject: 'exterior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'fleet of delivery vehicles with professional branding',
      subject: 'product',
      style: 'real',
      width: 800,
      height: 600,
    },
    {
      description: 'warehouse management system with organized inventory',
      subject: 'interior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'logistics professionals coordinating shipments',
      subject: 'people',
      style: 'real',
      width: 800,
      height: 800,
    },
    {
      description: 'cutting-edge logistics technology and tracking systems',
      subject: 'product',
      style: 'real',
      width: 1000,
      height: 600,
    },
  ],
  professional: [
    {
      description: 'contemporary professional office with ergonomic workspace',
      subject: 'interior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'diverse business team in collaborative meeting',
      subject: 'people',
      style: 'real',
      width: 800,
      height: 800,
    },
    {
      description: 'professional service presentation with client',
      subject: 'product',
      style: 'artistic',
      width: 800,
      height: 600,
    },
    {
      description: 'modern office building exterior with architectural details',
      subject: 'exterior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'executive workspace with professional environment',
      subject: 'interior',
      style: 'real',
      width: 1000,
      height: 600,
    },
  ],
  custom: [],
}

// Quality enhancement phrases for more realistic and impressive outputs
const qualityEnhancementPhrases = {
  real: [
    'professional photography, 4K resolution, natural lighting',
    'DSLR photography, studio lighting, professional composition',
    'high-quality image, sharp focus, professional color grading',
    'commercial photography, professional staging, high-end',
    'professional photoshoot, high detail, magazine quality',
  ],
  artistic: [
    'high-quality digital art, detailed composition, vivid colors',
    'professional illustration, artistic detail, modern style',
    'creative digital rendering, expressive style, high resolution',
    'artistic composition, professional design, stylized rendering',
    'creative visual, professional artistic elements, vibrant',
  ],
}

// Enhanced subject-specific phrases to get better results
const subjectEnhancementPhrases: Record<string, string[]> = {
  food: [
    'chef-prepared cuisine, professional food styling, culinary artistry',
    'gourmet presentation, appetizing colors, expert plating',
    'fresh ingredients, culinary masterpiece, professional food photography',
  ],
  interior: [
    'thoughtfully designed space, professional interior photography, architectural details',
    'well-composed interior, perfect lighting, professional staging',
    'architectural photography, interior design showcase, spatial composition',
  ],
  exterior: [
    'architectural photography, professional exterior shot, golden hour lighting',
    'building exterior with context, professional real estate photography',
    'commercial photography, architectural features, perfect exposure',
  ],
  people: [
    'candid professional moment, authentic interaction, professional portrait',
    'diverse team, professional setting, natural expressions',
    'professional workplace culture, authentic engagement, commercial photography',
  ],
  product: [
    'product showcase, professional studio lighting, commercial quality',
    'detailed product photography, professional staging, premium presentation',
    'commercial product shot, professional composition, marketing quality',
  ],
  logo: [
    'clean vector design, professional branding, scalable logo',
    'minimalist logo design, professional identity, high contrast',
    'brand identity element, professional logo design, versatile mark',
  ],
}

/**
 * Process and optimize image generation requests based on user input and business type
 * Enhanced to create more customized and varied images
 */
export function processImageRequirements(
  userInput: string,
  businessType: string
): OptimizedImagePrompt[] {
  if (!userInput || userInput.trim().toLowerCase() === 'none') {
    return []
  }

  console.log(
    `🎨 Processing image requirements for ${businessType} template...`
  )

  // Normalize business type to match our template keys
  const normalizedType = businessType.toLowerCase() as BusinessType
  const isValidType = ['restaurant', 'logistics', 'professional'].includes(
    normalizedType
  )

  // Extract user image requests with enhanced parsing
  const userRequests = extractImageRequests(userInput, normalizedType)

  // If no valid business type or no user requests, return default set
  if (!isValidType || userRequests.length === 0) {
    if (isValidType) {
      console.log(
        'No valid user requests detected, using enhanced default template'
      )
      // Use randomized selection from templates for variety
      return getRandomizedTemplateImages(normalizedType, 3)
    }
    return []
  }

  // Create optimized prompts based on both user requests and template needs
  const optimizedRequests = createOptimizedPrompts(userRequests, normalizedType)

  return optimizedRequests
}

/**
 * Gets a randomized selection of template images
 * This provides variety even for default cases
 */
function getRandomizedTemplateImages(
  businessType: BusinessType,
  count: number = 3
): OptimizedImagePrompt[] {
  const templates = templateImageRequirements[businessType]
  const shuffled = [...templates].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, count)

  return selected.map((req) => ({
    description: createEnhancedPrompt(
      req.description,
      req.subject,
      req.style,
      businessType
    ),
    style: req.style as 'real' | 'artistic',
    width: req.width,
    height: req.height,
  }))
}

/**
 * Extract image requests from user's instructions with improved NLP parsing
 */
function extractImageRequests(
  userInput: string,
  businessType: BusinessType
): ImageRequest[] {
  const requests: ImageRequest[] = []

  // Enhanced patterns to look for in the user input
  const subjectPatterns = [
    {
      pattern:
        /food|dish|meal|menu|cuisine|pizza|pasta|burger|appetizer|dessert|plat(e|ing)|culinary|dining/i,
      subject: 'food',
    },
    {
      pattern:
        /interior|inside|room|dining|decor|atmosphere|space|indoor|area|office space|workplace|seating|furniture/i,
      subject: 'interior',
    },
    {
      pattern:
        /exterior|outside|building|storefront|facade|entrance|frontage|outdoor|street view|architecture|facility/i,
      subject: 'exterior',
    },
    {
      pattern:
        /person|people|staff|team|employee|chef|worker|professional|customer|client|guest|patron|group|meeting/i,
      subject: 'people',
    },
    {
      pattern:
        /product|item|goods|equipment|vehicle|truck|fleet|service|offering|solution|tool|device|merchandise/i,
      subject: 'product',
    },
    {
      pattern:
        /logo|brand|symbol|identity|banner|header|emblem|signature|mark|icon|branding/i,
      subject: 'logo',
    },
  ]

  // Improved sentence breaking for better context analysis
  const sentences = userInput
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5)

  // First pass: identify direct image requests
  for (const sentence of sentences) {
    // More advanced image request detection
    if (
      !/image|photo|picture|visual|shot|scene|view|banner|logo|display|show|depict|portray|representation/i.test(
        sentence
      )
    ) {
      continue
    }

    // Enhanced style detection with more patterns
    const styleHints = sentence.toLowerCase()
    let style: 'real' | 'artistic' = 'real'

    if (
      /realistic|real|photo|photograph|actual|authentic|true-to-life|lifelike/i.test(
        styleHints
      )
    ) {
      style = 'real'
    } else if (
      /artistic|creative|stylized|illustrated|abstract|modern|digital art|design|rendered/i.test(
        styleHints
      )
    ) {
      style = 'artistic'
    } else {
      // Default to the most appropriate style based on subject
      // (most product/people/exterior images look better as real photos)
      if (/people|exterior|interior|product/i.test(styleHints)) {
        style = 'real'
      } else {
        style = 'artistic'
      }
    }

    // More intelligent description extraction
    let description = sentence
      .replace(
        /i need|i want|please add|include|create|make|generate|provide|give me|show me|display/gi,
        ''
      )
      .replace(
        /an image of|a photo of|a picture of|image showing|picture showing|photo showing|visual of|showing/gi,
        ''
      )
      .replace(
        /realistic|artistic|real|style|high quality|professional|good|nice/gi,
        ''
      )
      .trim()

    // Determine the subject matter based on keywords with enhanced detection
    let subject = 'general'
    for (const { pattern, subject: subjectType } of subjectPatterns) {
      if (pattern.test(sentence)) {
        subject = subjectType
        break
      }
    }

    // Set appropriate dimensions based on subject type and context
    let width = 800,
      height = 600

    if (subject === 'exterior' || subject === 'interior') {
      width = 1200
      height = 600
    } else if (subject === 'people') {
      width = 800
      height = 800
    } else if (subject === 'logo') {
      width = 400
      height = 400
    } else if (
      subject === 'food' &&
      /close-up|detail|macro/i.test(description)
    ) {
      width = 800
      height = 800
    }

    // Add the request if we have a meaningful description
    if (description.length > 5) {
      // Context enhancement: Add business type if not mentioned
      if (!description.toLowerCase().includes(businessType)) {
        description += ` for ${businessType}`
      }

      requests.push({
        description,
        subject,
        style,
        width,
        height,
      })
    }
  }

  // Second pass: If no explicit image requests, analyze the whole content
  if (requests.length === 0) {
    // Extract key phrases that might indicate what the business values
    const keywords = extractKeyPhrases(userInput, 5)
    const keySubjects = determineKeySubjects(keywords, businessType)

    // Create requests based on key subjects and business type
    for (const subject of keySubjects) {
      const templateOptions = templateImageRequirements[businessType].filter(
        (req) => req.subject === subject
      )

      if (templateOptions.length > 0) {
        // Select a random template option for this subject
        const selectedTemplate =
          templateOptions[Math.floor(Math.random() * templateOptions.length)]

        // Enhance description with keywords
        let enhancedDesc = selectedTemplate.description
        if (keywords.length > 0) {
          const relevantKeywords = keywords
            .filter((k) => !enhancedDesc.includes(k))
            .slice(0, 2)
          if (relevantKeywords.length > 0) {
            enhancedDesc += ` with ${relevantKeywords.join(' and ')}`
          }
        }

        requests.push({
          description: enhancedDesc,
          subject,
          style: selectedTemplate.style,
          width: selectedTemplate.width,
          height: selectedTemplate.height,
        })
      }
    }
  }

  // If still no requests but we have some content, create intelligent defaults
  if (requests.length === 0 && userInput.trim().length > 10) {
    return createIntelligentDefaultRequests(userInput, businessType)
  }

  return requests
}

/**
 * Creates intelligent default requests based on input content
 */
function createIntelligentDefaultRequests(
  userInput: string,
  businessType: BusinessType
): ImageRequest[] {
  const defaults: ImageRequest[] = []

  // Extract the most important subjects for this business type
  const importantSubjects = getImportantSubjectsForBusiness(businessType)

  // Create requests for each important subject
  for (const subject of importantSubjects) {
    // Get templates for this subject
    const templatesForSubject = templateImageRequirements[businessType].filter(
      (t) => t.subject === subject
    )

    if (templatesForSubject.length > 0) {
      // Pick a random template from the options
      const template =
        templatesForSubject[
          Math.floor(Math.random() * templatesForSubject.length)
        ]

      // Create a generic but effective description
      let description = template.description

      // Add a touch of personalization from the input if possible
      const tone = detectTone(userInput)
      if (tone) {
        description = customizeDescriptionByTone(description, tone)
      }

      defaults.push({
        description,
        subject,
        style: template.style,
        width: template.width,
        height: template.height,
      })
    }
  }

  return defaults.slice(0, 3) // Limit to 3 images
}

/**
 * Gets the most important subjects for a business type
 */
function getImportantSubjectsForBusiness(businessType: BusinessType): string[] {
  switch (businessType) {
    case 'restaurant':
      return ['food', 'interior', 'exterior']
    case 'logistics':
      return ['product', 'exterior', 'people']
    case 'professional':
      return ['people', 'interior', 'exterior']
    default:
      return ['interior', 'people', 'exterior']
  }
}

/**
 * Detects the tone of the input text
 */
function detectTone(text: string): string | null {
  const lowerText = text.toLowerCase()

  if (/luxur|premium|high-end|sophisticated|elegant|upscale/i.test(lowerText)) {
    return 'luxury'
  } else if (
    /modern|tech|innovative|cutting-edge|advanced|digital/i.test(lowerText)
  ) {
    return 'modern'
  } else if (/friendly|welcom|warm|casual|comfort|relax/i.test(lowerText)) {
    return 'friendly'
  } else if (/professional|business|corporate|formal|expert/i.test(lowerText)) {
    return 'professional'
  } else if (
    /creative|artistic|unique|design|colorful|vibrant/i.test(lowerText)
  ) {
    return 'creative'
  }

  return null
}

/**
 * Customizes a description based on detected tone
 */
function customizeDescriptionByTone(description: string, tone: string): string {
  switch (tone) {
    case 'luxury':
      return description
        .replace(/modern|standard|regular/g, 'luxury')
        .concat(', upscale, sophisticated')
    case 'modern':
      return description
        .replace(/traditional|classic/g, 'modern')
        .concat(', contemporary, innovative')
    case 'friendly':
      return description
        .replace(/formal|corporate/g, 'welcoming')
        .concat(', warm, inviting')
    case 'professional':
      return description
        .replace(/casual|relaxed/g, 'professional')
        .concat(', corporate, business-oriented')
    case 'creative':
      return description
        .replace(/standard|conventional/g, 'creative')
        .concat(', unique, artistic')
    default:
      return description
  }
}

/**
 * Extract key phrases from text for better image understanding
 */
function extractKeyPhrases(text: string, maxPhrases: number = 5): string[] {
  // Basic keyword extraction (could be replaced with more sophisticated NLP)
  const commonWords = new Set([
    'the',
    'and',
    'a',
    'an',
    'of',
    'to',
    'in',
    'that',
    'is',
    'are',
    'for',
    'with',
    'as',
    'on',
    'at',
    'by',
    'from',
    'we',
    'our',
    'us',
  ])

  // Extract words, filter common ones, and get frequency
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))

  // Count frequency
  const wordFrequency: Record<string, number> = {}
  words.forEach((word) => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1
  })

  // Sort by frequency and return top phrases
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map((entry) => entry[0])
}

/**
 * Determine key subjects based on keywords and business type
 */
function determineKeySubjects(
  keywords: string[],
  businessType: BusinessType
): string[] {
  // Map keywords to likely subjects
  const subjectMapping: Record<string, Record<string, string[]>> = {
    restaurant: {
      food: [
        'food',
        'dish',
        'meal',
        'cuisine',
        'menu',
        'chef',
        'cooking',
        'restaurant',
        'dining',
        'taste',
        'flavor',
        'culinary',
      ],
      interior: [
        'interior',
        'decor',
        'atmosphere',
        'ambiance',
        'seating',
        'dining',
        'table',
        'restaurant',
        'space',
      ],
      exterior: [
        'building',
        'exterior',
        'facade',
        'storefront',
        'entrance',
        'restaurant',
        'location',
      ],
      people: [
        'staff',
        'chef',
        'server',
        'team',
        'service',
        'customer',
        'guest',
        'people',
      ],
    },
    logistics: {
      product: [
        'product',
        'package',
        'delivery',
        'shipment',
        'goods',
        'cargo',
        'freight',
        'inventory',
        'logistics',
      ],
      exterior: [
        'facility',
        'warehouse',
        'building',
        'center',
        'hub',
        'exterior',
        'location',
      ],
      interior: [
        'warehouse',
        'facility',
        'storage',
        'operation',
        'interior',
        'inventory',
        'sorting',
      ],
      people: [
        'staff',
        'team',
        'employee',
        'worker',
        'driver',
        'personnel',
        'professional',
      ],
    },
    professional: {
      people: [
        'team',
        'staff',
        'professional',
        'expert',
        'consultant',
        'advisor',
        'employee',
        'specialist',
        'executive',
      ],
      interior: [
        'office',
        'workspace',
        'interior',
        'space',
        'environment',
        'facility',
        'conference',
        'desk',
        'meeting',
      ],
      exterior: [
        'building',
        'office',
        'headquarters',
        'location',
        'exterior',
        'entrance',
        'facade',
      ],
      product: [
        'service',
        'product',
        'solution',
        'offering',
        'consultation',
        'expertise',
        'project',
      ],
    },
  }

  // Score subjects based on keyword matches
  const subjectScores: Record<string, number> = {
    food: 0,
    interior: 0,
    exterior: 0,
    people: 0,
    product: 0,
  }

  // For each keyword, increase scores of matching subjects
  for (const keyword of keywords) {
    for (const [subject, relatedTerms] of Object.entries(
      subjectMapping[businessType] || {}
    )) {
      if (
        Array.isArray(relatedTerms) &&
        relatedTerms.some(
          (term) => keyword.includes(term) || term.includes(keyword)
        )
      ) {
        subjectScores[subject] += 1
      }
    }
  }

  // Get the top 3 subjects by score
  const topSubjects = Object.entries(subjectScores)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])
    .slice(0, 3)

  // If we couldn't determine good subjects, fall back to defaults
  if (topSubjects.every((subject) => subjectScores[subject] === 0)) {
    return getImportantSubjectsForBusiness(businessType)
  }

  return topSubjects
}

/**
 * Create optimized prompts based on user requests and business type
 * Enhanced with better prompt engineering and diversity
 */
function createOptimizedPrompts(
  userRequests: ImageRequest[],
  businessType: BusinessType
): OptimizedImagePrompt[] {
  const optimizedPrompts: OptimizedImagePrompt[] = []

  // Get default requirements for this business type
  const defaultRequirements = templateImageRequirements[businessType] || []

  // Track which subjects we've already covered
  const coveredSubjects = new Set<string>()

  // First, process user requests
  for (const request of userRequests) {
    const { description, subject, style } = request

    // Set dimensions based on subject type and aspect ratio needs
    let width = 800,
      height = 600

    if (subject === 'exterior' || subject === 'interior') {
      width = 1200
      height = 600
    } else if (subject === 'people') {
      width = 800
      height = 800
    } else if (subject === 'logo') {
      width = 400
      height = 400
    } else if (
      subject === 'food' &&
      /close-up|detail|macro/i.test(description)
    ) {
      width = 800
      height = 800
    }

    // Create an optimized prompt based on the subject and style
    const optimizedDescription = createEnhancedPrompt(
      description,
      subject,
      style,
      businessType
    )

    // Add to our list and mark this subject as covered
    optimizedPrompts.push({
      description: optimizedDescription,
      style: style as 'real' | 'artistic',
      width,
      height,
    })

    coveredSubjects.add(subject)
  }

  // Fill in with smart defaults if we don't have enough images
  if (optimizedPrompts.length < 3) {
    // Determine which subjects we should prioritize
    const importantSubjects = getImportantSubjectsForBusiness(businessType)
    const remainingSubjects = importantSubjects.filter(
      (s) => !coveredSubjects.has(s)
    )

    // Add images for important but uncovered subjects
    for (const subject of remainingSubjects) {
      const relevantTemplates = defaultRequirements.filter(
        (req) => req.subject === subject
      )

      if (relevantTemplates.length > 0) {
        // Choose a random template for variety
        const template =
          relevantTemplates[
            Math.floor(Math.random() * relevantTemplates.length)
          ]

        optimizedPrompts.push({
          description: createEnhancedPrompt(
            template.description,
            template.subject,
            template.style,
            businessType
          ),
          style: template.style as 'real' | 'artistic',
          width: template.width,
          height: template.height,
        })

        coveredSubjects.add(subject)
      }

      // Stop once we have enough images
      if (optimizedPrompts.length >= 3) {
        break
      }
    }

    // If we still need more images, add variety from any remaining templates
    if (optimizedPrompts.length < 3) {
      // Filter out templates for subjects we've already covered
      const remainingTemplates = defaultRequirements.filter(
        (req) => !coveredSubjects.has(req.subject)
      )

      // If we have remaining templates, add them
      if (remainingTemplates.length > 0) {
        const shuffled = [...remainingTemplates].sort(() => 0.5 - Math.random())
        const needed = 3 - optimizedPrompts.length

        for (let i = 0; i < Math.min(needed, shuffled.length); i++) {
          const template = shuffled[i]

          optimizedPrompts.push({
            description: createEnhancedPrompt(
              template.description,
              template.subject,
              template.style,
              businessType
            ),
            style: template.style as 'real' | 'artistic',
            width: template.width,
            height: template.height,
          })

          coveredSubjects.add(template.subject)
        }
      }

      // Last resort: If we still need more, add alternatives of already covered subjects
      if (optimizedPrompts.length < 3) {
        const needed = 3 - optimizedPrompts.length
        const alternatives = defaultRequirements
          .filter(
            (req) =>
              !optimizedPrompts.some(
                (p) =>
                  p.description ===
                  createEnhancedPrompt(
                    req.description,
                    req.subject,
                    req.style,
                    businessType
                  )
              )
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, needed)

        for (const alt of alternatives) {
          optimizedPrompts.push({
            description: createEnhancedPrompt(
              alt.description,
              alt.subject,
              alt.style,
              businessType
            ),
            style: alt.style as 'real' | 'artistic',
            width: alt.width,
            height: alt.height,
          })
        }
      }
    }
  }

  // Ensure we don't have duplicate descriptions
  const uniquePrompts = Array.from(
    new Map(
      optimizedPrompts.map((item) => [item.description.toLowerCase(), item])
    ).values()
  )

  return uniquePrompts
}

/**
 * Creates an enhanced, AI-friendly prompt from a user description
 * Improved with advanced prompt engineering techniques
 */
function createEnhancedPrompt(
  description: string,
  subject: string,
  style: string,
  businessType: BusinessType
): string {
  let enhancedPrompt = description.trim()

  // Add business type context if not already present
  if (!enhancedPrompt.toLowerCase().includes(businessType)) {
    enhancedPrompt += ` for ${businessType} business`
  }

  // Add randomized quality enhancement for variety
  const qualityOptions = qualityEnhancementPhrases[style as 'real' | 'artistic']
  const qualityPhrase =
    qualityOptions[Math.floor(Math.random() * qualityOptions.length)]
  enhancedPrompt += `, ${qualityPhrase}`

  // Add subject-specific enhancements randomly for variety
  if (subjectEnhancementPhrases[subject]) {
    const subjectOptions = subjectEnhancementPhrases[subject]
    const subjectPhrase =
      subjectOptions[Math.floor(Math.random() * subjectOptions.length)]
    enhancedPrompt += `, ${subjectPhrase}`
  }

  // Add business-specific context
  if (businessType === 'restaurant') {
    switch (subject) {
      case 'food':
        enhancedPrompt += ', culinary excellence, appetizing presentation'
        break
      case 'interior':
        enhancedPrompt += ', restaurant ambiance, dining atmosphere'
        break
      case 'exterior':
        enhancedPrompt += ', restaurant storefront, inviting entrance'
        break
      case 'people':
        enhancedPrompt += ', restaurant staff, culinary team'
        break
    }
  } else if (businessType === 'professional') {
    switch (subject) {
      case 'interior':
        enhancedPrompt += ', professional workspace, business environment'
        break
      case 'exterior':
        enhancedPrompt +=
          ', professional office building, business headquarters'
        break
      case 'people':
        enhancedPrompt += ', business professionals, corporate team'
        break
      case 'product':
        enhancedPrompt += ', professional service, business solution'
        break
    }
  } else if (businessType === 'logistics') {
    switch (subject) {
      case 'interior':
        enhancedPrompt += ', logistics facility, organized workspace'
        break
      case 'exterior':
        enhancedPrompt += ', logistics center, distribution facility'
        break
      case 'people':
        enhancedPrompt += ', logistics team, delivery professionals'
        break
      case 'product':
        enhancedPrompt += ', logistics equipment, transportation vehicles'
        break
    }
  }

  // Truncate if too long for API limits
  if (enhancedPrompt.length > 300) {
    enhancedPrompt = enhancedPrompt.substring(0, 297) + '...'
  }

  return enhancedPrompt
}

/**
 * Checks if a description is too complex for real-style images
 * Enhanced with more patterns for better detection
 */
export function isDescriptionTooComplex(description: string): boolean {
  // Complex concept keywords with expanded patterns
  const complexTerms = [
    'fantasy',
    'surreal',
    'futuristic',
    'fictional',
    'magical',
    'abstract',
    'imaginary',
    'alien',
    'dragon',
    'unicorn',
    'creature',
    'mythical',
    'impossible',
    'supernatural',
    'fairytale',
    'sci-fi',
    'floating',
    'levitating',
    'dream',
    'cartoon',
    'anime',
    'illustration',
    '3d render',
    'digital art',
    'concept art',
  ]

  const descLower = description.toLowerCase()

  // Check complexity indicators with improved patterns
  if (
    complexTerms.some((term) => descLower.includes(term)) ||
    description.length > 100 ||
    /flying .* underwater|people .* space|animals? .* driving|talking .* objects|impossible .* physics|cartoon .* style|animation .* style/i.test(
      description
    ) ||
    /(in the style of|inspired by) .* (anime|cartoon|illustration|painting|drawing)/i.test(
      description
    )
  ) {
    return true
  }

  return false
}

/**
 * Generates image URLs based on user instructions and business type with improved query parameter preservation
 */
export async function fetchImages(
  imageInstructions: string, 
  businessType: string = 'restaurant',
  imageSource: 'ai' | 'manual' | 'none' = 'ai'
): Promise<string[]> {
  // If image source is 'none' or no instructions for AI, return empty array
  if (
    imageSource === 'none' || 
    (imageSource === 'ai' && (!imageInstructions || imageInstructions.trim().toLowerCase() === 'none'))
  ) {
    return [];
  }
  
  // If manual images, the URLs will be handled by the POST route
  if (imageSource === 'manual') {
    return [];
  }
  
  const imageUrls: string[] = [];
  console.log(`🖼️ Processing AI image instructions for ${businessType}...`);
  
  try {
    // Process the requirements with enhanced prompt engineering
    const imageRequests = processImageRequirements(imageInstructions, businessType);
    
    // Handle empty requests with smart defaults
    if (imageRequests.length === 0) {
      console.log('No valid image requests processed. Using enhanced default template.');
      // Get the default template for this business type
      const normalizedType = businessType.toLowerCase() as BusinessType;
      if (['restaurant', 'logistics', 'professional'].includes(normalizedType)) {
        // Use randomized default images for better variety
        const defaultRequests = getRandomizedTemplateImages(normalizedType, 3);
        
        // Add these default requests to our processed requests
        for (const req of defaultRequests) {
          imageRequests.push(req);
        }
      }
    }
    
    // Generate unique identifiers for the image URLs with better uniqueness properties
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10); // Longer random string
    
    // Generate URLs with parallel processing in mind - each request gets a unique seed
    for (let i = 0; i < imageRequests.length; i++) {
      const { description, style, width, height } = imageRequests[i];
      
      // Adjust style if needed using enhanced complexity detection
      const finalStyle = (style === 'real' && isDescriptionTooComplex(description)) 
        ? 'artistic' 
        : style;
      
      // Create a more robust hash from the description - ensure it's URL-safe
      const descHash = Buffer.from(description).toString('base64')
        .replace(/[/+=]/g, '')
        .substring(0, 8);
      
      // Generate a more unique identifier for better cache avoidance and distribution
      const uniqueId = `${timestamp}-${randomId}-${i+1}-${descHash}`;
      
      // Add a seed parameter for consistent but varied image generation
      const seed = Math.floor(Math.random() * 1000000);
      
      // Create sanitized description with proper URL encoding for the filename part
      const sanitizedDesc = description
        .replace(/[']/g, "") // Remove apostrophes
        .replace(/[^a-zA-Z0-9-_.]/g, "-") // Replace other special chars with hyphens
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .substring(0, 20); // Limit length
      
      // Fully encode the query parameter separately to ensure proper handling
      const encodedFullDescription = encodeURIComponent(description);
      
      // Fixed URL construction with guaranteed query parameters
      const url = `https://webweave-imagegen.onrender.com/jukka/images/${uniqueId}-${sanitizedDesc}.jpg?description=${encodedFullDescription}&width=${width}&height=${height}&style=${finalStyle}&seed=${seed}&quality=high`;
      
      console.log(`Generating ${finalStyle} image (${i+1}/${imageRequests.length}): "${description.substring(0, 60)}${description.length > 60 ? '...' : ''}"`);
      imageUrls.push(url);
    }
    
    return imageUrls;
  } catch (error) {
    console.error("Error generating images:", error);
    return [];
  }
}

/**
 * Helper function to ensure all image URLs in HTML have query parameters
 * This is crucial for the API that generates the images
 */
export function ensureImageUrlsHaveParams(htmlContent: string, imageUrls: string[]): string {
  let fixedHtml = htmlContent;
  
  // Regular expressions to find image URLs without query parameters
  const bgImageRegex = /background-image:\s*url\(['"]?(https:\/\/webweave-imagegen\.onrender\.com\/[^?'"]+)['"]?\)/g;
  const srcImageRegex = /src=["'](https:\/\/webweave-imagegen\.onrender\.com\/[^?"']+)["']/g;
  const contentImageRegex = /content=["'](https:\/\/webweave-imagegen\.onrender\.com\/[^?"']+)["']/g;
  
  // Create a map of truncated URLs to full URLs with parameters
  const urlMap = new Map();
  imageUrls.forEach(fullUrl => {
    const baseUrl = fullUrl.split('?')[0];
    urlMap.set(baseUrl, fullUrl);
  });
  
  // Fix background-image URLs
  fixedHtml = fixedHtml.replace(bgImageRegex, (match, url) => {
    const fullUrl = urlMap.get(url) || `${url}?description=image&width=800&height=600&style=real&quality=high`;
    return `background-image: url('${fullUrl}')`;
  });
  
  // Fix src URLs
  fixedHtml = fixedHtml.replace(srcImageRegex, (match, url) => {
    const fullUrl = urlMap.get(url) || `${url}?description=image&width=800&height=600&style=real&quality=high`;
    return `src="${fullUrl}"`;
  });
  
  // Fix content URLs
  fixedHtml = fixedHtml.replace(contentImageRegex, (match, url) => {
    const fullUrl = urlMap.get(url) || `${url}?description=image&width=800&height=600&style=real&quality=high`;
    return `content="${fullUrl}"`;
  });
  
  return fixedHtml;
}
