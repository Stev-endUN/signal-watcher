import { logger } from '../lib/logger';

export type Severity = 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';

export interface AIAnalysis {
  summary: string;
  severity: Severity;
  nextAction: string;
}

export interface AIAdapter {
  analyzeEvent(eventData: Record<string, unknown>, terms: string[]): Promise<AIAnalysis>;
}

// ─── Mock Adapter ────────────────────────────────────────────────────────────
const MOCK_RESPONSES: AIAnalysis[] = [
  {
    summary: 'A suspicious domain matching your watchlist terms was registered 2 hours ago. The domain uses a typosquat pattern closely resembling a monitored brand.',
    severity: 'HIGH',
    nextAction: 'Initiate domain takedown request and notify brand protection team immediately.',
  },
  {
    summary: 'A new subdomain was detected on infrastructure associated with previously flagged IP ranges. The pattern suggests automated scanning activity.',
    severity: 'MED',
    nextAction: 'Monitor traffic patterns for the next 24 hours and correlate with threat intelligence feeds.',
  },
  {
    summary: 'A keyword match was found in a public paste site. The content references one of your monitored terms in a low-confidence context.',
    severity: 'LOW',
    nextAction: 'Archive the finding and revisit in weekly review cycle.',
  },
  {
    summary: 'CRITICAL: Active phishing campaign detected using exact brand impersonation. Multiple URLs are live and serving malicious content targeting your customers.',
    severity: 'CRITICAL',
    nextAction: 'URGENT — Contact hosting providers, submit to Google Safe Browsing, alert security team and legal department NOW.',
  },
];

class MockAIAdapter implements AIAdapter {
  async analyzeEvent(eventData: Record<string, unknown>, terms: string[]): Promise<AIAnalysis> {
    // Simulate processing delay
    await new Promise((res) => setTimeout(res, 600 + Math.random() * 800));

    logger.info('AI analysis completed (mock mode)', { terms, eventType: eventData.type });

    // Deterministic-ish response based on content
    const seed = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[seed];
  }
}

// ─── Real Adapter (OpenAI) ────────────────────────────────────────────────────
class OpenAIAdapter implements AIAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeEvent(eventData: Record<string, unknown>, terms: string[]): Promise<AIAnalysis> {
    const prompt = `You are a cybersecurity analyst. Analyze this event and respond ONLY with valid JSON.

Watchlist terms: ${terms.join(', ')}
Event data: ${JSON.stringify(eventData, null, 2)}

Respond with:
{
  "summary": "2-3 sentence plain language description",
  "severity": "LOW | MED | HIGH | CRITICAL",
  "nextAction": "Specific recommended action for the analyst"
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    return JSON.parse(data.choices[0].message.content) as AIAnalysis;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
export function createAIAdapter(): AIAdapter {
  const mode = process.env.AI_MODE || 'mock';

  if (mode === 'openai' && process.env.OPENAI_API_KEY) {
    logger.info('AI adapter: OpenAI');
    return new OpenAIAdapter(process.env.OPENAI_API_KEY);
  }

  logger.info('AI adapter: mock (set AI_MODE=openai + OPENAI_API_KEY to use real AI)');
  return new MockAIAdapter();
}
