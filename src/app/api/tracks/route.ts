import { Track } from '@/app/interfaces/Track';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a pool to connect to PostgreSQL
const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'sonicdiscover',
  password: 'password',
  port: 5432,
});

// GET /api/tracks
export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM tracks ORDER BY id DESC');

    const tracks: Track[] = rows.map((track: Track) => ({
        id: track.id,
        title: track.title,
        trackPicture: track.trackPicture,
        genre: track.genre,
        bpm: track.bpm,
        mood: track.mood,
        uploadDate: track.uploadDate,
        audioFile: track.audioFile,
        playCount: track.playCount,
        likeCount: track.likeCount,
        dislikeCount: track.dislikeCount,
        averageRating: track.averageRating,
    }));


    // Return JSON with a 200 status
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}
