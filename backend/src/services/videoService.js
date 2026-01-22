import { generateContentWithSystem } from './claude.js';
import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * Video Generation Service
 * 
 * Integrates with:
 * - HeyGen API for AI avatar videos
 * - ElevenLabs for voiceover generation
 */

const HEYGEN_API_URL = 'https://api.heygen.com/v2';
const HEYGEN_V1_API_URL = 'https://api.heygen.com/v1';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// ============================================
// VIDEO SCRIPT GENERATION (Claude)
// ============================================

/**
 * Generate a video script optimized for AI avatars
 */
export async function generateVideoScript(projectData, clientData = {}, duration = 60) {
  const keywords = projectData.keywords || [];
  const primaryKeyword = keywords[0] || 'topic';
  const targetAudience = projectData.target_audience || clientData.target_audience || '';
  const brandTone = clientData.brand_tone || 'professional';

  const durationText = duration <= 30 ? '15-30 seconds' : 
                       duration <= 60 ? '45-60 seconds' :
                       duration <= 90 ? '75-90 seconds' :
                       duration <= 120 ? '100-120 seconds' : '150-180 seconds';

  // Build comprehensive context for SEO and conversion optimization
  const companyName = clientData.company_name || 'Our company';
  const industry = clientData.industry || '';
  const location = clientData.location || '';
  const uniqueSellingPoints = clientData.unique_selling_points || '';
  const brandVoice = clientData.brand_voice || '';
  const services = projectData.project_types || [];
  const competitors = clientData.competitors || [];
  
  // Extract local keywords and service-specific terms
  const localKeywords = location ? [location, ...(location.split(',').map(l => l.trim()))] : [];
  const serviceKeywords = services.length > 0 ? services : (keywords.length > 1 ? keywords.slice(1) : []);
  
  const systemPrompt = `You are a professional video scriptwriter and conversion copywriter for AI avatar videos. 
Create highly effective, SEO-optimized scripts that drive conversions while working naturally with AI avatars.

CRITICAL RULES:
- Write ONLY the spoken words - no labels, markers, or instructions
- Write conversationally, as if speaking directly to the viewer
- Use short sentences (10-15 words max)
- Use periods and commas to create natural pauses - DO NOT use [PAUSE] or any brackets
- Avoid complex words that AI avatars struggle with
- No tongue-twisters or alliteration
- Keep total length ${durationText}
- Make it sound human and engaging, not robotic
- DO NOT include any formatting like "Title:", "Hook:", "Script:", bullet points, or numbering
- The script field should contain ONLY what the avatar will say aloud

CONTENT QUALITY REQUIREMENTS:
- Include LOCAL SEO keywords naturally (location names, suburbs, regions)
- Include SERVICE-SPECIFIC keywords (specific services offered)
- Highlight UNIQUE VALUE PROPOSITION (what makes this company different)
- Add SOCIAL PROOF elements (testimonials, ratings, client count)
- Include SPECIFIC BENEFITS (concrete advantages, not generic statements)
- Add EMOTIONAL HOOK in first 5 seconds
- Include STRONG CALL-TO-ACTION (specific, action-oriented)
- Use CONVERSION-OPTIMIZED language (benefits-focused, not feature-focused)`;

  const userPrompt = `Create a highly effective, conversion-focused video script for: ${companyName}

PRIMARY TOPIC: "${primaryKeyword}"
INDUSTRY: ${industry}
${location ? `LOCATION: ${location}` : ''}
${services.length > 0 ? `SERVICES: ${services.join(', ')}` : ''}
${uniqueSellingPoints ? `UNIQUE SELLING POINTS: ${uniqueSellingPoints}` : ''}
TARGET AUDIENCE: ${targetAudience || 'General business audience'}
BRAND VOICE: ${brandVoice || brandTone}
DURATION: ${durationText}

CRITICAL REQUIREMENTS - MUST INCLUDE:

1. LOCAL SEO OPTIMIZATION:
   ${localKeywords.length > 0 ? `- Naturally include these location keywords: ${localKeywords.join(', ')}` : '- Include location-specific terms if applicable'}
   - Mention local market expertise
   - Reference specific suburbs/regions served

2. SERVICE-SPECIFIC KEYWORDS:
   ${serviceKeywords.length > 0 ? `- Include these services naturally: ${serviceKeywords.join(', ')}` : '- Include specific service types'}
   - Mention specific offerings
   - Use industry-specific terminology

3. UNIQUE VALUE PROPOSITION:
   ${uniqueSellingPoints ? `- Highlight: ${uniqueSellingPoints}` : '- Differentiate from competitors'}
   - Show what makes this company special
   - Mention specific strengths or achievements

4. SOCIAL PROOF:
   - Include client count, ratings, or testimonials (if applicable)
   - Reference years of experience or expertise
   - Mention awards or recognition (if applicable)

5. SPECIFIC BENEFITS:
   - Use concrete benefits (e.g., "15% more for your property", "Sell in 23 days average")
   - Include specific numbers or metrics
   - Show clear value to the viewer

6. EMOTIONAL HOOK (First 5 seconds):
   - Start with an emotional or benefit-driven statement
   - Create immediate connection with viewer
   - Address a pain point or desire

7. STRONG CALL-TO-ACTION:
   - Specific action (e.g., "Call us on [number]", "Visit [website]", "Book your free consultation")
   - Create urgency if appropriate
   - Make it easy to act

Create a script with this structure:
- HOOK (emotional, benefit-driven, 5-10 seconds)
- PROBLEM (what viewers struggle with)
- SOLUTION (what ${companyName} offers)
- SOCIAL PROOF (why choose us)
- BENEFITS (specific advantages)
- CALL TO ACTION (specific next step)

IMPORTANT: The "script" field must contain ONLY the exact words to be spoken. No labels, no markers, no formatting - just natural speech that incorporates all the SEO and conversion elements above naturally.

Format the output as JSON:
{
  "title": "Video title for internal reference",
  "hook": "Opening hook line",
  "script": "The complete spoken script. Just natural sentences with periods and commas for pauses. No labels or markers.",
  "duration_estimate": "${durationText}",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "call_to_action": "CTA text",
  "thumbnail_suggestion": "Suggested thumbnail description",
  "background_music_mood": "upbeat/calm/professional/inspiring"
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    // Try to extract JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        console.error('Response snippet:', response.substring(0, 500));
        // Try to find JSON with more flexible matching
        jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                    response.match(/```\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (e) {
            console.error('Second JSON parse attempt failed:', e.message);
          }
        }
      }
    }
    
    // Fallback: return structured response even if JSON parsing fails
    return {
      title: `Video: ${primaryKeyword}`,
      hook: response.split('\n')[0] || `Learn about ${primaryKeyword}`,
      script: response,
      duration_estimate: durationText,
      key_points: response.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./)).slice(0, 5),
      call_to_action: `Learn more about ${primaryKeyword}`,
      thumbnail_suggestion: `Professional video thumbnail for ${primaryKeyword}`,
      background_music_mood: 'professional',
    };
  } catch (error) {
    console.error('Error generating video script:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to generate video script: ${error.message}`);
  }
}

