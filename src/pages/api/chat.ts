export const prerender = false;

import * as utils from "../../lib/utility";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: utils.getEnvVariable("OPENAI_API_KEY")
});

const system_prompt = "You are a helpful assistant.";
const userSessions = new Map();

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: number;
}

function getUserSession(userId: string) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, [
            { 
                role: 'system', 
                content: system_prompt,
                timestamp: Date.now()
            }
        ]);
    }
    return userSessions.get(userId);
}

function updateAssistantMessage(userId: string, content: string) {
    const messages = getUserSession(userId);
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
        lastMessage.content += content;
    }
}

export async function POST({ request }: { request: Request }) {
    const userId = request.headers.get('x-user-id');
    const message = request.headers.get('x-chat-message');

    if (!userId || !message) {
        return new Response('Missing required headers', { status: 400 });
    }

    try {
        const messages = getUserSession(userId);
        messages.push({ 
            role: 'user', 
            content: message,
            timestamp: Date.now()
        });

        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: messages.map((map: ChatMessage) => ({ role: map.role, content: map.content })),
            stream: true,
        });

        messages.push({ 
            role: 'assistant', 
            content: '',
            timestamp: Date.now()
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                        updateAssistantMessage(userId, content);
                    }
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('err: ', error);
        return new Response('Internal server error', { status: 500 });
    }
}
