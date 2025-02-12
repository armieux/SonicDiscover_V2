import { User } from "./User";

export interface Follow {
    followingUserId: number;
    followedUserId: number;
    createdAt: Date;

    followingUser: User;
    followedUser: User;
}
