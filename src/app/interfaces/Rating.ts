import { Track } from "./Track";
import { User } from "./User";

export interface Rating {
    id: number;
    userId: number;
    trackId: number;
    liked: boolean;
    ratingDate: Date;
    user: User;
    track: Track;
}
