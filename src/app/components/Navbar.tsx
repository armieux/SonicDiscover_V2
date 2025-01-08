'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsFillHouseDoorFill, BsFileEarmarkPlusFill/*, BsClockHistory, BsFileEarmarkPlusFill, BsFilePersonFill, BsFileCodeFill*/ } from "react-icons/bs";

import AuthService from '../services/authService';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Update the state to reflect the current auth status
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    const linkClasses = (path: string) =>
        pathname === path
            ? 'text-yellow-400 font-medium transition duration-300 hover:text-yellow-500'
            : 'text-white font-medium hover:text-yellow-400 transition duration-300';

    return (
        <nav className="bg-gray-900 p-6 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-2xl font-bold">
                    <Link href="/" className="hover:text-yellow-400 transition duration-300">
                        Sonic Discover
                    </Link>
                </div>
                <ul className="flex space-x-6">
                    {isLoggedIn ? (
                        // Links to show when user is logged in
                        <>
                            <li>
                                <Link href="/" className={linkClasses('/')}>
                                    <div className="flex items-center">
                                        <BsFillHouseDoorFill /> <p className="pl-1">Accueil</p>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link href="/createTrack" className={linkClasses('/createTrack')}>
                                    <div className="flex items-center">
                                        <BsFileEarmarkPlusFill /> <p className="pl-1">Upload</p>
                                    </div>
                                </Link>
                            </li>
                            {/* Add more links for logged-in users here */}
                        </>
                    ) : (
                        // Link to show when user is not logged in
                        <li>
                            <Link href="/login" className="text-white font-medium hover:text-yellow-400 transition duration-300">
                                <div className="flex items-center">
                                    <p>Connexion</p>
                                </div>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;