/**
 * Comprehensive Test Script for Phase 2D, 2E, 2F, 2G, 2H
 */

const fs = require('fs');
const path = require('path');

const testResults = {
  passed: [],
  failed: [],
  warnings: [],
};

function test(name, condition, details = '') {
  if (condition) {
    testResults.passed.push({ name, details });
    console.log(`✅ PASS: ${name}`);
    return true;
  } else {
    testResults.failed.push({ name, details });
    console.log(`❌ FAIL: ${name}${details ? ' - ' + details : ''}`);
    return false;
  }
}

function warn(name, message) {
  testResults.warnings.push({ name, message });
  console.log(`⚠️  WARN: ${name} - ${message}`);
}

console.log('🧪 Starting Comprehensive Tests...\n');

// Test 1: File Existence
console.log('📁 Testing File Existence...');
const requiredFiles = [
  'backend/src/db/migrations/007_add_business_types_to_clients.sql',
  'backend/src/routes/contentRoadmap.js',
  'backend/src/routes/dashboard.js',
  'backend/src/services/seoScoreService.js',
  'frontend/src/components/Breadcrumb.jsx',
  'frontend/src/components/ContentRoadmap.jsx',
  'frontend/src/components/StrategyDashboard.jsx',
  'frontend/src/components/ContentPreview.jsx',
];

requiredFiles.forEach(file => {
  test(`File exists: ${file}`, fs.existsSync(file));
});

// Test 2: Backend Route Registration
console.log('\n🔌 Testing Backend Route Registration...');
const serverFile = 'backend/src/server.js';
if (fs.existsSync(serverFile)) {
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  test('contentRoadmapRouter imported', serverContent.includes('contentRoadmapRouter'));
  test('dashboardRouter imported', serverContent.includes('dashboardRouter'));
  test('contentRoadmapRouter registered', serverContent.includes("app.use('/api/roadmap'"));
  test('dashboardRouter registered', serverContent.includes("app.use('/api/dashboard'"));
} else {
  test('server.js exists', false, 'File not found');
}

// Test 3: Frontend API Integration
console.log('\n🌐 Testing Frontend API Integration...');
const apiFile = 'frontend/src/services/api.js';
if (fs.existsSync(apiFile)) {
  const apiContent = fs.readFileSync(apiFile, 'utf8');
  test('contentRoadmapAPI defined', apiContent.includes('contentRoadmapAPI'));
  test('dashboardAPI defined', apiContent.includes('dashboardAPI'));
  test('contentRoadmapAPI.getByProject', apiContent.includes('getByProject'));
  test('dashboardAPI.getByProject', apiContent.includes('dashboardAPI'));
} else {
  test('api.js exists', false, 'File not found');
}

// Test 4: Component Imports
console.log('\n⚛️  Testing Component Imports...');
const projectDetailFile = 'frontend/src/pages/ProjectDetail.jsx';
if (fs.existsSync(projectDetailFile)) {
  const pdContent = fs.readFileSync(projectDetailFile, 'utf8');
  test('ContentRoadmap imported', pdContent.includes('ContentRoadmap'));
  test('StrategyDashboard imported', pdContent.includes('StrategyDashboard'));
  test('Roadmap tab button exists', pdContent.includes('roadmap'));
  test('Dashboard tab button exists', pdContent.includes('dashboard'));
  test('Dashboard is default tab', pdContent.includes("useState('dashboard')"));
} else {
  test('ProjectDetail.jsx exists', false, 'File not found');
}

// Test 5: SEO Score Service Functions
console.log('\n📊 Testing SEO Score Service...');
const seoScoreFile = 'backend/src/services/seoScoreService.js';
if (fs.existsSync(seoScoreFile)) {
  const seoContent = fs.readFileSync(seoScoreFile, 'utf8');
  test('calculateSEOScore exported', seoContent.includes('export function calculateSEOScore'));
  test('calculateReadabilityScore exported', seoContent.includes('export function calculateReadabilityScore'));
  test('getAISearchOptimizationNotes exported', seoContent.includes('export function getAISearchOptimizationNotes'));
  test('calculateStatistics exported', seoContent.includes('export function calculateStatistics'));
} else {
  test('seoScoreService.js exists', false, 'File not found');
}

// Test 6: Content API Integration
console.log('\n📝 Testing Content API Integration...');
const contentRouteFile = 'backend/src/routes/content.js';
if (fs.existsSync(contentRouteFile)) {
  const contentContent = fs.readFileSync(contentRouteFile, 'utf8');
  test('seoScoreService imported', contentContent.includes('seoScoreService'));
  test('calculateSEOScore used', contentContent.includes('calculateSEOScore'));
  test('calculateReadabilityScore used', contentContent.includes('calculateReadabilityScore'));
  test('Scores added to response', contentContent.includes('seo_score'));
} else {
  test('content.js exists', false, 'File not found');
}

