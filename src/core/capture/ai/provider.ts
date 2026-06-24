import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

// OpenRouter exposes an OpenAI-compatible Chat Completions API, so we reuse the
// OpenAI provider with a custom baseURL instead of pulling in another SDK.
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://github.com/nicremo/mimik',
  'X-Title': 'Mimik',
};

export function createModel(provider: string, model: string, apiKey: string) {
  if (provider === 'anthropic') return createAnthropic({ apiKey })(model);
  if (provider === 'openrouter') {
    return createOpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      name: 'openrouter',
      headers: OPENROUTER_HEADERS,
    })(model);
  }
  return createOpenAI({ apiKey })(model);
}
