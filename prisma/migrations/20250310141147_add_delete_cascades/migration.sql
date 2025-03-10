-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_trackid_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userid_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followeduserid_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followinguserid_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_creatorid_fkey";

-- DropForeignKey
ALTER TABLE "playlisttracks" DROP CONSTRAINT "playlisttracks_playlistid_fkey";

-- DropForeignKey
ALTER TABLE "playlisttracks" DROP CONSTRAINT "playlisttracks_trackid_fkey";

-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_trackid_fkey";

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followeduserid_fkey" FOREIGN KEY ("followeduserid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followinguserid_fkey" FOREIGN KEY ("followinguserid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_creatorid_fkey" FOREIGN KEY ("creatorid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playlisttracks" ADD CONSTRAINT "playlisttracks_playlistid_fkey" FOREIGN KEY ("playlistid") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playlisttracks" ADD CONSTRAINT "playlisttracks_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
