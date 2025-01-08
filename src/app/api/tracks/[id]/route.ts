// app/api/tracks/[id]/route.ts
import { Track } from '@/app/interfaces/Track';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a pool for your DB connection
const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'sonicdiscover',
  password: 'password',
  port: 5432,
});

/**
 * GET /api/tracks/[id]
 * Fetch a single track by its ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const result = await pool.query('SELECT * FROM tracks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      // Track not found
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    const track: Track = {
        id: result.rows[0].id,
        title: result.rows[0].title,
        trackPicture: result.rows[0].trackPicture,
        genre: result.rows[0].genre,
        bpm: result.rows[0].bpm,
        mood: result.rows[0].mood,
        uploadDate: result.rows[0].uploadDate,
        audioFile: result.rows[0].audioFile,
        playCount: result.rows[0].playCount,
        likeCount: result.rows[0].likeCount,
        dislikeCount: result.rows[0].dislikeCount,
        averageRating: result.rows[0].averageRating,
    };

    // Return the single track
    return NextResponse.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
  }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const { id } = params;
    const body = await request.json();
  
    const fields = Object.keys(body);
    const values = Object.values(body);
  
    // Construct the SET clause dynamically
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  
    try {
      const result = await pool.query(
        `UPDATE tracks SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
  
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, track: result.rows[0] });
    } catch (error) {
      console.error('Error updating track:', error);
      return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
    }
  }
  
  // DELETE (example)
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const deleteResult = await pool.query('DELETE FROM tracks WHERE id = $1', [id]);
        if (deleteResult.rowCount === 0) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting track:', error);
        return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
    }
}
  