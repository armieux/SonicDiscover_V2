import { User } from "./User";

export interface TrackArtist {
    artistId: number;
    trackId: number;
    role: string;
    users: User;
}
