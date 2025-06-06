import { HfInference } from '@huggingface/inference';
import { Anthropic } from '@anthropic-ai/sdk';

export async function testIntegration() {
  try {
    // Test Hugging Face
    const hf = new HfInference(import.meta.env.HF_API_KEY);
    const hfResponse = await hf.textClassification({
      model: 'bert-base-uncased',
      inputs: 'Test message',
    });
    console.log('Hugging Face test:', hfResponse);

    // Test Claude/Groq
    const anthropic = new Anthropic({
      apiKey: import.meta.env.CLAUDE_API_KEY,
    });
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Test message' }],
    });
    console.log('Claude test:', claudeResponse);

    return { success: true };
  } catch (error) {
    console.error('Integration test failed:', error);
    return { success: false, error };
  }
}