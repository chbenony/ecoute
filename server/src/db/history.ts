import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../../ecoute.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme TEXT NOT NULL,
    submitted_song TEXT,
    submitted_artist TEXT,
    score INTEGER,
    vibes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    FOREIGN KEY (round_id) REFERENCES rounds(id)
    );
`);

export function saveRound(theme: string, vibes?: string[]){
    const stmt = db.prepare(`
        INSERT INTO rounds (theme, vibes) VALUES (?, ?)
    `);
    const result = stmt.run(theme, vibes?.join(',') ?? null);
    return result.lastInsertRowid as number; 
}

export function saveRecommendations(roundId: number, recommendations: {
    rank: number;
    title: string;
    artist: string;
    reasoning: string;
}[]) {
    const stmt = db.prepare(`
        INSERT INTO recommendations (round_id, rank, title, artist, reasoning)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const rec of recommendations){
        stmt.run(roundId, rec.rank, rec.title, rec.artist, rec.reasoning);
    }
}

export function updateRoundScore(roundId: number, submittedSong: string, submittedArtist: string, score: number){
    const stmt = db.prepare(`
        UPDATE rounds SET submitted_song = ?, submitted_artist = ?, score = ? WHERE id = ?
    `);
    stmt.run(submittedSong, submittedArtist, score, roundId);
}

export function getHistory(){
    return db.prepare(`
        SELECT * FROM rounds ORDER BY created_at DESC
    `).all();
}

export default db;