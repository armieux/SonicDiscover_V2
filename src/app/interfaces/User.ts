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
}
