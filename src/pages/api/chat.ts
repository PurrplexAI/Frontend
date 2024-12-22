export const prerender = false;
export async function POST({ request }: { request: Request }) {
    try {
        const body = await request.json().catch(() => {
            throw new Error('Invalid JSON in request body');
        });
        const { message } = body;

        if (!message) {
            throw new Error('Message is required');
        }

        const serverCheck = await fetch('http://localhost:11434/api/tags', {
            signal: AbortSignal.timeout(5000)
        }).catch(() => null);
        
        if (!serverCheck?.ok) {
            throw new Error('Ollama server is not running');
        }

        const MODEL = 'mixtral';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL,
                prompt: message,
                stream: false,
                options: {
                    num_predict: 1000
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Ollama API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch from Ollama API');
        }

        const data = await response.json();
        
        return new Response(JSON.stringify({
            message: data.response
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        });
    } catch (err: unknown) {
        console.error('Chat API error:', err);
        
        const error = err as Error;
        const isAbortError = error instanceof Error && error.name === 'AbortError';
        
        return new Response(JSON.stringify({
            message: `Error: ${error instanceof Error ? error.message : 'Failed to communicate with Ollama API'}`
        }), {
            status: isAbortError ? 504 : 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}