import db from '../../../lib/db';

export async function GET({ params }: { params: { userId: string } }) {
    const stmt = db.prepare('SELECT id, title FROM chats WHERE user_id = ? ORDER BY id DESC');
    const chats = stmt.all(params.userId);
    
    return new Response(JSON.stringify(chats), {
        headers: { 'Content-Type': 'application/json' }
    });
}
