import fetch from 'node-fetch';
import { generateContentWithSystem } from './claude.js';

/**
 * AI Image Generation Service
 * 
 * Integrates with:
 * - OpenAI DALL-E 3 for high-quality single images
 * - Leonardo.ai for consistent, marketing-focused brand creatives
 */

const OPENAI_API_URL = 'https://api.openai.com/v1';
const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1';

// ============================================
// BRAND STYLE MANAGEMENT
// ============================================

/**
 * Client brand style settings for consistency
 */
const DEFAULT_BRAND_STYLE = {
  colorPalette: [],
  stylePreset: 'DYNAMIC', // LEONARDO presets
  modelId: null, // Custom trained model ID
  elementIds: [], // Saved style elements
  promptPrefix: '',
  negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text errors, misspellings',
  guidanceScale: 7,
  photoReal: true,
  alchemy: true,
};

// ============================================
// PROMPT GENERATION (Claude)
// ============================================

/**
 * Generate optimized image prompts for marketing
 */
export async function generateImagePrompt(requirements, clientBrandStyle = {}) {
  const {
    platform,
    contentType,
    topic,
    brandColors,
    style,
    mood,
    includeText,
    textContent,
    productDescription,
    targetAudience,
  } = requirements;

  const brandStyle = { ...DEFAULT_BRAND_STYLE, ...clientBrandStyle };

  const platformSpecs = {
    instagram: { post: '1080x1080', story: '1080x1920', ad: '1080x1080', reel: '1080x1920' },
    facebook: { post: '1200x630', story: '1080x1920', ad: '1200x628', cover: '820x312' },
    linkedin: { post: '1200x627', ad: '1200x627', cover: '1584x396' },
    twitter: { post: '1600x900', ad: '1200x675', cover: '1500x500' },
    tiktok: { post: '1080x1920', ad: '1080x1920' },
    google_ads: { display: '1200x628', square: '1200x1200', skyscraper: '300x600' },
  };

  const dimensions = platformSpecs[platform]?.[contentType] || '1080x1080';

  const systemPrompt = `You are an expert marketing creative director specializing in high-converting visual content.
Your prompts must:
- Create SCROLL-STOPPING visuals that grab attention in 0.3 seconds
- Be highly detailed with specific composition, lighting, and style
- Focus on emotional triggers that drive action
- Be consistent with brand guidelines
- Optimized for ${platform} best practices

BRAND STYLE CONTEXT:
${brandStyle.promptPrefix ? `Brand prefix: ${brandStyle.promptPrefix}` : ''}
${brandColors ? `Brand colors: ${brandColors}` : ''}
Style: Professional marketing creative, polished, high-end`;

  const userPrompt = `Create a marketing image prompt for:

PLATFORM: ${platform}
FORMAT: ${contentType} (${dimensions})
TOPIC/PRODUCT: ${topic}
${productDescription ? `PRODUCT DETAILS: ${productDescription}` : ''}
TARGET AUDIENCE: ${targetAudience || 'Marketing professionals'}
DESIRED MOOD: ${mood || 'professional, trustworthy, engaging'}
STYLE: ${style || 'modern, clean, premium'}
${brandColors ? `BRAND COLORS TO INCORPORATE: ${brandColors}` : ''}
${includeText ? `TEXT OVERLAY NEEDED: "${textContent}" - Design with space for this text` : 'NO TEXT IN IMAGE - Pure visual'}

Create a DETAILED prompt that will generate a stunning, high-converting marketing creative.

IMPORTANT MARKETING PRINCIPLES:
- Hero product/subject should be prominent
- Use rule of thirds for composition
- Include subtle depth and dimension
- Professional lighting (soft, flattering)
- Clean, uncluttered background or contextual lifestyle setting
- Colors that pop but stay on-brand

Output as JSON:
{
  "prompt": "detailed prompt starting with the main subject, then style, lighting, composition, colors, mood",
  "negative_prompt": "what to avoid for clean marketing look",
  "style_keywords": ["key", "style", "words"],
  "composition_notes": "where elements should be placed",
  "recommended_model": "photoreal or artistic",
  "dimensions": { "width": number, "height": number }
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Prepend brand prefix if exists
      if (brandStyle.promptPrefix) {
        parsed.prompt = `${brandStyle.promptPrefix}, ${parsed.prompt}`;
      }
      return parsed;
    }
    return { prompt: response };
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw new Error(`Failed to generate prompt: ${error.message}`);
  }
}

// ============================================
// OPENAI DALL-E 3
// ============================================

/**
 * Generate image with DALL-E 3
 */
export async function generateWithDallE(prompt, options = {}) {
  const {
    apiKey,
    size = '1024x1024',
    quality = 'hd',
    style = 'vivid',
    n = 1,
  } = options;

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size,
        quality,
        style,
        n,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'DALL-E API error');
    }

    const data = await response.json();
    
    return {
      images: data.data.map(img => ({
        url: img.url,
        revised_prompt: img.revised_prompt,
      })),
      model: 'dall-e-3',
      provider: 'openai',
    };
  } catch (error) {
    console.error('Error generating with DALL-E:', error);
    throw new Error(`DALL-E generation failed: ${error.message}`);
  }
}

// ============================================
// LEONARDO.AI - MAIN CREATIVE ENGINE
// ============================================

/**
 * Generate image with Leonardo.ai
 * Best for: Consistent brand creatives, marketing images
 */
export async function generateWithLeonardo(prompt, options = {}) {
  const {
    apiKey,
    modelId = '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix (best for marketing)
    width = 1024,
    height = 1024,
    numImages = 4,
    negativePrompt = 'blurry, low quality, distorted, ugly, watermark, text errors',
    guidanceScale = 7,
    promptMagic = false, // Phoenix doesn't support Prompt Magic
    promptMagicVersion = 'v3',
    alchemy = false, // Phoenix doesn't support Alchemy
    photoReal = false, // Phoenix doesn't support PhotoReal
    photoRealVersion = 'v2',
    presetStyle = 'DYNAMIC', // CINEMATIC, CREATIVE, DYNAMIC, ENVIRONMENT, GENERAL, ILLUSTRATION, PHOTOGRAPHY, RAYTRACED, RENDER_3D, SKETCH_BW, SKETCH_COLOR
    contrastRatio = 0.5,
    expandedDomain = true,
    highResolution = true,
    // Consistency features
    elementIds = [], // Style elements for consistency
    controlnets = [], // ControlNet for structure
  } = options;

  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const body = {
      prompt,
      modelId,
      width,
      height,
      num_images: numImages,
      negative_prompt: negativePrompt,
      guidance_scale: guidanceScale,
      presetStyle,
      highResolution,
      alchemy,
    };

    // Enable PhotoReal for photorealistic marketing images
    if (photoReal) {
      body.photoReal = true;
      body.photoRealVersion = photoRealVersion;
    }

    // Enable Prompt Magic for better prompt understanding
    if (promptMagic) {
      body.promptMagic = true;
      body.promptMagicVersion = promptMagicVersion;
    }

    // Add elements for brand consistency
    if (elementIds.length > 0) {
      body.elements = elementIds.map(id => ({ 
        akUUID: id, 
        weight: 0.75 
      }));
    }

    // Add ControlNets for structure
    if (controlnets.length > 0) {
      body.controlnets = controlnets;
    }

    const response = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    const generationId = data.sdGenerationJob?.generationId;

    // Return generation ID - images need to be polled
    return {
      generationId,
      status: 'processing',
      message: 'Image generation started. Poll for results.',
      provider: 'leonardo',
    };
  } catch (error) {
    console.error('Error generating with Leonardo:', error);
    throw new Error(`Leonardo.ai generation failed: ${error.message}`);
  }
}

/**
 * Check Leonardo generation status and get images
 */
export async function getLeonardoGenerationStatus(generationId, apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    const generation = data.generations_by_pk;

    return {
      generationId,
      status: generation.status,
      images: generation.generated_images?.map(img => ({
        id: img.id,
        url: img.url,
        nsfw: img.nsfw,
        likeCount: img.likeCount,
      })) || [],
      prompt: generation.prompt,
      modelId: generation.modelId,
      provider: 'leonardo',
    };
  } catch (error) {
    console.error('Error checking generation status:', error);
    throw new Error(`Failed to check status: ${error.message}`);
  }
}

/**
 * Wait for Leonardo generation to complete
 */
export async function waitForLeonardoGeneration(generationId, apiKey, maxWaitMs = 120000) {
  const startTime = Date.now();
  const pollInterval = 3000; // 3 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getLeonardoGenerationStatus(generationId, apiKey);
    
    if (status.status === 'COMPLETE') {
      return status;
    }
    
    if (status.status === 'FAILED') {
      throw new Error('Image generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Generation timed out');
}

/**
 * Get available Leonardo models
 */
export async function getLeonardoModels(apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/platformModels`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    
    // Return most relevant marketing models
    return data.custom_models?.filter(m => 
      m.featured || 
      m.name.includes('Phoenix') || 
      m.name.includes('Kino') ||
      m.name.includes('Photo')
    ) || [];
  } catch (error) {
    console.error('Error getting models:', error);
    throw new Error(`Failed to get models: ${error.message}`);
  }
}

