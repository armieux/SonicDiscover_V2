"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const FollowButton = ({ userId, isFollowing }: { userId: number; isFollowing: boolean }) => {
    const [following, setFollowing] = useState(isFollowing);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFollow = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}/follow`, {
                method: "POST",
                credentials: "include",
            });
            if (response.ok) {
                setFollowing(!following);
                router.refresh();
            }
        } catch (error) {
            console.error("Error following user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`px-4 py-2 rounded ${following ? "bg-red-500" : "bg-green-500"} text-white`}
            onClick={handleFollow}
            disabled={loading}
        >
            {loading ? "..." : following ? "Unfollow" : "Follow"}
        </button>
    );
};
