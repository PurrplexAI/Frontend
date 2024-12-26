import db from '../../lib/db';
import bcrypt from 'bcryptjs';
import { hashUsername } from '../../lib/hash';

export async function POST({ request }: { request: Request }) {
    const { username, password } = await request.json();
    const usernameHash = hashUsername(username.toLowerCase());

    const checkStmt = db.prepare('SELECT id FROM users WHERE username_hash = ?');
    const existingUser = checkStmt.get(usernameHash) as { id: number } | undefined;

    if (existingUser) {
        return new Response(JSON.stringify({ error: 'Username already taken' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertStmt = db.prepare('INSERT INTO users (username, username_hash, password) VALUES (?, ?, ?)');
    const result = insertStmt.run(username.toLowerCase(), usernameHash, hashedPassword);

    return new Response(JSON.stringify({ id: result.lastInsertRowid }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
