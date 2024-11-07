export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture: string;
    joinDate: Date;
    followersCount: number;
    followingCount: number;
}
