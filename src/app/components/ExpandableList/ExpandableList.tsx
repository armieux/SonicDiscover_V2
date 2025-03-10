"use client";
import { useState } from 'react';

interface ExpandableListProps<T> {
  items: T[];
  ItemComponent: React.ComponentType<{ item: T; index: number }>;
}

export default function ExpandableList<T>({ items, ItemComponent }: ExpandableListProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);

  return (
    <div>
      <ul>
        {visibleItems.map((item, index) => (
          <li key={index}>
            <ItemComponent item={item} index={index} />
          </li>
        ))}
      </ul>
      {items.length > 3 && (
        <button onClick={() => setExpanded(!expanded)} className="text-blue-400 hover:underline">
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
}
