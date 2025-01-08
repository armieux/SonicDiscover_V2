-- init.sql: Initialize PostgreSQL Database for Sonic Discover

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    profilePicture VARCHAR,
    joinDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    followersCount INTEGER DEFAULT 0,
    followingCount INTEGER DEFAULT 0
);

-- Create the tracks table
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    trackPicture VARCHAR,
    genre VARCHAR,
    bpm INTEGER,
    mood VARCHAR,
    uploadDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    audioFile VARCHAR NOT NULL,
    playCount INTEGER DEFAULT 0,
    likeCount INTEGER DEFAULT 0,
    dislikeCount INTEGER DEFAULT 0,
    averageRating FLOAT DEFAULT 0.0
);

-- Create the trackArtists table
CREATE TABLE trackArtists (
    artistId INTEGER NOT NULL REFERENCES users(id),
    trackId INTEGER NOT NULL REFERENCES tracks(id),
    role VARCHAR NOT NULL,
    PRIMARY KEY (artistId, trackId)
);

-- Create the ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    trackId INTEGER NOT NULL REFERENCES tracks(id),
    rating INTEGER NOT NULL,
    ratingDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    playlistPicture VARCHAR,
    description VARCHAR,
    creatorId INTEGER NOT NULL REFERENCES users(id)
);

-- Create the playlistTracks table
CREATE TABLE playlistTracks (
    playlistId INTEGER NOT NULL REFERENCES playlists(id),
    trackId INTEGER NOT NULL REFERENCES tracks(id),
    "order" INTEGER NOT NULL,
    PRIMARY KEY (playlistId, trackId)
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    trackId INTEGER NOT NULL REFERENCES tracks(id),
    content TEXT NOT NULL,
    commentDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the follows table
CREATE TABLE follows (
    followingUserId INTEGER NOT NULL REFERENCES users(id),
    followedUserId INTEGER NOT NULL REFERENCES users(id),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (followingUserId, followedUserId)
);

-- Create the badges table
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    badgeIcon VARCHAR,
    name VARCHAR NOT NULL,
    description TEXT,
    criteria TEXT
);

-- Create the userBadges table
CREATE TABLE userBadges (
    userId INTEGER NOT NULL REFERENCES users(id),
    badgeId INTEGER NOT NULL REFERENCES badges(id),
    awardedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, badgeId)
);

-- Create the statistics table
CREATE TABLE statistics (
    id SERIAL PRIMARY KEY,
    trackId INTEGER NOT NULL REFERENCES tracks(id),
    userId INTEGER NOT NULL REFERENCES users(id),
    listenCount INTEGER DEFAULT 0,
    favorite BOOLEAN DEFAULT FALSE,
    listeningDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
