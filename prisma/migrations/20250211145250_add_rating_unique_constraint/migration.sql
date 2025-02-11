/*
  Warnings:

  - A unique constraint covering the columns `[userid,trackid]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ratings_userid_trackid_key" ON "ratings"("userid", "trackid");
