"use client";

interface BadgeItemProps {
  item: {
    badgeid: number;
    badges: {
      badgeicon?: string;
      name: string;
    };
  };
  index: number;
}

export default function BadgeItem({ item }: BadgeItemProps) {
  return (
    <div className="text-center">
      <img
        src={item.badges.badgeicon ?? "https://placehold.co/100"}
        alt={item.badges.name}
        className="w-12 h-12"
      />
      <p className="text-white text-xs">{item.badges.name}</p>
    </div>
  );
}
