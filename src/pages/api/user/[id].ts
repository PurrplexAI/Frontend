import db from '../../../lib/db';

interface User {
    id: number;
    username: string;
    username_hash: string;
}

export async function GET({ params }: { params: { id: string } }) {
    const stmt = db.prepare('SELECT id, username, username_hash FROM users WHERE id = ?');
    const user = stmt.get(params.id) as User | undefined;

    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ username: user.username }), {
        headers: { 'Content-Type': 'application/json' }
    });
}