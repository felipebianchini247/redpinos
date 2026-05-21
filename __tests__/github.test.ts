process.env.GITHUB_TOKEN = 'fake-token';
process.env.GITHUB_OWNER = 'test-owner';
process.env.GITHUB_REPO = 'test-repo';

import { jest } from '@jest/globals';
import { getFileFromGitHub, updateFileInGitHub, uploadFileToGitHub } from '../lib/github';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockClear());

describe('getFileFromGitHub', () => {
  it('returns decoded content and sha', async () => {
    const content = Buffer.from('{"test":true}').toString('base64');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: content + '\n', sha: 'abc123' }),
    });
    const result = await getFileFromGitHub('content/test.json');
    expect(result.content).toBe('{"test":true}');
    expect(result.sha).toBe('abc123');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) });
    await expect(getFileFromGitHub('missing.json')).rejects.toThrow();
  });
});

describe('updateFileInGitHub', () => {
  it('calls PUT with correct body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await updateFileInGitHub('content/test.json', '{"updated":true}', 'sha123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('test.json'),
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
