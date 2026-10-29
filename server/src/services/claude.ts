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

async function getAuthToken(): Promise<string> {
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: process.env.AUTH0_AUDIENCE,
            grant_type: 'client_credentials',
        }),
    });

    const data = await response.json();
    return data.access_token;
}

async function sendToSift(prompt: string): Promise<string> {
    const token = await getAuthToken();

    const response = await fetch(process.env.SIFT_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            query: `
            mutation SendMessage($input: SendMessageInput!) {
                sendMessage(input: $input) {
                    content
                }
            }
            `,
            variables: {
                input: {
                    model: 'claude-haiku-4-5-20251001',
                    content: prompt,
                },
            },
        }),
    });

    const data = await response.json();
    if (data.errors) {
        throw new Error(data.errors[0].message);
    }
    return data.data.sendMessage.content;
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

const content = await sendToSift(prompt);

const cleaned = content
.replace(/```json\n?/g, '')
.replace(/```\n?/g, '')
.trim();

const parsed = JSON.parse(cleaned);
return parsed.recommendations;
}