-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_userid_fkey";

-- DropForeignKey
ALTER TABLE "statistics" DROP CONSTRAINT "statistics_trackid_fkey";

-- DropForeignKey
ALTER TABLE "statistics" DROP CONSTRAINT "statistics_userid_fkey";

-- DropForeignKey
ALTER TABLE "trackartists" DROP CONSTRAINT "trackartists_artistid_fkey";

-- DropForeignKey
ALTER TABLE "trackartists" DROP CONSTRAINT "trackartists_trackid_fkey";

-- DropForeignKey
ALTER TABLE "userbadges" DROP CONSTRAINT "userbadges_badgeid_fkey";

-- DropForeignKey
ALTER TABLE "userbadges" DROP CONSTRAINT "userbadges_userid_fkey";

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackartists" ADD CONSTRAINT "trackartists_artistid_fkey" FOREIGN KEY ("artistid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackartists" ADD CONSTRAINT "trackartists_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userbadges" ADD CONSTRAINT "userbadges_badgeid_fkey" FOREIGN KEY ("badgeid") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userbadges" ADD CONSTRAINT "userbadges_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
