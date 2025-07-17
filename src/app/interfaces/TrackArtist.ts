import { Track } from "./Track";
import { User } from "./User";

export interface TrackArtist {
    artistid: number;
    trackid: number;
    role: string;
    users: User;
    tracks: Track;
}