/**
 * Get user's custom trained models
 */
export async function getLeonardoCustomModels(apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    // First get user ID
    const userResponse = await fetch(`${LEONARDO_API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const userId = userData.user_details?.[0]?.user?.id;

    // Then get custom models
    const response = await fetch(`${LEONARDO_API_URL}/models?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    return data.custom_models || [];
  } catch (error) {
    console.error('Error getting custom models:', error);
    throw new Error(`Failed to get custom models: ${error.message}`);
  }
}

/**
 * Get available style elements for consistency
 */
export async function getLeonardoElements(apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/elements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    return data.loras || [];
  } catch (error) {
    console.error('Error getting elements:', error);
    throw new Error(`Failed to get elements: ${error.message}`);
  }
}

/**
 * Train custom model for brand consistency
 */
export async function trainLeonardoModel(name, description, images, options = {}) {
  const {
    apiKey,
    instancePrompt = 'brand style', // Trigger word
    modelType = 'GENERAL', // GENERAL, BUILDINGS, CHARACTERS, GAME_ITEMS, ANIMALS, PRODUCT_DESIGN
    resolution = 512,
    sdVersion = 'SDXL_0_9',
    strength = 'MEDIUM',
  } = options;

  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    // Step 1: Create dataset
    const datasetResponse = await fetch(`${LEONARDO_API_URL}/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: `${name} - Training Data`,
        description: `Training images for ${name}`,
      }),
    });

    if (!datasetResponse.ok) {
      throw new Error('Failed to create dataset');
    }

    const datasetData = await datasetResponse.json();
    const datasetId = datasetData.insert_datasets_one?.id;

    // Step 2: Upload images to dataset
    for (const imageUrl of images) {
      await fetch(`${LEONARDO_API_URL}/datasets/${datasetId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          extension: 'jpg',
        }),
      });
    }

    // Step 3: Train model
    const trainResponse = await fetch(`${LEONARDO_API_URL}/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name,
        description,
        datasetId,
        instance_prompt: instancePrompt,
        modelType,
        resolution,
        sd_Version: sdVersion,
        strength,
      }),
    });

    if (!trainResponse.ok) {
      const error = await trainResponse.json();
      throw new Error(error.error || 'Failed to start training');
    }

    const trainData = await trainResponse.json();

    return {
      modelId: trainData.sdTrainingJob?.customModelId,
      status: 'training',
      message: 'Model training started. This may take 20-60 minutes.',
      instancePrompt,
    };
  } catch (error) {
    console.error('Error training model:', error);
    throw new Error(`Model training failed: ${error.message}`);
  }
}

/**
 * Image to Image with Leonardo (for variations)
 */
export async function leonardoImageToImage(imageUrl, prompt, options = {}) {
  const {
    apiKey,
    modelId = '6b645e3a-d64f-4341-a6d8-7a3690fbf042',
    strength = 0.45, // How much to change (0.1 = minor tweaks, 0.9 = major changes)
    width = 1024,
    height = 1024,
    numImages = 4,
    negativePrompt = 'blurry, low quality, distorted',
    alchemy = true,
    photoReal = true,
  } = options;

  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    // First, upload or get the init image
    const body = {
      prompt,
      modelId,
      width,
      height,
      num_images: numImages,
      negative_prompt: negativePrompt,
      init_strength: strength,
      init_image_id: imageUrl, // Can be URL or uploaded image ID
      alchemy,
      photoReal,
    };

    const response = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();

    return {
      generationId: data.sdGenerationJob?.generationId,
      status: 'processing',
      provider: 'leonardo',
    };
  } catch (error) {
    console.error('Error with image-to-image:', error);
    throw new Error(`Image-to-image failed: ${error.message}`);
  }
}

/**
 * Upscale image with Leonardo
 */
export async function upscaleWithLeonardo(imageId, apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/variations/upscale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        id: imageId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();

    return {
      variationId: data.sdUpscaleJob?.id,
      status: 'processing',
    };
  } catch (error) {
    console.error('Error upscaling:', error);
    throw new Error(`Upscale failed: ${error.message}`);
  }
}

/**
 * Remove background with Leonardo
 */
export async function removeBackgroundWithLeonardo(imageId, apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/variations/nobg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        id: imageId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();

    return {
      variationId: data.sdNobgJob?.id,
      status: 'processing',
    };
  } catch (error) {
    console.error('Error removing background:', error);
    throw new Error(`Background removal failed: ${error.message}`);
  }
}

/**
 * Get user's generation history
 */
export async function getLeonardoHistory(apiKey, limit = 50) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    // Get user ID first
    const userResponse = await fetch(`${LEONARDO_API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const userData = await userResponse.json();
    const userId = userData.user_details?.[0]?.user?.id;

    const response = await fetch(`${LEONARDO_API_URL}/generations/user/${userId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    return data.generations || [];
  } catch (error) {
    console.error('Error getting history:', error);
    throw new Error(`Failed to get history: ${error.message}`);
  }
}

/**
 * Get API credits/usage
 */
export async function getLeonardoCredits(apiKey) {
  if (!apiKey) {
    throw new Error('Leonardo.ai API key is required');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Leonardo.ai API error');
    }

    const data = await response.json();
    const userDetails = data.user_details?.[0];

    return {
      apiCreditsRemaining: userDetails?.apiConcurrencySlots,
      subscriptionTokens: userDetails?.subscriptionTokens,
      subscriptionGptTokens: userDetails?.subscriptionGptTokens,
      subscriptionModelTokens: userDetails?.subscriptionModelTokens,
    };
  } catch (error) {
    console.error('Error getting credits:', error);
    throw new Error(`Failed to get credits: ${error.message}`);
  }
}

// ============================================
// SOCIAL MEDIA CREATIVE GENERATION (COMBINED)
// ============================================

/**
 * Generate complete social media creative with brand consistency
 */
export async function generateSocialMediaCreative(requirements, apiKeys, clientBrandStyle = {}) {
  const {
    platform,
    contentType,
    topic,
    brandColors,
    style,
    mood,
    includeText,
    textContent,
    productDescription,
    targetAudience,
    preferredApi = 'leonardo', // leonardo or dalle
    numVariations = 4,
  } = requirements;

  const brandStyle = { ...DEFAULT_BRAND_STYLE, ...clientBrandStyle };

  // Step 1: Generate optimized prompt
  const promptData = await generateImagePrompt(requirements, brandStyle);

  // Merge negative prompts
  const finalNegativePrompt = [
    promptData.negative_prompt,
    brandStyle.negativePrompt,
  ].filter(Boolean).join(', ');

  // Step 2: Generate images
  let result;

  if (preferredApi === 'dalle') {
    // Use DALL-E for single high-quality images
    result = await generateWithDallE(promptData.prompt, {
      apiKey: apiKeys.openai,
      size: getDallESize(platform, contentType),
      quality: 'hd',
      style: style === 'photorealistic' ? 'natural' : 'vivid',
    });
  } else {
    // Use Leonardo.ai for consistent, marketing-focused creatives
    const dims = getLeonardoDimensions(platform, contentType);
    
    const generationResult = await generateWithLeonardo(promptData.prompt, {
      apiKey: apiKeys.leonardo,
      modelId: brandStyle.modelId || '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Phoenix
      width: dims.width,
      height: dims.height,
      numImages: numVariations,
      negativePrompt: finalNegativePrompt,
      guidanceScale: brandStyle.guidanceScale || 7,
      photoReal: false, // Phoenix doesn't support PhotoReal
      alchemy: false, // Phoenix doesn't support Alchemy
      presetStyle: brandStyle.stylePreset || 'DYNAMIC',
      elementIds: brandStyle.elementIds || [],
    });

    // Wait for completion
    result = await waitForLeonardoGeneration(
      generationResult.generationId,
      apiKeys.leonardo
    );
  }

  return {
    ...result,
    promptUsed: promptData.prompt,
    negativePromptUsed: finalNegativePrompt,
    platform,
    contentType,
    compositionNotes: promptData.composition_notes,
    styleKeywords: promptData.style_keywords,
    brandStyleApplied: !!clientBrandStyle.modelId || !!clientBrandStyle.elementIds?.length,
  };
}

/**
 * Save brand style for a client (for consistency)
 */
export function createBrandStyle(options) {
  return {
    ...DEFAULT_BRAND_STYLE,
    ...options,
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDallESize(platform, contentType) {
  if (platform === 'instagram' && contentType === 'story') return '1024x1792';
  if (platform === 'tiktok') return '1024x1792';
  if (platform === 'facebook' && contentType === 'cover') return '1792x1024';
  if (platform === 'linkedin' && contentType === 'cover') return '1792x1024';
  if (platform === 'twitter' && contentType === 'cover') return '1792x1024';
  return '1024x1024';
}

function getLeonardoDimensions(platform, contentType) {
  // Leonardo supports flexible dimensions
  const specs = {
    'instagram-post': { width: 1024, height: 1024 },
    'instagram-story': { width: 768, height: 1360 },
    'instagram-reel': { width: 768, height: 1360 },
    'instagram-ad': { width: 1024, height: 1024 },
    'facebook-post': { width: 1200, height: 630 },
    'facebook-story': { width: 768, height: 1360 },
    'facebook-ad': { width: 1200, height: 628 },
    'facebook-cover': { width: 1640, height: 624 },
    'linkedin-post': { width: 1200, height: 628 },
    'linkedin-ad': { width: 1200, height: 628 },
    'linkedin-cover': { width: 1584, height: 396 },
    'twitter-post': { width: 1600, height: 900 },
    'twitter-ad': { width: 1200, height: 675 },
    'twitter-cover': { width: 1500, height: 500 },
    'tiktok-post': { width: 768, height: 1360 },
    'tiktok-ad': { width: 768, height: 1360 },
    'google_ads-display': { width: 1200, height: 628 },
    'google_ads-square': { width: 1200, height: 1200 },
    'google_ads-skyscraper': { width: 600, height: 1200 },
  };
  return specs[`${platform}-${contentType}`] || { width: 1024, height: 1024 };
}

// Leonardo preset styles for different moods
export const LEONARDO_PRESETS = {
  CINEMATIC: 'Dramatic, movie-like quality',
  CREATIVE: 'Artistic and unique',
  DYNAMIC: 'Energetic and engaging',
  ENVIRONMENT: 'Landscapes and spaces',
  GENERAL: 'Balanced, versatile',
  ILLUSTRATION: 'Illustrated, artistic',
  PHOTOGRAPHY: 'Photorealistic',
  RAYTRACED: '3D rendered look',
  RENDER_3D: '3D graphics style',
  SKETCH_BW: 'Black and white sketch',
  SKETCH_COLOR: 'Colored sketch',
};

// Recommended models for marketing
export const LEONARDO_MARKETING_MODELS = {
  PHOENIX: {
    id: '6b645e3a-d64f-4341-a6d8-7a3690fbf042',
    name: 'Leonardo Phoenix',
    description: 'Best for marketing - Fast, versatile, high quality',
  },
  KINO_XL: {
    id: 'aa77f04e-3eec-4034-9c07-d0f619684628',
    name: 'Leonardo Kino XL',
    description: 'Cinematic, dramatic visuals',
  },
  VISION_XL: {
    id: '5c232a9e-9061-4777-980a-ddc8e65647c6',
    name: 'Leonardo Vision XL',
    description: 'Creative, artistic output',
  },
  DIFFUSION_XL: {
    id: '1e60896f-3c26-4296-8ecc-53e2afecc132',
    name: 'Leonardo Diffusion XL',
    description: 'Balanced quality and speed',
  },
};

export default {
  // Prompt generation
  generateImagePrompt,
  
  // DALL-E
  generateWithDallE,
  
  // Leonardo.ai
  generateWithLeonardo,
  getLeonardoGenerationStatus,
  waitForLeonardoGeneration,
  getLeonardoModels,
  getLeonardoCustomModels,
  getLeonardoElements,
  trainLeonardoModel,
  leonardoImageToImage,
  upscaleWithLeonardo,
  removeBackgroundWithLeonardo,
  getLeonardoHistory,
  getLeonardoCredits,
  
  // Combined
  generateSocialMediaCreative,
  createBrandStyle,
  
  // Constants
  LEONARDO_PRESETS,
  LEONARDO_MARKETING_MODELS,
};
