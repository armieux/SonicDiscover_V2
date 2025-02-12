import { PlaylistTrack } from "./PlaylistTrack";
import { Rating } from "./Rating";
import { TrackArtist } from "./TrackArtist";
import { UserBadge } from "./UserBadge";

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    profilepicture: string;
    joinDate: Date;
    followerscount: number;
    followingcount: number;

    userbadges?: UserBadge[];
    trackartists?: TrackArtist[];
    ratings?: Rating[];
    playlists?: PlaylistTrack[];
}
