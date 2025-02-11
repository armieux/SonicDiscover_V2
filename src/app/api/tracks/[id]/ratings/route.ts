import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/app/services/authService'; // your auth logic
import type { RatingAction } from '@/app/interfaces/RatingAction';

const prisma = new PrismaClient();

export async function POST(request: Request, context : { params: { id: string } }) {
  try {
    const { id } = await context.params;
    // 1. Parse the trackId from the route
    const trackId = parseInt(id, 10);
    if (isNaN(trackId)) {
      return NextResponse.json({ error: 'Invalid track ID' }, { status: 400 });
    }

    // 2. Read the action from the request body: { action: 'like' | 'dislike' | 'none' }
    const { action }: { action: RatingAction } = await request.json();
    if (!['like', 'dislike', 'none'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 3. Get the current user
    const user = await authService.getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Fetch the existing rating (if any) for this user & track
    const existingRating = await prisma.ratings.findUnique({
      where: {
        // composite unique constraint or manual find
        // We'll assume you have a unique constraint (userid, trackid)
        // If you don't, you can do .findFirst with filtering
        userid_trackid: {
          userid: user.id,
          trackid: trackId,
        },
      },
    });

    // 5. Fetch the track so we can adjust like/dislike counts
    const track = await prisma.tracks.findUnique({
      where: { id: trackId },
    });
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    let newLikeCount = track.likecount || 0;
    let newDislikeCount = track.dislikecount || 0;

    // If there's an existing rating, remove its effect from track counts first
    if (existingRating) {
      if (existingRating.liked) {
        newLikeCount = Math.max(0, newLikeCount - 1);
      } else {
        // was a dislike
        newDislikeCount = Math.max(0, newDislikeCount - 1);
      }
    }

    // 6. If action is 'none', remove the rating record entirely
    if (action === 'none') {
      if (existingRating) {
        await prisma.ratings.delete({
          where: {
            id: existingRating.id,
          },
        });
      }
    } else {
      // 'like' or 'dislike'
      const liked = action === 'like';

      // If the user had no rating or a different rating, create or update
      if (!existingRating) {
        // create new rating row
        await prisma.ratings.create({
          data: {
            userid: user.id,
            trackid: trackId,
            liked,
            ratingdate: new Date(),
          },
        });
      } else {
        // update the existing rating with the new liked value
        await prisma.ratings.update({
          where: { id: existingRating.id },
          data: { liked },
        });
      }

      // increment the track count for the new rating
      if (liked) {
        newLikeCount += 1;
      } else {
        newDislikeCount += 1;
      }
    }

    // 7. Update the track’s likecount / dislikecount
    const updatedTrack = await prisma.tracks.update({
      where: { id: trackId },
      data: {
        likecount: newLikeCount,
        dislikecount: newDislikeCount,
      },
    });

    return NextResponse.json(updatedTrack);
  } catch (err) {
    console.error('Error updating rating', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
