import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { clientsAPI, projectsAPI } from '../api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

describe('API Service', () => {
  describe('clientsAPI', () => {
    it('should have getAll method', () => {
      expect(clientsAPI.getAll).toBeDefined();
      expect(typeof clientsAPI.getAll).toBe('function');
    });

    it('should have getById method', () => {
      expect(clientsAPI.getById).toBeDefined();
      expect(typeof clientsAPI.getById).toBe('function');
    });

    it('should have create method', () => {
      expect(clientsAPI.create).toBeDefined();
      expect(typeof clientsAPI.create).toBe('function');
    });

    it('should have update method', () => {
      expect(clientsAPI.update).toBeDefined();
      expect(typeof clientsAPI.update).toBe('function');
    });

    it('should have delete method', () => {
      expect(clientsAPI.delete).toBeDefined();
      expect(typeof clientsAPI.delete).toBe('function');
    });
  });

  describe('projectsAPI', () => {
    it('should have getAll method', () => {
      expect(projectsAPI.getAll).toBeDefined();
      expect(typeof projectsAPI.getAll).toBe('function');
    });

    it('should have getById method', () => {
      expect(projectsAPI.getById).toBeDefined();
      expect(typeof projectsAPI.getById).toBe('function');
    });

    it('should have create method', () => {
      expect(projectsAPI.create).toBeDefined();
      expect(typeof projectsAPI.create).toBe('function');
    });

    it('should have update method', () => {
      expect(projectsAPI.update).toBeDefined();
      expect(typeof projectsAPI.update).toBe('function');
    });

    it('should have delete method', () => {
      expect(projectsAPI.delete).toBeDefined();
      expect(typeof projectsAPI.delete).toBe('function');
    });
  });
});

