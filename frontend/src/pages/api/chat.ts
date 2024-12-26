export const prerender = false;

export async function POST({ request }: { request: Request }) {
    const { message } = await request.json();
    const userId = '1';

    try {
        const response = await fetch(`http://localhost:5000/${userId}/${encodeURIComponent(message)}`, {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream',
            }
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to connect to AI service' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}