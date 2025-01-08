import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/app/interfaces/User';
import AuthService from '@/app/services/authService';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const router = useRouter();
    const { userId } = router.query;

    useEffect(() => {
        const fetchUser = async () => {
            // Replace with actual API call to fetch user data
            const fetchedUser = await fetch(`/api/users/${userId}`).then((res) => res.json());
            setUser(fetchedUser);

            // Check if the profile belongs to the logged-in user
            const currentUser = AuthService.getCurrentUser();
            if (currentUser && currentUser.id === fetchedUser.id) {
                setIsOwnProfile(true);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
        <h1>Profile</h1>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        {/* Display additional fields based on whether it's the user's own profile */}
        {isOwnProfile ? (
            <div>
            <p>Followers: {user.followersCount}</p>
            <p>Following: {user.followingCount}</p>
            {/* Add more personal information and settings */}
            </div>
        ) : (
            <div>
            {/* Add information and actions relevant to viewing another user's profile */}
            </div>
        )}
        </div>
    );
};

export default ProfilePage;
