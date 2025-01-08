-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    profile_picture VARCHAR,
    join_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0
);

-- Create the tracks table
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    track_picture VARCHAR,
    genre VARCHAR,
    bpm INTEGER,
    mood VARCHAR,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    audio_file VARCHAR NOT NULL,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    average_rating FLOAT DEFAULT 0.0
);

-- Create the track_artists table
CREATE TABLE track_artists (
    artist_id INTEGER NOT NULL REFERENCES users(id),
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    role VARCHAR NOT NULL,
    PRIMARY KEY (artist_id, track_id)
);

-- Create the ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    rating INTEGER NOT NULL,
    rating_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    playlist_picture VARCHAR,
    description VARCHAR,
    creator_id INTEGER NOT NULL REFERENCES users(id)
);

-- Create the playlist_tracks table
CREATE TABLE playlist_tracks (
    playlist_id INTEGER NOT NULL REFERENCES playlists(id),
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    "order" INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, track_id)
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    content TEXT NOT NULL,
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the follows table
CREATE TABLE follows (
    following_user_id INTEGER NOT NULL REFERENCES users(id),
    followed_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (following_user_id, followed_user_id)
);

-- Create the badges table
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    badge_icon VARCHAR,
    name VARCHAR NOT NULL,
    description TEXT,
    criteria TEXT
);

-- Create the user_badges table
CREATE TABLE user_badges (
    user_id INTEGER NOT NULL REFERENCES users(id),
    badge_id INTEGER NOT NULL REFERENCES badges(id),
    awarded_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- Create the statistics table
CREATE TABLE statistics (
    id SERIAL PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    listen_count INTEGER DEFAULT 0,
    favorite BOOLEAN DEFAULT FALSE,
    listening_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
