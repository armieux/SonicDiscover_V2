import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authService from '@/app/services/authService';
import { parseFile } from 'music-metadata';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's default body parsing
  },
};

// Initialize Prisma Client
const prisma = new PrismaClient();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Parse the incoming form data using formidable.
 * @param req NextApiRequest object.
 * @returns Promise resolving to parsed fields and files.
 */
const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    multiples: true, // Allow multiple files
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
};

/**
 * Handle POST requests to upload a new track.
 * @param req NextApiRequest object.
 * @param res NextApiResponse object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('Uploading track...');

    const artist = await authService.getCurrentUser(req);
    if (!artist) {
      return res
        .status(401)
        .json({ error: 'You must be logged in to upload a track' });
    }

    const { fields, files } = await parseForm(req);

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title || '';
    const genre = Array.isArray(fields.genre) ? fields.genre[0] : fields.genre || '';
    const bpmValue = Array.isArray(fields.bpm) ? fields.bpm[0] : fields.bpm || '0';
    const bpm = parseInt(bpmValue, 10);
    const mood = Array.isArray(fields.mood) ? fields.mood[0] : fields.mood || '';
    const trackPicture = Array.isArray(fields.trackpicture) ? fields.trackpicture[0] : fields.trackpicture || '';

    let file: File | undefined;
    if (Array.isArray(files.audiofile)) {
      file = files.audiofile[0];
    } else {
      file = files.audiofile;
    }

    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    if (file.mimetype !== 'audio/mpeg' && file.mimetype !== 'audio/mp3') {
      fs.unlinkSync(file.filepath);
      return res
        .status(400)
        .json({ error: 'Invalid file type. Only MP3 files are allowed.' });
    }

    const fileName = `${Date.now()}-${file.newFilename}`;
    const filePath = path.join(uploadDir, fileName);

    fs.renameSync(file.filepath, filePath);

    const audioFilePath = `/uploads/${fileName}`;

    let trackDuration = 0;

    try {
      const metadata = await parseFile(filePath);
      trackDuration = Math.floor(metadata.format.duration || 0);
    } catch (error) {
      console.error('Error parsing audio file:', error);
    }

    // Use Prisma to insert the track into the database
    const newTrack = await prisma.tracks.create({
      data: {
        title,
        trackpicture: trackPicture,
        genre,
        bpm,
        mood,
        uploaddate: new Date(),
        audiofile: audioFilePath,
        playcount: 0,
        likecount: 0,
        dislikecount: 0,
        averagerating: 0,
        duration: trackDuration,
      },
    });

    await prisma.trackartists.create({
      data: {
        trackid: newTrack.id,
        artistid: artist.id,
        role: 'ARTIST',
      },
    });

    console.log('New track uploaded:', newTrack);

    return res.status(201).json(newTrack);
  } catch (error) {
    console.error('Error uploading track:', error);
    return res.status(500).json({ error: 'Failed to upload track' });
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}
