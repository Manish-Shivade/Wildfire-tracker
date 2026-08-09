import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchWildfires } from './api';

describe('fetchWildfires', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the wildfires category with the given status', async () => {
    const mockResponse = {
      title: 'EONET Events',
      description: '',
      link: '',
      events: [],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchWildfires('open');

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      'https://eonet.gsfc.nasa.gov/api/v3/events'
    );
    expect(calledUrl.searchParams.get('category')).toBe('wildfires');
    expect(calledUrl.searchParams.get('status')).toBe('open');
    expect(calledUrl.searchParams.get('limit')).toBe('50');
  });

  it('returns parsed JSON on success', async () => {
    const mockResponse = {
      title: 'EONET Events',
      description: '',
      link: '',
      events: [{ id: '1', title: 'Test Fire' }],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse })
    );

    const result = await fetchWildfires();
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe('Test Fire');
  });

  it('throws a descriptive error when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({}),
      })
    );

    await expect(fetchWildfires()).rejects.toThrow('503');
  });

  it('defaults status to "open" when not provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: '', description: '', link: '', events: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchWildfires();

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('status')).toBe('open');
  });
});
