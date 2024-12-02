// src/app/upload/page.tsx

'use client';

import React, { useState } from 'react';
import { Track } from '@/app/interfaces/Track';

const Upload: React.FC = () => {
  // State variables for form fields
  const [title, setTitle] = useState<string>('');
  const [genre, setGenre] = useState<string>('');
  const [bpm, setBpm] = useState<number>(120);
  const [mood, setMood] = useState<string>('');
  const [trackPicture, setTrackPicture] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // State variables for user feedback
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedTrack, setUploadedTrack] = useState<Track | null>(null); // New state variable

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'audio/mpeg' ||
        selectedFile.type === 'audio/mp3'
      ) {
        setFile(selectedFile);
        setUploadError(null);
      } else {
        setUploadError('Please select a valid MP3 file.');
        setFile(null);
      }
    }
  };

  // Handle form submission
  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (!title || !genre || !bpm || !mood || !file) {
      setUploadError('Please fill in all required fields and select an MP3 file.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);
    setUploadedTrack(null); // Reset uploadedTrack

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('genre', genre);
      formData.append('bpm', bpm.toString());
      formData.append('mood', mood);
      formData.append('trackPicture', trackPicture);
      formData.append('audioFile', file);

      const response = await fetch('/api/track/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data: Track = await response.json();
        setUploadSuccess('Track uploaded successfully!');
        setUploadedTrack(data); // Store the uploaded track
        setTitle('');
        setGenre('');
        setBpm(120);
        setMood('');
        setTrackPicture('');
        setFile(null);
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Failed to upload track.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
      <h2 className="text-4xl text-white mb-6">Upload Your MP3</h2>
      <form onSubmit={handleUpload} className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="title">
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
          />
        </div>

        {/* Genre */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="genre">
            Genre:
          </label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
          />
        </div>

        {/* BPM */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="bpm">
            BPM:
          </label>
          <input
            type="number"
            id="bpm"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            required
            min={40}
            max={250}
            className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
          />
        </div>

        {/* Mood */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="mood">
            Mood:
          </label>
          <input
            type="text"
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            required
            className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
          />
        </div>

        {/* Track Picture URL */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="trackPicture">
            Track Picture URL:
          </label>
          <input
            type="url"
            id="trackPicture"
            value={trackPicture}
            onChange={(e) => setTrackPicture(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
          />
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="file-upload">
            Choose MP3 file:
          </label>
          <input
            type="file"
            id="file-upload"
            accept="audio/mp3, audio/mpeg"
            onChange={handleFileChange}
            required
            className="file:mr-4 file:py-2 file:px-4 file:rounded file:bg-[#00B76C] file:text-white file:hover:bg-[#00a35d] w-full"
          />
        </div>

        {/* Selected File Name */}
        {file && (
          <div className="text-white mb-4">Selected File: {file.name}</div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="text-red-500 mb-4">{uploadError}</div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="text-green-500 mb-4">{uploadSuccess}</div>
        )}

        {/* Uploaded Track Details */}
        {uploadedTrack && (
          <div className="bg-[#3a3a4a] p-4 rounded-lg mb-4 w-full">
            <h3 className="text-2xl text-white mb-2">Uploaded Track Details:</h3>
            <p className="text-white"><strong>Title:</strong> {uploadedTrack.title}</p>
            <p className="text-white"><strong>Genre:</strong> {uploadedTrack.genre}</p>
            <p className="text-white"><strong>BPM:</strong> {uploadedTrack.bpm}</p>
            <p className="text-white"><strong>Mood:</strong> {uploadedTrack.mood}</p>
            {uploadedTrack.trackPicture && (
              <div className="mt-2">
                <img src={uploadedTrack.trackPicture} alt="Track Picture" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
            <audio controls className="mt-2 w-full">
              <source src={uploadedTrack.audioFile} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 rounded-lg text-white font-semibold ${
            isUploading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[#00B76C] hover:bg-[#00a35d]'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
