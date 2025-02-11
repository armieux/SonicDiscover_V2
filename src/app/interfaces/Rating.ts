export interface Rating {
    id: number;
    userId: number;
    trackId: number;
    liked: boolean;
    ratingDate: Date;
}
