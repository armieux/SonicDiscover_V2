export interface Comment {
    id: number;
    userId: number;
    trackId: number;
    content: string;
    commentDate: Date;
    timecode?: number; // Timecode en secondes (optionnel pour compatibilité)
    user?: {
        id: number;
        username: string;
        profilepicture?: string;
    };
}
