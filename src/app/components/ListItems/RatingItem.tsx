"use client";

interface RatingItemProps {
  item: {
    tracks: {
      id: number;
      trackpicture?: string;
      title: string;
    };
    liked: boolean;
  };
  index: number;
  isOwnProfile: boolean;
}

export default function RatingItem({ item }: RatingItemProps) {
  const { tracks, liked } = item;
  return (
    <div className="flex items-center text-white">
      <img
        src={tracks.trackpicture || "https://placehold.co/50"}
        alt={tracks.title}
        className="w-8 h-8 inline-block m-1"
      />
      <span>
        {tracks.title} - {liked ? "👍 Liked" : "👎 Disliked"}
      </span>
    </div>
  );
}
