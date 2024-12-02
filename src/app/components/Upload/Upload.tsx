// src/app/components/Upload/Upload.tsx

'use client';

import React, { useState } from 'react';

interface UploadProps {
  onFileSelect: (file: File | null) => void;
}

const Upload: React.FC<UploadProps> = ({ onFileSelect }) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      if (
        selectedFile.type === 'audio/mpeg' ||
        selectedFile.type === 'audio/mp3'
      ) {
        onFileSelect(selectedFile);
        setFileError(null);
      } else {
        setFileError('Please select a valid MP3 file.');
        onFileSelect(null);
      }
    } else {
      onFileSelect(null);
    }
  };

  return (
    <div>
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

      {/* Error Message */}
      {fileError && <div className="text-red-500 mb-4">{fileError}</div>}
    </div>
  );
};

export default Upload;