// ============================================
// SCRIPT CLEANING FUNCTIONS
// ============================================

/**
 * Clean script text for HeyGen - remove formatting labels and stage directions
 * HeyGen reads everything literally, so we need to remove:
 * - [PAUSE], [INTRO], [MAIN POINTS], [CALL TO ACTION], etc.
 * - Labels like "Title:", "Hook:", "Script:", etc.
 * - Asterisks, bullet points, numbering
 */
function cleanScriptForHeyGen(script) {
  if (!script) return '';
  
  let cleaned = script
    // Remove bracketed instructions like [PAUSE], [INTRO], [CTA], etc.
    .replace(/\[([^\]]+)\]/g, '')
    // Remove labels like "Title:", "Hook:", "Script:", "Main Points:", etc.
    .replace(/^(Title|Hook|Script|Main Points?|Call to Action|CTA|Introduction|Conclusion|Key Points?|Point \d+|Section \d+)\s*[:：]/gim, '')
    // Remove asterisks (bold markers)
    .replace(/\*+/g, '')
    // Remove bullet points and dashes at start of lines
    .replace(/^[\s]*[-•●◦▪▸►]\s*/gm, '')
    // Remove numbered lists (1., 2., etc.)
    .replace(/^[\s]*\d+[\.\)]\s*/gm, '')
    // Remove multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Remove multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ')
    // Final cleanup
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  return cleaned;
}

