import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET /api/settings - Get all settings (masked for secrets)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        setting_key, 
        CASE WHEN is_secret AND setting_value != '' THEN '••••••••' ELSE setting_value END as setting_value,
        setting_type,
        category,
        description,
        is_secret,
        updated_at
      FROM system_settings 
      ORDER BY category, setting_key
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/settings/category/:category - Get settings by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(`
      SELECT 
        id, 
        setting_key, 
        CASE WHEN is_secret AND setting_value != '' THEN '••••••••' ELSE setting_value END as setting_value,
        setting_type,
        category,
        description,
        is_secret,
        updated_at
      FROM system_settings 
      WHERE category = $1
      ORDER BY setting_key
    `, [category]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching settings by category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/settings/:key - Update a setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const result = await pool.query(`
      UPDATE system_settings 
      SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = $2
      RETURNING id, setting_key, 
        CASE WHEN is_secret THEN '••••••••' ELSE setting_value END as setting_value,
        setting_type, category, description, is_secret, updated_at
    `, [value, key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/settings - Bulk update settings
router.put('/', async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value }
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, error: 'Settings must be an array' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const setting of settings) {
        if (setting.value !== undefined && setting.value !== '••••••••') {
          await client.query(`
            UPDATE system_settings 
            SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
            WHERE setting_key = $2
          `, [setting.value, setting.key]);
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch updated settings
      const result = await pool.query(`
        SELECT 
          id, 
          setting_key, 
          CASE WHEN is_secret AND setting_value != '' THEN '••••••••' ELSE setting_value END as setting_value,
          setting_type,
          category,
          description,
          is_secret,
          updated_at
        FROM system_settings 
        ORDER BY category, setting_key
      `);
      
      res.json({
        success: true,
        data: result.rows,
        message: 'Settings updated successfully'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/test/:key - Test an API connection
router.post('/test/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    // Get the actual value from database
    const result = await pool.query(`
      SELECT setting_value FROM system_settings WHERE setting_key = $1
    `, [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    
    const apiKey = result.rows[0].setting_value;
    
    if (!apiKey) {
      return res.json({ 
        success: false, 
        message: 'API key not configured' 
      });
    }
    
    // Test different APIs
    let testResult = { success: false, message: 'Unknown API' };
    
    if (key === 'anthropic_api_key') {
      // Test Claude API
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        const client = new Anthropic({ apiKey });
        
        // Get model from settings
        const modelResult = await pool.query(`
          SELECT setting_value FROM system_settings WHERE setting_key = 'claude_model'
        `);
        const model = modelResult.rows[0]?.setting_value || 'claude-3-haiku-20240307';
        
        const message = await client.messages.create({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say "OK"' }]
        });
        testResult = { success: true, message: `Connected! Model: ${model}` };
      } catch (err) {
        testResult = { success: false, message: `Claude API error: ${err.message}` };
      }
    } else if (key === 'heygen_api_key') {
      // Test HeyGen API (just check if key format is valid)
      testResult = apiKey.length > 10 
        ? { success: true, message: 'API key format valid (full test requires video generation)' }
        : { success: false, message: 'API key too short' };
    } else if (key === 'elevenlabs_api_key') {
      // Test ElevenLabs API
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': apiKey }
        });
        testResult = response.ok 
          ? { success: true, message: 'Connected to ElevenLabs!' }
          : { success: false, message: `ElevenLabs error: ${response.status}` };
      } catch (err) {
        testResult = { success: false, message: `ElevenLabs error: ${err.message}` };
      }
    } else {
      testResult = { 
        success: true, 
        message: 'API key saved (connection test not available for this API)' 
      };
    }
    
    res.json(testResult);
  } catch (error) {
    console.error('Error testing API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

