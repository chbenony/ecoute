import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

export interface RecommendRequest {
    theme: string
    context?: string;
    vibes?: string[];
}

export interface SongRecommendation {
    title: string;
    artist: string;
    reasoning: string;
    rank: number;
}

export async function getRecommendations(req: RecommendRequest): Promise<SongRecommendation[]> {
    const prompt = `You are Écoute, a Music League song recommendation assistant.

Music League is a fun music game where players submit songs matching a theme and vote on each other's picks.

Theme: "${req.theme}"
${req.context ? `League context: ${req.context}` : ''}
${req.vibes?.length ? `Strategy preferences: ${req.vibes.join(', ')}` : ''}

Please recommend 5 songs that fit this theme. For each song provide the title, artist, and a brief explanation of why it fits.

Respond only with this JSON structure:
{
  "recommendations": [
    {
      "rank": 1,
      "title": "song title",
      "artist": "artist name",
      "reasoning": "why this fits the theme"
    }
  ]
}`;

const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{role: 'user', content: prompt}],
});

const content = message.content[0];
if (content.type !== 'text') throw new Error('unexpected response type');

const cleaned = content.text
.replace(/```json\n?/g, '')
.replace(/```\n?/g, '')
.trim();

// const parsed = JSON.parse(content.text);
const parsed = JSON.parse(cleaned);
return parsed.recommendations;
}