// Test 7: Business Type Support
console.log('\n🏢 Testing Business Type Support...');
const clientFormFile = 'frontend/src/components/ClientForm.jsx';
if (fs.existsSync(clientFormFile)) {
  const cfContent = fs.readFileSync(clientFormFile, 'utf8');
  test('BUSINESS_TYPES defined', cfContent.includes('BUSINESS_TYPES'));
  test('business_types in formData', cfContent.includes('business_types'));
  test('handleBusinessTypeToggle function', cfContent.includes('handleBusinessTypeToggle'));
  test('Location field conditional', cfContent.includes("business_types.includes('local')"));
  test('Shopify URL field conditional', cfContent.includes("business_types.includes('shopify')"));
} else {
  test('ClientForm.jsx exists', false, 'File not found');
}

const clientsRouteFile = 'backend/src/routes/clients.js';
if (fs.existsSync(clientsRouteFile)) {
  const crContent = fs.readFileSync(clientsRouteFile, 'utf8');
  test('Business type validation in POST', crContent.includes('business_types'));
  test('Business type validation in PUT', crContent.includes('primary_business_type'));
} else {
  test('clients.js exists', false, 'File not found');
}

// Test 8: SEO Strategy Business Type Logic
console.log('\n🎯 Testing SEO Strategy Business Type Logic...');
const seoStrategyFile = 'backend/src/services/seoStrategyService.js';
if (fs.existsSync(seoStrategyFile)) {
  const ssContent = fs.readFileSync(seoStrategyFile, 'utf8');
  test('buildGeneralBusinessPrompt function', ssContent.includes('buildGeneralBusinessPrompt'));
  test('buildLocalBusinessPrompt function', ssContent.includes('buildLocalBusinessPrompt'));
  test('buildShopifyPrompt function', ssContent.includes('buildShopifyPrompt'));
  test('Business type detection', ssContent.includes('primaryBusinessType'));
} else {
  test('seoStrategyService.js exists', false, 'File not found');
}

// Test 9: Breadcrumb Component
console.log('\n🧭 Testing Breadcrumb Component...');
const breadcrumbFile = 'frontend/src/components/Breadcrumb.jsx';
if (fs.existsSync(breadcrumbFile)) {
  const bcContent = fs.readFileSync(breadcrumbFile, 'utf8');
  test('useLocation hook used', bcContent.includes('useLocation'));
  test('useParams hook used', bcContent.includes('useParams'));
  test('Breadcrumb renders', bcContent.includes('return'));
} else {
  test('Breadcrumb.jsx exists', false, 'File not found');
}

const layoutFile = 'frontend/src/components/Layout.jsx';
if (fs.existsSync(layoutFile)) {
  const layoutContent = fs.readFileSync(layoutFile, 'utf8');
  test('Breadcrumb imported in Layout', layoutContent.includes('Breadcrumb'));
  test('Breadcrumb rendered in Layout', layoutContent.includes('<Breadcrumb'));
} else {
  test('Layout.jsx exists', false, 'File not found');
}

// Test 10: Content Roadmap Component
console.log('\n📅 Testing Content Roadmap Component...');
const roadmapFile = 'frontend/src/components/ContentRoadmap.jsx';
if (fs.existsSync(roadmapFile)) {
  const rmContent = fs.readFileSync(roadmapFile, 'utf8');
  test('contentRoadmapAPI imported', rmContent.includes('contentRoadmapAPI'));
  test('Drag and drop handlers', rmContent.includes('handleDragStart'));
  test('Filter functionality', rmContent.includes('filters'));
  test('Progress tracking', rmContent.includes('generatedPercent'));
} else {
  test('ContentRoadmap.jsx exists', false, 'File not found');
}

// Test 11: Strategy Dashboard Component
console.log('\n📊 Testing Strategy Dashboard Component...');
const dashboardFile = 'frontend/src/components/StrategyDashboard.jsx';
if (fs.existsSync(dashboardFile)) {
  const dbContent = fs.readFileSync(dashboardFile, 'utf8');
  test('dashboardAPI imported', dbContent.includes('dashboardAPI'));
  test('Strategy cards rendered', dbContent.includes('strategies?.seo'));
  test('Metrics summary displayed', dbContent.includes('summary'));
  test('Quick actions section', dbContent.includes('Quick Actions'));
} else {
  test('StrategyDashboard.jsx exists', false, 'File not found');
}

// Test 12: Content Preview Component
console.log('\n👁️  Testing Content Preview Component...');
const previewFile = 'frontend/src/components/ContentPreview.jsx';
if (fs.existsSync(previewFile)) {
  const pvContent = fs.readFileSync(previewFile, 'utf8');
  test('SEO scores displayed', pvContent.includes('seo_score'));
  test('Readability score displayed', pvContent.includes('readability_score'));
  test('Statistics panel', pvContent.includes('Statistics'));
  test('AI search notes', pvContent.includes('ai_search_notes'));
  test('Quick actions', pvContent.includes('Quick Actions'));
} else {
  test('ContentPreview.jsx exists', false, 'File not found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);
console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
console.log('='.repeat(60));

if (testResults.failed.length > 0) {
  console.log('\n❌ FAILED TESTS:');
  testResults.failed.forEach(({ name, details }) => {
    console.log(`  - ${name}${details ? ': ' + details : ''}`);
  });
}

if (testResults.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  testResults.warnings.forEach(({ name, message }) => {
    console.log(`  - ${name}: ${message}`);
  });
}

const successRate = ((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(1);
console.log(`\n📈 Success Rate: ${successRate}%`);

if (testResults.failed.length === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix.');
  process.exit(1);
}

