import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import authService from '@/app/services/authService';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const followedUserId = parseInt(id, 10);
    if (isNaN(followedUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get logged-in user
    const user = await authService.getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent following self
    if (user.id === followedUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followinguserid_followeduserid: {
          followinguserid: user.id,
          followeduserid: followedUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow if already following
      await prisma.follows.delete({
        where: {
          followinguserid_followeduserid: {
            followinguserid: user.id,
            followeduserid: followedUserId,
          },
        },
      });

      // Decrement counters
      await prisma.users.update({
        where: { id: user.id },
        data: { followingcount: { decrement: 1 } },
      });

      await prisma.users.update({
        where: { id: followedUserId },
        data: { followerscount: { decrement: 1 } },
      });

      return NextResponse.json({ message: "Unfollowed successfully", followed: false });
    } else {
      // Follow if not already following
      await prisma.follows.create({
        data: {
          followinguserid: user.id,
          followeduserid: followedUserId,
        },
      });

      // Increment counters
      await prisma.users.update({
        where: { id: user.id },
        data: { followingcount: { increment: 1 } },
      });

      await prisma.users.update({
        where: { id: followedUserId },
        data: { followerscount: { increment: 1 } },
      });

      return NextResponse.json({ message: "Followed successfully", followed: true });
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
