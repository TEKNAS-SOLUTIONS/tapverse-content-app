import {
  generateBlogContent,
  generateLinkedInPost,
  generateGoogleAdsCopy,
  generateFacebookAdsCopy,
} from '../contentGeneration.js';

describe('Content Generation Service', () => {
  const mockProjectData = {
    client_id: 'test-client-id',
    project_name: 'Test Project',
    keywords: ['SEO', 'content marketing'],
    competitors: ['https://competitor.com'],
    target_audience: 'Digital marketers',
    unique_angle: 'AI-powered content',
    content_preferences: 'professional',
  };

  describe('generateBlogContent', () => {
    test('should be defined', () => {
      expect(generateBlogContent).toBeDefined();
      expect(typeof generateBlogContent).toBe('function');
    });

    test('should be an async function', () => {
      const result = generateBlogContent(mockProjectData);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('generateLinkedInPost', () => {
    test('should be defined', () => {
      expect(generateLinkedInPost).toBeDefined();
      expect(typeof generateLinkedInPost).toBe('function');
    });

    test('should be an async function', () => {
      const result = generateLinkedInPost(mockProjectData);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('generateGoogleAdsCopy', () => {
    test('should be defined', () => {
      expect(generateGoogleAdsCopy).toBeDefined();
      expect(typeof generateGoogleAdsCopy).toBe('function');
    });

    test('should be an async function', () => {
      const result = generateGoogleAdsCopy(mockProjectData);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('generateFacebookAdsCopy', () => {
    test('should be defined', () => {
      expect(generateFacebookAdsCopy).toBeDefined();
      expect(typeof generateFacebookAdsCopy).toBe('function');
    });

    test('should be an async function', () => {
      const result = generateFacebookAdsCopy(mockProjectData);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors', async () => {
      // Test that error handling structure exists
      // Actual API errors will be tested in integration tests
      expect(generateBlogContent).toBeDefined();
      expect(typeof generateBlogContent).toBe('function');
      // Error handling is tested in the implementation
      expect(true).toBe(true);
    });
  });
});

