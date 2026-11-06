export async function registrationApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/arena/${path}`, { ...init, cache: 'no-store' }).catch(() => null);
  if (!response || response.status >= 500) {
    throw new Error('Servidor de inscrições indisponível. Tente novamente em instantes.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.detail === 'string' ? data.detail : 'Confira os dados informados e tente novamente.');
  }
  return data as T;
}
