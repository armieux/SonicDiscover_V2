import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <Navbar />
            <main style={mainStyles}>{children}</main>
        </div>
    );
};

const mainStyles = {
    padding: '20px',
    minHeight: '80vh',
    backgroundColor: '#e8e8e8',
};

export default Layout;