import { HfInference } from '@huggingface/inference';

export async function testIntegration() {
  try {
    // Test Hugging Face
    const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);
    const hfResponse = await hf.textClassification({
      model: 'bert-base-uncased',
      inputs: 'Test message',
    });
    console.log('Hugging Face test:', hfResponse);

    // Test Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: 'Test message'
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    console.log('Groq test:', groqData);

    return { success: true };
  } catch (error) {
    console.error('Integration test failed:', error);
    return { success: false, error };
  }
}