import express from 'express';
import { generateLocalSeoAnalysis, generateLocalSchemaMarkup } from '../services/localSeoService.js';
import pool from '../db/index.js';

const router = express.Router();

/**
 * POST /api/local-seo/analyze
 * Generate comprehensive local SEO analysis
 */
router.post('/analyze', async (req, res) => {
  try {
    const { clientId, projectId, location, websiteUrl } = req.body;

    if (!clientId || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'clientId and projectId are required',
      });
    }

    // Fetch client data
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const clientData = clientResult.rows[0];

    // Note: Local SEO is now available for all clients (not just local business types)
    // Fetch project data
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const projectData = projectResult.rows[0];

    // Use location from request, client data, or project data
    const analysisLocation = location || clientData.location || projectData.location || null;

    console.log(`Generating local SEO analysis for client ${clientId}, project ${projectId}, location: ${analysisLocation}`);

    // Generate analysis
    const analysis = await generateLocalSeoAnalysis({
      clientId,
      projectId,
      clientData,
      projectData,
      location: analysisLocation,
      websiteUrl: websiteUrl || clientData.website || projectData.website_url || null,
    });

    res.json({
      success: true,
      data: analysis,
      message: 'Local SEO analysis completed successfully',
    });
  } catch (error) {
    console.error('Error generating local SEO analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate local SEO analysis',
    });
  }
});

/**
 * POST /api/local-seo/schema
 * Generate local schema markup
 */
router.post('/schema', async (req, res) => {
  try {
    const {
      companyName,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      businessType,
      services,
      openingHours,
      priceRange,
      rating,
      reviewCount,
      latitude,
      longitude,
    } = req.body;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'companyName is required',
      });
    }

    const schema = generateLocalSchemaMarkup({
      companyName,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      businessType,
      services,
      openingHours,
      priceRange,
      rating,
      reviewCount,
      latitude,
      longitude,
    });

    res.json({
      success: true,
      data: {
        schema,
        jsonLd: JSON.stringify(schema, null, 2),
        html: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
      },
      message: 'Local schema markup generated successfully',
    });
  } catch (error) {
    console.error('Error generating local schema markup:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate local schema markup',
    });
  }
});

export default router;
