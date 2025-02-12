import { PlaylistTrack } from "./PlaylistTrack";
import { Rating } from "./Rating";
import { TrackArtist } from "./TrackArtist";

export interface Track {
    id: number;
    title: string;
    trackpicture: string;
    genre: string;
    bpm: number;
    mood: string;
    uploaddate: Date;
    audiofile: string;
    playcount: number;
    likecount: number;
    dislikecount: number;
    averagerating: number;
    duration: number;
    
    trackartists?: TrackArtist[];
    ratings?: Rating[];
    playlisttracks?: PlaylistTrack[];
}
