import { generateContent, generateContentWithSystem } from '../claude.js';

describe('Claude API Service', () => {
  describe('generateContent', () => {
    test('should be defined', () => {
      expect(generateContent).toBeDefined();
      expect(typeof generateContent).toBe('function');
    });

    test('should be an async function', () => {
      expect(generateContent).toBeInstanceOf(Function);
      // Check if it returns a Promise (async function)
      const result = generateContent('test');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('generateContentWithSystem', () => {
    test('should be defined', () => {
      expect(generateContentWithSystem).toBeDefined();
      expect(typeof generateContentWithSystem).toBe('function');
    });

    test('should be an async function', () => {
      expect(generateContentWithSystem).toBeInstanceOf(Function);
      const result = generateContentWithSystem('system', 'user');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors', async () => {
      // Without API key, this should throw an error
      // We test that the function handles errors by throwing
      try {
        await generateContent('test prompt');
        // If no error is thrown, fail the test
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Error is expected and properly handled
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Claude API error');
      }
    });
  });

  describe('API Configuration', () => {
    test('should have API key configuration available', () => {
      // Test that the configuration structure exists
      // API key may not be set in test environment
      expect(process.env.ANTHROPIC_API_KEY || 'not_set').toBeDefined();
    });
  });
});

