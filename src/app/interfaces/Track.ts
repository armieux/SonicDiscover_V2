export interface Track {
    id: number;
    title: string;
    trackPicture: string;
    genre: string;
    bpm: number;
    mood: string;
    uploadDate: Date;
    audioFile: string;
    playCount: number;
    likeCount: number;
    dislikeCount: number;
    averageRating: number;
}
