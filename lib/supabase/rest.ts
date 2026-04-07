type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ensureEnv = () => {
  if (!baseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
};

export async function supabaseRestRequest<TResponse>(
  path: string,
  method: HttpMethod,
  body?: Record<string, unknown> | Record<string, unknown>[]
): Promise<TResponse> {
  ensureEnv();

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey as string,
      Authorization: `Bearer ${serviceRoleKey as string}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    cache: 'no-store',
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return [] as TResponse;
  }

  return (await response.json()) as TResponse;
}
