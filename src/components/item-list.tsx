'use client';

import { useState, useEffect, useTransition } from 'react';
import { collection, onSnapshot, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item } from '@/lib/types';
import ItemCard from './item-card';
import { Input } from './ui/input';
import { Search, Loader2 } from 'lucide-react';
import { searchItems } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[] | null>(null);
  const [isSearching, startSearchTransition] = useTransition();

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: Item[] = [];
      querySnapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults(null);
      return;
    }

    startSearchTransition(async () => {
      const results = await searchItems(query);
      setSearchResults(results);
    });
  };

  const displayedItems = searchQuery ? searchResults : items;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-headline font-semibold">Items Board</h2>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Smart search for items..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {isSearching && (
             <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedItems && displayedItems.length > 0 ? (
            displayedItems.map((item) => <ItemCard key={item.id} item={item} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No items match your search.' : 'No items have been reported yet. Be the first!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
