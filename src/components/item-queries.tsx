'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import type { ItemQuery } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ItemQueriesProps {
  itemId: string;
}

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}


export default function ItemQueries({ itemId }: ItemQueriesProps) {
  const db = useFirestore();
  const { user } = useUser();
  const [newQuery, setNewQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const queriesRef = useMemoFirebase(() => {
    if (!db) return null;
    // Note: The path includes the itemId to point to the subcollection
    return collection(db, 'lost_found_items', itemId, 'queries');
  }, [db, itemId]);

  const queriesQuery = useMemoFirebase(() => {
    if (!queriesRef) return null;
    return firestoreQuery(queriesRef, orderBy('createdAt', 'desc'));
  }, [queriesRef]);

  const { data: queries, isLoading } = useCollection<ItemQuery>(queriesQuery);

  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim() || !user || !db || !queriesRef) return;
    
    setIsSubmitting(true);
    const queryData = {
      text: newQuery,
      userId: user.uid,
      userName: user.displayName || 'Anonymous User',
      createdAt: serverTimestamp(),
    };

    addDoc(queriesRef, queryData)
      .then(() => {
        setNewQuery('');
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: queriesRef.path,
          operation: 'create',
          requestResourceData: queryData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="pt-4 border-t mt-4">
      <h4 className="font-semibold text-md mb-4">Queries</h4>
      {user && (
        <form onSubmit={handleAddQuery} className="flex gap-2 mb-6">
          <Input
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="Ask a question about this item..."
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !newQuery.trim()}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      )}
      <div className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        )}
        {!isLoading && queries && queries.length > 0 && (
          queries.map(query => (
            <div key={query.id} className="flex items-start gap-3 text-sm">
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>{getInitials(query.userName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold">{query.userName}</p>
                        <p className="text-xs text-muted-foreground">
                            {query.createdAt?.toDate().toLocaleDateString()}
                        </p>
                    </div>
                    <p className="text-muted-foreground">{query.text}</p>
                </div>
            </div>
          ))
        )}
        {!isLoading && (!queries || queries.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No queries yet. Be the first to ask!</p>
        )}
      </div>
    </div>
  );
}