// ============================================
// HEYGEN API FUNCTIONS
// ============================================

/**
 * Create video with HeyGen API
 */
export async function createHeyGenVideo(script, options = {}) {
  const {
    avatarId = 'default',
    voiceId = 'default',
    apiKey,
    background = { type: 'color', value: '#ffffff' },
    dimension = { width: 1920, height: 1080 },
  } = options;

  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  // Clean the script - remove formatting labels and stage directions
  const cleanedScript = cleanScriptForHeyGen(script);
  
  console.log('Original script length:', script?.length || 0);
  console.log('Cleaned script length:', cleanedScript?.length || 0);
  console.log('Cleaned script preview:', cleanedScript?.substring(0, 200) + '...');

  try {
    // Use V2 /video/generate endpoint (correct endpoint format)
    const url = `${HEYGEN_API_URL}/video/generate`;
    const requestBody = {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: cleanedScript,  // Use cleaned script
          voice_id: voiceId,
        },
        background: { type: 'color', value: '#ffffff' },
      }],
      dimension: { width: 1280, height: 720 },  // 720p - supported by standard HeyGen plans
    };
    
    console.log('HeyGen API Request:', {
      url,
      avatar_id: avatarId,
      voice_id: voiceId,
      script_length: script?.length || 0,
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('HeyGen API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'HeyGen API error';
      
      try {
        const error = JSON.parse(text);
        // Handle nested error objects
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.code) {
            errorMessage = `${error.error.code}: ${error.error.message || 'HeyGen API error'}`;
          } else {
            errorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          errorMessage = error.message;
          // Add helpful context for voice-related errors
          if (errorMessage.includes('Voice not found')) {
            errorMessage += '. Note: HeyGen requires its own voice IDs, not ElevenLabs voice IDs. Please either: 1) Use HeyGen voices for video creation, or 2) Configure ElevenLabs voices in your HeyGen account settings first.';
          }
        } else if (error.code) {
          errorMessage = `${error.code}: ${error.message || 'HeyGen API error'}`;
        }
        console.error('HeyGen API error response:', JSON.stringify(error, null, 2));
      } catch (e) {
        console.error('HeyGen API returned non-JSON:', text.substring(0, 500));
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          errorMessage = 'HeyGen API returned HTML instead of JSON. This usually means the API key is invalid or the endpoint URL is incorrect. Please check your HeyGen API key in Admin Setup.';
        } else {
          errorMessage = `HeyGen API returned: ${text.substring(0, 200)}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('HeyGen video creation response:', JSON.stringify(data, null, 2));
    
    // V2 API returns data.video_id directly, V1 returns data.data.video_id
    const videoId = data.video_id || data.data?.video_id || data.video?.video_id;
    
    if (!videoId) {
      console.error('No video_id in response:', JSON.stringify(data, null, 2));
      throw new Error('HeyGen API did not return a video_id. Response: ' + JSON.stringify(data));
    }
    
    return {
      video_id: videoId,
      status: data.status || data.data?.status || 'processing',
      message: 'Video generation started',
    };
  } catch (error) {
    console.error('Error creating HeyGen video:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to create video: ${error.message}`);
  }
}

/**
 * Check HeyGen video status
 */
