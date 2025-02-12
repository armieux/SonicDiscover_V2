import { Playlist } from "./Playlist";
import { Track } from "./Track";

export interface PlaylistTrack {
    playlistId: number;
    trackId: number;
    order: number;

    playlist?: Playlist;
    track?: Track;
}
