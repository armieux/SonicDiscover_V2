import { Follow } from "./Follow";
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
    profilepicture: string | null;
    joindate: Date;
    followerscount: number | null;
    followingcount: number | null;

    userbadges?: UserBadge[];
    trackartists?: TrackArtist[];
    ratings?: Rating[];
    playlists?: PlaylistTrack[];
    followers?: Follow[];
    following?: Follow[];
}
