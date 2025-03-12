"use client";
import { useState } from 'react';

interface ExpandableListProps<T> {
  items: T[];
  ItemComponent: React.ComponentType<{ item: T; index: number; isOwnProfile: boolean; }>;
  isOwnProfile: boolean;
}

export default function ExpandableList<T>({ items, ItemComponent, isOwnProfile }: ExpandableListProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);

  return (
    <div>
      <ul>
        {visibleItems.map((item, index) => (
          <li key={index}>
            <ItemComponent item={item} index={index} isOwnProfile={isOwnProfile}/>
          </li>
        ))}
      </ul>
      {items.length > 3 && (
        <button onClick={() => setExpanded(!expanded)} className="text-blue-400 hover:underline">
          {expanded ? 'Voir plus' : 'Voir moins'}
        </button>
      )}
    </div>
  );
}
