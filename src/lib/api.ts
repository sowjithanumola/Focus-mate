export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (err: any) {
      lastError = err;
      console.warn(`Retry ${i + 1}/${maxRetries} failed:`, err);
    }
  }

  throw lastError || new Error("API request failed after retries");
}