export async function checkHeyGenVideoStatus(videoId, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    // Try V2 API first
    let response = await fetch(`${HEYGEN_API_URL}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    let text = await response.text();
    let data;

    // If V2 fails, try V1
    if (!response.ok) {
      console.log('V2 video status endpoint failed, trying V1...');
      response = await fetch(`${HEYGEN_V1_API_URL}/video_status.get?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
        },
      });
      text = await response.text();
    }

    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || error.error?.message || 'HeyGen API error');
      } catch (e) {
        throw new Error(`HeyGen API error: ${text.substring(0, 200)}`);
      }
    }

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('HeyGen API returned non-JSON response:', text.substring(0, 200));
      throw new Error('HeyGen API returned invalid response');
    }
    
    console.log('HeyGen video status response:', JSON.stringify(data, null, 2));
    
    // V2 returns data directly, V1 returns data.data
    const videoData = data.data || data;
    
    return {
      video_id: videoId,
      status: videoData.status || videoData.video_status || 'unknown',
      video_url: videoData.video_url || videoData.url,
      thumbnail_url: videoData.thumbnail_url || videoData.thumbnail,
      duration: videoData.duration,
    };
  } catch (error) {
    console.error('Error checking video status:', error);
    throw new Error(`Failed to check video status: ${error.message}`);
  }
}

/**
 * Get available HeyGen avatars
 */
export async function getHeyGenAvatars(apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    // Try V2 API first (recommended)
    let response = await fetch(`${HEYGEN_API_URL}/avatars`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    let text = await response.text();
    let data;
    
    // If V2 fails, try V1
    if (!response.ok) {
      console.log('V2 avatars endpoint failed, trying V1...');
      response = await fetch(`${HEYGEN_V1_API_URL}/avatars`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json',
        },
      });
      text = await response.text();
    }
    
    // Check if response is JSON
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('HeyGen API returned non-JSON response:', text.substring(0, 200));
      throw new Error('HeyGen API returned invalid response. Please check your API key.');
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error?.message || data.error || 'HeyGen API error';
      throw new Error(errorMsg);
    }
    
    // V2 returns data.avatars, V1 returns data.data.avatars
    return data.avatars || data.data?.avatars || [];
  } catch (error) {
    console.error('Error getting avatars:', error);
    throw new Error(`Failed to get avatars: ${error.message}`);
  }
}

/**
 * Get HeyGen voices
 */
export async function getHeyGenVoices(apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    // Try V2 API first (recommended)
    let response = await fetch(`${HEYGEN_API_URL}/voices`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    let text = await response.text();
    let data;
    
    // Check if V2 returned HTML (404 page)
    if (!response.ok || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.log('V2 voices endpoint failed or returned HTML, trying V1...');
      response = await fetch(`${HEYGEN_V1_API_URL}/voices`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json',
        },
      });
      text = await response.text();
    }
    
    // Check if response is JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('HeyGen API returned HTML instead of JSON:', text.substring(0, 300));
      throw new Error('HeyGen voices endpoint returned HTML. The endpoint may not be available or the API key may be invalid.');
    }
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('HeyGen API returned non-JSON response:', text.substring(0, 200));
      throw new Error('HeyGen API returned invalid response. Please check your API key.');
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error?.message || data.error || 'HeyGen API error';
      throw new Error(errorMsg);
    }
    
    // V2 returns data.voices, V1 returns data.data.voices
    return data.voices || data.data?.voices || [];
  } catch (error) {
    console.error('Error getting HeyGen voices:', error);
    throw new Error(`Failed to get voices: ${error.message}`);
  }
}

/**
 * Create custom avatar from photo (Talking Photo)
 */
