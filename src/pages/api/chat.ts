export const prerender = false;

import * as utils from "../../lib/utility";
import OpenAI from "openai";
import db from '../../lib/db';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
    apiKey: utils.getEnvVariable("OPENAI_API_KEY")
});

const system_prompt = "You are a helpful assistant.";

export async function POST({ request }: { request: Request }) {
    const userId = request.headers.get('x-user-id');
    const message = request.headers.get('x-chat-message');

    if (!userId || !message) {
        return new Response('Missing required headers', { status: 400 });
    }

    try {
        const insertMsg = db.prepare('INSERT INTO messages (content, role, user_id) VALUES (?, ?, ?)');
        insertMsg.run(message, 'user', userId);

        const getMessages = db.prepare('SELECT role, content FROM messages WHERE user_id = ? ORDER BY id ASC');
        const previousMessages = getMessages.all(userId) as Array<{ role: 'user' | 'assistant', content: string }>;

        const messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: system_prompt },
            ...previousMessages.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages,
            stream: true,
        });

        const insertAssistant = db.prepare('INSERT INTO messages (content, role, user_id) VALUES (?, ?, ?)');
        const result = insertAssistant.run('', 'assistant', userId);
        const msgId = result.lastInsertRowid;

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                        const updateMsg = db.prepare('UPDATE messages SET content = content || ? WHERE id = ?');
                        updateMsg.run(content, msgId);
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
