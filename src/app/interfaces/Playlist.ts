import { PlaylistTrack } from "./PlaylistTrack";
import { User } from "./User";

export interface Playlist {
    id: number;
    name: string;
    playlistPicture: string;
    description: string;
    creatorId: number;

    playlisttracks: PlaylistTrack[];
    playlistcreator: User;
}