export async function createCustomAvatarFromPhoto(imageBuffer, name, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, { filename: 'avatar.jpg', contentType: 'image/jpeg' });

    // First, upload the image
    const uploadResponse = await fetch(`${HEYGEN_V1_API_URL}/talking_photo`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.message || 'Failed to upload photo');
    }

    const data = await uploadResponse.json();
    
    return {
      talking_photo_id: data.data?.talking_photo_id,
      status: 'ready',
      message: 'Talking photo avatar created',
    };
  } catch (error) {
    console.error('Error creating avatar from photo:', error);
    throw new Error(`Failed to create avatar: ${error.message}`);
  }
}

/**
 * Create custom avatar from video (for training)
 */
export async function createCustomAvatarFromVideo(videoBuffer, name, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const formData = new FormData();
    formData.append('file', videoBuffer, { filename: 'training.mp4', contentType: 'video/mp4' });
    formData.append('name', name);

    const response = await fetch(`${HEYGEN_API_URL}/avatar/create`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create avatar');
    }

    const data = await response.json();
    
    return {
      avatar_id: data.data?.avatar_id,
      status: 'training',
      message: 'Avatar training started. This may take 2-5 minutes.',
    };
  } catch (error) {
    console.error('Error creating avatar from video:', error);
    throw new Error(`Failed to create avatar: ${error.message}`);
  }
}

/**
 * Check avatar training status
 */
export async function checkAvatarTrainingStatus(avatarId, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const response = await fetch(`${HEYGEN_V1_API_URL}/avatar/${avatarId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'HeyGen API error');
    }

    const data = await response.json();
    
    return {
      avatar_id: avatarId,
      status: data.data?.status,
      preview_url: data.data?.preview_url,
    };
  } catch (error) {
    console.error('Error checking avatar status:', error);
    throw new Error(`Failed to check avatar status: ${error.message}`);
  }
}

/**
 * Get HeyGen templates
 */
export async function getHeyGenTemplates(apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const response = await fetch(`${HEYGEN_V1_API_URL}/templates`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'HeyGen API error');
    }

    const data = await response.json();
    
    return data.data?.templates || [];
  } catch (error) {
    console.error('Error getting templates:', error);
    throw new Error(`Failed to get templates: ${error.message}`);
  }
}

/**
 * Create video from template
 */
export async function createVideoFromTemplate(templateId, variables, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const response = await fetch(`${HEYGEN_API_URL}/template/${templateId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        test: false,
        variables,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'HeyGen API error');
    }

    const data = await response.json();
    
    return {
      video_id: data.data?.video_id,
      status: 'processing',
    };
  } catch (error) {
    console.error('Error creating video from template:', error);
    throw new Error(`Failed to create video: ${error.message}`);
  }
}

/**
 * List all generated videos
 */
export async function listHeyGenVideos(apiKey, limit = 100) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const response = await fetch(`${HEYGEN_V1_API_URL}/video.list?limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'HeyGen API error');
    }

    const data = await response.json();
    
    return data.data?.videos || [];
  } catch (error) {
    console.error('Error listing videos:', error);
    throw new Error(`Failed to list videos: ${error.message}`);
  }
}

/**
 * Delete a HeyGen video
 */
export async function deleteHeyGenVideo(videoId, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const response = await fetch(`${HEYGEN_V1_API_URL}/video/${videoId}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'HeyGen API error');
    }

    return { success: true, message: 'Video deleted' };
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error(`Failed to delete video: ${error.message}`);
  }
}

// ============================================
// ELEVENLABS API FUNCTIONS
// ============================================

/**
 * Generate voiceover with ElevenLabs
 */
export async function generateVoiceover(text, options = {}) {
  const {
    voiceId = '21m00Tcm4TlvDq8ikWAM', // Default: Rachel
    apiKey,
    modelId = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0,
    useSpeakerBoost = true,
  } = options;

  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    const audioBuffer = await response.arrayBuffer();
    
    return {
      audio: audioBuffer,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('Error generating voiceover:', error);
    throw new Error(`Failed to generate voiceover: ${error.message}`);
  }
}

/**
 * Generate voiceover with streaming
 */
