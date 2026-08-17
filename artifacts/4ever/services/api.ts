export type ChatRequest = {
  conversationId: string;
  message: string;
  context?: Array<{ role: 'user' | 'assistant'; content: string }>;
  mode?: 'reflect' | 'relief';
  journeyLevel?: 1 | 2 | 3 | 4;
};

export type ChatResponse = {
  message: string;
  source: 'ai' | 'development';
};

function apiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, '');
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : '';
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22000);
  try {
    const response = await fetch(`${apiBaseUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
    return (await response.json()) as ChatResponse;
  } finally {
    clearTimeout(timeout);
  }
}