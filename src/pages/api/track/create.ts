import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import type { Fields, Files, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authService from '@/app/services/authService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fields = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Files = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type File = any;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.parse(req, (err: any, fields: Fields, files: Files) => {
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

    if (!(file as any)) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    if ((file as any).mimetype !== 'audio/mpeg' && (file as any).mimetype !== 'audio/mp3') { // eslint-disable-line @typescript-eslint/no-explicit-any
      fs.unlinkSync((file as any).filepath); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res
        .status(400)
        .json({ error: 'Invalid file type. Only MP3 files are allowed.' });
    }

    const fileName = `${Date.now()}-${(file as any).newFilename}`; // eslint-disable-line @typescript-eslint/no-explicit-any
    const filePath = path.join(uploadDir, fileName);

    fs.renameSync((file as any).filepath, filePath); // eslint-disable-line @typescript-eslint/no-explicit-any

    const audioFilePath = `/uploads/${fileName}`;

    let trackDuration = 0;

    try {
      const mm = await import('music-metadata');
      const metadata = await (mm as any).parseFile(filePath); // eslint-disable-line @typescript-eslint/no-explicit-any
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

    return res.status(201).json(newTrack);
  } catch (error) {
    console.error('Error uploading track:', error);
    return res.status(500).json({ error: 'Failed to upload track' });
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}
