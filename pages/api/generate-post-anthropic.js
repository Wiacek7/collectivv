import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate request body
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // Create message using the latest API version
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7
    });

    // Validate response
    if (!message.content || !message.content[0] || !message.content[0].text) {
      throw new Error('Invalid response from Anthropic API');
    }

    // Return the generated content
    return res.status(200).json({
      content: message.content[0].text
    });

  } catch (error) {
    console.error('Error generating post:', error);
    
    return res.status(500).json({
      message: 'Failed to generate post',
      error: error.message
    });
  }
}