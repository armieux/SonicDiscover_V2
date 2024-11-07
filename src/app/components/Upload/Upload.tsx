// src/pages/UploadPage.tsx

import React, { useState } from 'react';

const Upload: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const handleUpload = (event: React.FormEvent) => {
        event.preventDefault();
        // Here you can handle the upload logic if you connect it to an API later
        console.log("File ready to upload:", fileName);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#353445]">
            <h2 className="text-4xl text-white mb-6">Upload Your MP3</h2>
            <form onSubmit={handleUpload} className="w-full max-w-md bg-[#282733] p-8 rounded-lg">
                <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="file-upload">
                        Choose MP3 file:
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        accept="audio/mp3"
                        onChange={handleFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded file:bg-[#00B76C] file:text-white file:hover:bg-[#00a35d]"
                    />
                </div>
                {fileName && (
                    <div className="text-white mb-4">Selected File: {fileName}</div>
                )}
                <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#00B76C] text-white font-semibold hover:bg-[#00a35d]"
                >
                    Upload
                </button>
            </form>
        </div>
    );
};

export default Upload;