export async function generateVoiceoverStream(text, options = {}) {
  const {
    voiceId = '21m00Tcm4TlvDq8ikWAM',
    apiKey,
    modelId = 'eleven_monolingual_v1',
  } = options;

  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return response.body; // Returns stream
  } catch (error) {
    console.error('Error generating voiceover stream:', error);
    throw new Error(`Failed to generate voiceover: ${error.message}`);
  }
}

/**
 * Get available ElevenLabs voices
 */
export async function getElevenLabsVoices(apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    const data = await response.json();
    
    return data.voices || [];
  } catch (error) {
    console.error('Error getting voices:', error);
    throw new Error(`Failed to get voices: ${error.message}`);
  }
}

/**
 * Get voice details
 */
export async function getVoiceDetails(voiceId, apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting voice details:', error);
    throw new Error(`Failed to get voice details: ${error.message}`);
  }
}

/**
 * Clone voice from audio samples
 */
export async function cloneVoice(name, description, audioFiles, apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    audioFiles.forEach((file, index) => {
      formData.append('files', file, { filename: `sample${index}.mp3` });
    });

    const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    const data = await response.json();
    
    return {
      voice_id: data.voice_id,
      name: data.name,
      message: 'Voice cloned successfully',
    };
  } catch (error) {
    console.error('Error cloning voice:', error);
    throw new Error(`Failed to clone voice: ${error.message}`);
  }
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId, apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return { success: true, message: 'Voice deleted' };
  } catch (error) {
    console.error('Error deleting voice:', error);
    throw new Error(`Failed to delete voice: ${error.message}`);
  }
}

/**
 * Get ElevenLabs models
 */
export async function getElevenLabsModels(apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/models`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting models:', error);
    throw new Error(`Failed to get models: ${error.message}`);
  }
}

/**
 * Generate sound effects
 */
export async function generateSoundEffect(text, durationSeconds, apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/sound-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        duration_seconds: durationSeconds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    const audioBuffer = await response.arrayBuffer();
    
    return {
      audio: audioBuffer,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('Error generating sound effect:', error);
    throw new Error(`Failed to generate sound effect: ${error.message}`);
  }
}

/**
 * Get user subscription info
 */
export async function getElevenLabsSubscription(apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw new Error(`Failed to get subscription: ${error.message}`);
  }
}

/**
 * Get character usage
 */
export async function getElevenLabsUsage(apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting usage:', error);
    throw new Error(`Failed to get usage: ${error.message}`);
  }
}

/**
 * Get history of generated audio
 */
export async function getElevenLabsHistory(apiKey, pageSize = 100) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/history?page_size=${pageSize}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting history:', error);
    throw new Error(`Failed to get history: ${error.message}`);
  }
}

/**
 * Download history item audio
 */
export async function downloadHistoryAudio(historyItemId, apiKey) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/history/${historyItemId}/audio`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs API error');
    }

    const audioBuffer = await response.arrayBuffer();
    
    return {
      audio: audioBuffer,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw new Error(`Failed to download audio: ${error.message}`);
  }
}

export default {
  // Script generation
  generateVideoScript,
  
  // HeyGen
  createHeyGenVideo,
  checkHeyGenVideoStatus,
  getHeyGenAvatars,
  getHeyGenVoices,
  createCustomAvatarFromPhoto,
  createCustomAvatarFromVideo,
  checkAvatarTrainingStatus,
  getHeyGenTemplates,
  createVideoFromTemplate,
  listHeyGenVideos,
  deleteHeyGenVideo,
  
  // ElevenLabs
  generateVoiceover,
  generateVoiceoverStream,
  getElevenLabsVoices,
  getVoiceDetails,
  cloneVoice,
  deleteVoice,
  getElevenLabsModels,
  generateSoundEffect,
  getElevenLabsSubscription,
  getElevenLabsUsage,
  getElevenLabsHistory,
  downloadHistoryAudio,
};
