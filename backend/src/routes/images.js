import express from 'express';
import {
  generateImagePrompt,
  generateWithDallE,
  generateWithLeonardo,
  getLeonardoGenerationStatus,
  waitForLeonardoGeneration,
  getLeonardoModels,
  getLeonardoElements,
  leonardoImageToImage,
  upscaleWithLeonardo,
  removeBackgroundWithLeonardo,
  getLeonardoCredits,
  generateSocialMediaCreative,
  createBrandStyle,
  LEONARDO_MARKETING_MODELS,
  LEONARDO_PRESETS,
} from '../services/imageService.js';
import { getSetting, getClientById, updateClient } from '../db/queries.js';
import { query } from '../db/index.js';

const router = express.Router();

/**
 * Generate marketing image prompt
 * POST /api/images/generate-prompt
 */
router.post('/generate-prompt', async (req, res) => {
  try {
    const { requirements, clientId } = req.body;

    // Get client brand style if provided
    let clientBrandStyle = {};
    if (clientId) {
      const client = await getClientById(clientId);
      if (client?.brand_style) {
        clientBrandStyle = typeof client.brand_style === 'string' 
          ? JSON.parse(client.brand_style) 
          : client.brand_style;
      }
    }

    const promptData = await generateImagePrompt(requirements, clientBrandStyle);

    res.json({
      success: true,
      data: promptData,
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate image with DALL-E 3
 * POST /api/images/generate/dalle
 */
router.post('/generate/dalle', async (req, res) => {
  try {
    const { prompt, size, quality, style } = req.body;

    const openaiApiKey = await getSetting('openai_api_key');
    if (!openaiApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key not configured. Please add it in Admin Setup.',
      });
    }

    const result = await generateWithDallE(prompt, {
      apiKey: openaiApiKey.setting_value,
      size: size || '1024x1024',
      quality: quality || 'hd',
      style: style || 'vivid',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating with DALL-E:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate image with Leonardo.ai
 * POST /api/images/generate/leonardo
 */
router.post('/generate/leonardo', async (req, res) => {
  try {
    const { 
      prompt, 
      modelId, 
      width, 
      height, 
      numImages,
      negativePrompt,
      presetStyle,
      photoReal,
      alchemy,
      elementIds,
      clientId,
    } = req.body;

    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured. Please add it in Admin Setup.',
      });
    }

    // Get client brand style if provided
    let brandOptions = {};
    if (clientId) {
      const client = await getClientById(clientId);
      if (client?.brand_style) {
        brandOptions = typeof client.brand_style === 'string' 
          ? JSON.parse(client.brand_style) 
          : client.brand_style;
      }
    }

    const result = await generateWithLeonardo(prompt, {
      apiKey: leonardoApiKey.setting_value,
      modelId: modelId || brandOptions.modelId || LEONARDO_MARKETING_MODELS.PHOENIX.id,
      width: width || 1024,
      height: height || 1024,
      numImages: numImages || 4,
      negativePrompt: negativePrompt || brandOptions.negativePrompt,
      presetStyle: presetStyle || brandOptions.stylePreset || 'DYNAMIC',
      photoReal: photoReal !== false,
      alchemy: alchemy !== false,
      elementIds: elementIds || brandOptions.elementIds || [],
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating with Leonardo:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Check Leonardo generation status
 * GET /api/images/leonardo/status/:generationId
 */
router.get('/leonardo/status/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;

    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    const status = await getLeonardoGenerationStatus(generationId, leonardoApiKey.setting_value);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate and wait for completion (synchronous)
 * POST /api/images/generate/leonardo/sync
 */
router.post('/generate/leonardo/sync', async (req, res) => {
  try {
    const { prompt, modelId, width, height, numImages, negativePrompt, presetStyle, clientId } = req.body;

    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured. Please add it in Admin Setup.',
      });
    }

    // Get client brand style if provided
    let brandOptions = {};
    if (clientId) {
      const client = await getClientById(clientId);
      if (client?.brand_style) {
        brandOptions = typeof client.brand_style === 'string' 
          ? JSON.parse(client.brand_style) 
          : client.brand_style;
      }
    }

    // Start generation
    const genResult = await generateWithLeonardo(prompt, {
      apiKey: leonardoApiKey.setting_value,
      modelId: modelId || brandOptions.modelId || LEONARDO_MARKETING_MODELS.PHOENIX.id,
      width: width || 1024,
      height: height || 1024,
      numImages: numImages || 4,
      negativePrompt: negativePrompt || brandOptions.negativePrompt,
      presetStyle: presetStyle || brandOptions.stylePreset || 'DYNAMIC',
      photoReal: true,
      alchemy: true,
      elementIds: brandOptions.elementIds || [],
    });

    // Wait for completion
    const result = await waitForLeonardoGeneration(
      genResult.generationId,
      leonardoApiKey.setting_value,
      120000 // 2 minute timeout
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating with Leonardo:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate complete social media creative
 * POST /api/images/generate/social
 */
router.post('/generate/social', async (req, res) => {
  try {
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
      preferredApi,
      numVariations,
      clientId,
    } = req.body;

    // Get API keys
    const [openaiKey, leonardoKey] = await Promise.all([
      getSetting('openai_api_key'),
      getSetting('leonardo_api_key'),
    ]);

    const apiKeys = {
      openai: openaiKey?.setting_value,
      leonardo: leonardoKey?.setting_value,
    };

    if (!apiKeys.leonardo && preferredApi !== 'dalle') {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured. Please add it in Admin Setup.',
      });
    }

    if (!apiKeys.openai && preferredApi === 'dalle') {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key not configured. Please add it in Admin Setup.',
      });
    }

    // Get client brand style
    let clientBrandStyle = {};
    if (clientId) {
      const client = await getClientById(clientId);
      if (client?.brand_style) {
        clientBrandStyle = typeof client.brand_style === 'string' 
          ? JSON.parse(client.brand_style) 
          : client.brand_style;
      }
    }

    const result = await generateSocialMediaCreative(
      {
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
        preferredApi: preferredApi || 'leonardo',
        numVariations: numVariations || 4,
      },
      apiKeys,
      clientBrandStyle
    );

    // Save to database
    const contentData = {
      title: `${platform} ${contentType} - ${topic || 'Social Creative'}`,
      content: JSON.stringify({
        images: result.images || [],
        prompt: result.prompt,
        platform,
        contentType,
        style,
        provider: result.provider || 'leonardo',
      }),
      meta_description: `Generated ${numVariations || 4} ${platform} ${contentType} images`,
    };

    const dbResult = await query(
      `INSERT INTO content (
        project_id, content_type, title, content, 
        meta_description, platform, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        projectId,
        'social_creative',
        contentData.title,
        contentData.content,
        contentData.meta_description,
        platform,
        'ready',
      ]
    );

    res.json({
      success: true,
      data: {
        ...result,
        id: dbResult.rows[0].id,
        saved: true,
      },
    });
  } catch (error) {
    console.error('Error generating social creative:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get available Leonardo models
 * GET /api/images/leonardo/models
 */
router.get('/leonardo/models', async (req, res) => {
  try {
    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    const models = await getLeonardoModels(leonardoApiKey.setting_value);

    res.json({
      success: true,
      data: {
        platformModels: models,
        recommendedModels: LEONARDO_MARKETING_MODELS,
      },
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get available style elements
 * GET /api/images/leonardo/elements
 */
router.get('/leonardo/elements', async (req, res) => {
  try {
    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    const elements = await getLeonardoElements(leonardoApiKey.setting_value);

    res.json({
      success: true,
      data: elements,
    });
  } catch (error) {
    console.error('Error getting elements:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get presets list
 * GET /api/images/presets
 */
router.get('/presets', (req, res) => {
  res.json({
    success: true,
    data: {
      presets: LEONARDO_PRESETS,
      models: LEONARDO_MARKETING_MODELS,
    },
  });
});

/**
 * Image to Image (variations)
 * POST /api/images/leonardo/img2img
 */
router.post('/leonardo/img2img', async (req, res) => {
  try {
    const { imageUrl, prompt, strength, width, height, clientId } = req.body;

    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    let brandOptions = {};
    if (clientId) {
      const client = await getClientById(clientId);
      if (client?.brand_style) {
        brandOptions = typeof client.brand_style === 'string' 
          ? JSON.parse(client.brand_style) 
          : client.brand_style;
      }
    }

    const result = await leonardoImageToImage(imageUrl, prompt, {
      apiKey: leonardoApiKey.setting_value,
      strength: strength || 0.45,
      width: width || 1024,
      height: height || 1024,
      modelId: brandOptions.modelId,
    });

    // Wait for completion
    const finalResult = await waitForLeonardoGeneration(
      result.generationId,
      leonardoApiKey.setting_value
    );

    res.json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error('Error with img2img:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Upscale image
 * POST /api/images/leonardo/upscale
 */
router.post('/leonardo/upscale', async (req, res) => {
  try {
    const { imageId } = req.body;

    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    const result = await upscaleWithLeonardo(imageId, leonardoApiKey.setting_value);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error upscaling:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Remove background
 * POST /api/images/leonardo/remove-bg
 */
router.post('/leonardo/remove-bg', async (req, res) => {
  try {
    const { imageId } = req.body;

    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    const result = await removeBackgroundWithLeonardo(imageId, leonardoApiKey.setting_value);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error removing background:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get API credits/usage
 * GET /api/images/leonardo/credits
 */
router.get('/leonardo/credits', async (req, res) => {
  try {
    const leonardoApiKey = await getSetting('leonardo_api_key');
    if (!leonardoApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Leonardo.ai API key not configured',
      });
    }

    const credits = await getLeonardoCredits(leonardoApiKey.setting_value);

    res.json({
      success: true,
      data: credits,
    });
  } catch (error) {
    console.error('Error getting credits:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Save brand style for a client
 * POST /api/images/brand-style/:clientId
 */
router.post('/brand-style/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const brandStyleOptions = req.body;

    const brandStyle = createBrandStyle(brandStyleOptions);

    // Update client with brand style
    await query(
      `UPDATE clients SET brand_style = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(brandStyle), clientId]
    );

    res.json({
      success: true,
      data: {
        clientId,
        brandStyle,
        message: 'Brand style saved. All future image generations will use these settings.',
      },
    });
  } catch (error) {
    console.error('Error saving brand style:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get brand style for a client
 * GET /api/images/brand-style/:clientId
 */
router.get('/brand-style/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await getClientById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const brandStyle = client.brand_style 
      ? (typeof client.brand_style === 'string' ? JSON.parse(client.brand_style) : client.brand_style)
      : null;

    res.json({
      success: true,
      data: brandStyle,
    });
  } catch (error) {
    console.error('Error getting brand style:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

