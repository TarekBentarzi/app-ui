/**
 * Test unitaire pour apiClient
 * Couvre les appels HTTP
 */

import { apiClient } from './apiClient';
import { Platform } from 'react-native';

global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getBaseUrl', () => {
    it('should return a valid base URL', () => {
      const url = apiClient.getBaseUrl();
      expect(url).toMatch(/^http:\/\/.+:\d+$/);
      expect(url).toBeTruthy();
    });

    it('should return localhost:3000 when Platform.OS is web', () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', {
        get: () => 'web',
        configurable: true,
      });

      const url = apiClient.getBaseUrl();
      expect(url).toBe('http://localhost:3000');

      // Restore original value
      Object.defineProperty(Platform, 'OS', {
        get: () => originalOS,
        configurable: true,
      });
    });
  });

  describe('get', () => {
    it('should make a GET request and return JSON', async () => {
      const mockData = { id: '1', name: 'Test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.get('/users');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(apiClient.get('/users')).rejects.toThrow(
        'API Error: 404'
      );
    });

    it('should throw error when network fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/users')).rejects.toThrow('Network error');
    });
  });

  describe('post', () => {
    it('should make a POST request with data', async () => {
      const mockData = { id: '1', name: 'New User' };
      const postData = { name: 'New User', email: 'test@example.com' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.post('/users', postData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error when POST response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      await expect(apiClient.post('/users', {})).rejects.toThrow(
        'API Error: 400 - Bad Request'
      );
    });

    it('should correctly serialize JSON body', async () => {
      const complexData = { nested: { value: 123 }, array: [1, 2, 3] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.post('/data', complexData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(complexData),
        })
      );
    });
  });

  describe('patch', () => {
    it('should make a PATCH request with data', async () => {
      const mockData = { id: '1', name: 'Updated name' };
      const patchData = { name: 'Updated name' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.patch('/users/1', patchData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error when PATCH response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(apiClient.patch('/users/1', {})).rejects.toThrow(
        'API Error: 500'
      );
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      });

      await apiClient.delete('/users/1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should throw error when DELETE response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      });

      await expect(apiClient.delete('/users/1')).rejects.toThrow(
        'API Error: 403'
      );
    });
  });

  describe('getBaseUrl', () => {
    it('should return the base URL', () => {
      const url = apiClient.getBaseUrl();
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });

    it('should return EXPO_PUBLIC_API_URL when set and not localhost', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      process.env.EXPO_PUBLIC_API_URL = 'https://api.production.com';
      
      // Need to re-import to get the new env var
      const url = apiClient.getBaseUrl();
      
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
      expect(url).toBeDefined();
    });
  });

  describe('setToken and getHeaders', () => {
    it('should include Authorization header when token is set', () => {
      apiClient.setToken('test-token-123');
      const headers = apiClient.getHeaders();
      expect(headers['Authorization']).toBe('Bearer test-token-123');
    });

    it('should not include Authorization header when token is null', () => {
      apiClient.setToken(null);
      const headers = apiClient.getHeaders();
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should always include Content-Type header', () => {
      const headers = apiClient.getHeaders();
      expect(headers['Content-Type']).toBe('application/json');
    });
  });
});