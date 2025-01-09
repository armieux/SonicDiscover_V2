import React from 'react';
import Navbar from './Navbar';
import MusicPlayer from './MusicPlayer/MusicPlayer';
import { MusicProvider } from '../context/MusicContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <MusicProvider>
            <div>
                <Navbar />
                <main style={mainStyles}>{children}</main>
                <MusicPlayer />
            </div>
        </MusicProvider>
    );
};

const mainStyles = {
    // padding: '20px',
    minHeight: '80vh',
    backgroundColor: '#e8e8e8',
};

export default Layout;