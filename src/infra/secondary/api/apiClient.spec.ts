/**
 * Test unitaire pour apiClient
 * Couvre les appels HTTP
 */

import { apiClient } from './apiClient';

global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
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
        expect.stringContaining('/users')
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiClient.get('/users')).rejects.toThrow('API Error: 404');
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
      });

      await expect(apiClient.post('/users', {})).rejects.toThrow('API Error: 400');
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
          body: JSON.stringify(complexData),
        })
      );
    });
  });
});
