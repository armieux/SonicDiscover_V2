/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "badgeicon" VARCHAR,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "criteria" TEXT,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "trackid" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "commentdate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "followinguserid" INTEGER NOT NULL,
    "followeduserid" INTEGER NOT NULL,
    "createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("followinguserid","followeduserid")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "playlistpicture" VARCHAR,
    "description" VARCHAR,
    "creatorid" INTEGER NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlisttracks" (
    "playlistid" INTEGER NOT NULL,
    "trackid" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "playlisttracks_pkey" PRIMARY KEY ("playlistid","trackid")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "trackid" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "ratingdate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistics" (
    "id" SERIAL NOT NULL,
    "trackid" INTEGER NOT NULL,
    "userid" INTEGER NOT NULL,
    "listencount" INTEGER DEFAULT 0,
    "favorite" BOOLEAN DEFAULT false,
    "listeningdate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trackartists" (
    "artistid" INTEGER NOT NULL,
    "trackid" INTEGER NOT NULL,
    "role" VARCHAR NOT NULL,

    CONSTRAINT "trackartists_pkey" PRIMARY KEY ("artistid","trackid")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "trackpicture" VARCHAR,
    "genre" VARCHAR,
    "bpm" INTEGER,
    "mood" VARCHAR,
    "uploaddate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audiofile" VARCHAR NOT NULL,
    "playcount" INTEGER DEFAULT 0,
    "likecount" INTEGER DEFAULT 0,
    "dislikecount" INTEGER DEFAULT 0,
    "averagerating" DOUBLE PRECISION DEFAULT 0.0,
    "duration" INTEGER,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userbadges" (
    "userid" INTEGER NOT NULL,
    "badgeid" INTEGER NOT NULL,
    "awardeddate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userbadges_pkey" PRIMARY KEY ("userid","badgeid")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "role" VARCHAR NOT NULL,
    "profilepicture" VARCHAR,
    "joindate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerscount" INTEGER DEFAULT 0,
    "followingcount" INTEGER DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followeduserid_fkey" FOREIGN KEY ("followeduserid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followinguserid_fkey" FOREIGN KEY ("followinguserid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_creatorid_fkey" FOREIGN KEY ("creatorid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playlisttracks" ADD CONSTRAINT "playlisttracks_playlistid_fkey" FOREIGN KEY ("playlistid") REFERENCES "playlists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playlisttracks" ADD CONSTRAINT "playlisttracks_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackartists" ADD CONSTRAINT "trackartists_artistid_fkey" FOREIGN KEY ("artistid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackartists" ADD CONSTRAINT "trackartists_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userbadges" ADD CONSTRAINT "userbadges_badgeid_fkey" FOREIGN KEY ("badgeid") REFERENCES "badges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userbadges" ADD CONSTRAINT "userbadges_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
