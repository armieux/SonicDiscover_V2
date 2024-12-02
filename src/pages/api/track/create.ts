import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { Track } from '@/app/interfaces/Track';

export const config = {
  api: {
    bodyParser: false,
  },
};

const tracks: Track[] = [];
let nextId = 1;

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
    multiples: true, // Ensure this is set
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
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Uploading track...');

    const { fields, files } = await parseForm(req);

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title || '';
    const genre = Array.isArray(fields.genre) ? fields.genre[0] : fields.genre || '';
    const bpmValue = Array.isArray(fields.bpm) ? fields.bpm[0] : fields.bpm || '0';
    const bpm = parseInt(bpmValue, 10);
    const mood = Array.isArray(fields.mood) ? fields.mood[0] : fields.mood || '';
    const trackPicture = Array.isArray(fields.trackPicture) ? fields.trackPicture[0] : fields.trackPicture || '';

    let file: File | undefined;
    if (Array.isArray(files.audioFile)) {
      file = files.audioFile[0];
    } else {
      file = files.audioFile;
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

    tracks.push(newTrack);

    console.log('New track uploaded:', newTrack);

    return res.status(201).json(newTrack);
  } catch (error) {
    console.error('Error uploading track:', error);
    return res.status(500).json({ error: 'Failed to upload track' });
  }
}
