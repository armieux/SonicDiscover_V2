import { Badge } from "./Badge";
import { User } from "./User";

export interface UserBadge {
    userId: number;
    badgeId: number;
    awardedDate: Date;

    user: User;
    badge: Badge;
}
