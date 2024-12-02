// src/app/api/track/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { Track } from '@/app/interfaces/Track';
import { IncomingMessage } from 'http';

// Configure the API route to use Node.js runtime
export const config = {
  runtime: 'nodejs',
};

// In-memory storage for tracks (Replace with a database in production)
const tracks: Track[] = [];
let nextId = 1;

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Parse the incoming form data using formidable.
 * @param req IncomingMessage object.
 * @returns Promise resolving to parsed fields and files.
 */
const parseForm = async (
  req: IncomingMessage
): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50 MB
  });

  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

/**
 * Handle POST requests to upload a new track.
 * @param request NextRequest object.
 * @returns NextResponse with the created track or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    // Convert NextRequest to IncomingMessage
    const req = request as unknown as IncomingMessage;

    // Parse the form data
    const { fields, files } = await parseForm(req);

    // Type-safe extraction of form fields
    const title = typeof fields.title === 'string' ? fields.title : '';
    const genre = typeof fields.genre === 'string' ? fields.genre : '';
    const bpm = typeof fields.bpm === 'string' ? parseInt(fields.bpm, 10) : 0;
    const mood = typeof fields.mood === 'string' ? fields.mood : '';
    const trackPicture = typeof fields.trackPicture === 'string' ? fields.trackPicture : '';

    // Type-safe extraction of the uploaded audio file
    let file: File | undefined;
    if (Array.isArray(files.audioFile)) {
      file = files.audioFile[0];
    } else {
      file = files.audioFile;
    }

    if (!file) {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    // Validate the uploaded file type
    if (file.mimetype !== 'audio/mpeg' && file.mimetype !== 'audio/mp3') {
      // Delete the invalid file
      fs.unlinkSync(file.filepath);
      return NextResponse.json(
        { error: 'Invalid file type. Only MP3 files are allowed.' },
        { status: 400 }
      );
    }

    // Generate a unique file name to prevent conflicts
    const fileExt = path.extname(file.originalFilename || '');
    const fileName = `${Date.now()}-${file.newFilename}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Rename (move) the file to the upload directory
    fs.renameSync(file.filepath, filePath);

    // Create the audio file path relative to the public directory
    const audioFilePath = `/uploads/${fileName}`;

    // Create a new Track object
    const newTrack: Track = {
      id: nextId++,
      title,
      trackPicture,
      genre,
      bpm,
      mood,
      uploadDate: new Date(),
      audioFile: audioFilePath,
      playCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      averageRating: 0,
    };

    // Store the track in the in-memory array
    tracks.push(newTrack);

    // Respond with the newly created track
    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    console.error('Error uploading track:', error);
    return NextResponse.json({ error: 'Failed to upload track' }, { status: 500 });
  }
}
