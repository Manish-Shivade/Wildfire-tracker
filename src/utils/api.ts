import type { EONETResponse } from '../types';

const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';

export async function fetchWildfires(
  status: 'open' | 'closed' | 'all' = 'open'
): Promise<EONETResponse> {
  const params = new URLSearchParams({
    category: 'wildfires',
    status,
    limit: '50',
  });

  const response = await fetch(`${EONET_BASE_URL}/events?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch wildfires: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
