import assert from 'node:assert/strict';
import { GoogleGeminiTaskDraftClient } from '../src/server/gemini-task-draft-client';

interface TestResult {
  name: string;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, execute: () => Promise<void>): Promise<void> {
  try {
    await execute();
    results.push({ name });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    results.push({ name, error: message });
    console.error(`[FAIL] ${name}: ${message}`);
  }
}

const validDraft = JSON.stringify({
  title: 'Preparar proposta',
  description: 'Preparar proposta para o cliente.',
  priority: 'medium',
  status: 'todo',
  checklist: ['Reunir requisitos'],
});

await test('keeps the operation unknown when Gemini omits all usage metadata', async () => {
  const client = new GoogleGeminiTaskDraftClient({
    apiKey: 'fake-key',
    createSdk: () => ({
      models: {
        generateContent: async () => ({ text: validDraft }),
      },
    }),
  });

  const result = await client.generateTaskDraft({ description: 'Preparar proposta.' });

  assert.deepEqual(result, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });
});

await test('keeps the operation unknown when Gemini returns only partial usage metadata', async () => {
  const client = new GoogleGeminiTaskDraftClient({
    apiKey: 'fake-key',
    createSdk: () => ({
      models: {
        generateContent: async () => ({
          text: validDraft,
          usageMetadata: { promptTokenCount: 120 },
        }),
      },
    }),
  });

  const result = await client.generateTaskDraft({ description: 'Preparar proposta.' });

  assert.deepEqual(result, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });
});

await test('never confirms a zero-cost operation from zeroed usage metadata', async () => {
  const client = new GoogleGeminiTaskDraftClient({
    apiKey: 'fake-key',
    createSdk: () => ({
      models: {
        generateContent: async () => ({
          text: validDraft,
          usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0 },
        }),
      },
    }),
  });

  const result = await client.generateTaskDraft({ description: 'Preparar proposta.' });

  assert.deepEqual(result, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });
});

const failures = results.filter((result) => result.error);
console.log(`\n${results.length - failures.length}/${results.length} Gemini task draft client tests passed`);
if (failures.length > 0) process.exit(1);
