import db from '../../lib/db';
import bcrypt from 'bcryptjs';
import { hashUsername } from '../../lib/hash';

interface User {
    id: number;
    username: string;
    username_hash: string;
    password: string;
}

export async function POST({ request }: { request: Request }) {
    const { username, password } = await request.json();
    const usernameHash = hashUsername(username.toLowerCase());

    const stmt = db.prepare('SELECT * FROM users WHERE username_hash = ?');
    const user = stmt.get(usernameHash) as User | undefined;

    if (!user || !await bcrypt.compare(password, user.password)) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ id: user.id }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
