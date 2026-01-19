'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Item } from '@/lib/types';
import { MapPin, User, Info, Calendar, Trash2, MessageSquare } from 'lucide-react';
import { CategoryIcon } from './icons';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFirestore, useUser } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import ItemQueries from './item-queries';
import { useToast } from '@/hooks/use-toast';


interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const isOwner = user && user.uid === item.userId;

  const formattedDate = item.createdAt?.toDate().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    if (!isOwner || !db) return;
    try {
      await deleteDoc(doc(db, 'lost_found_items', item.id));
      toast({
        title: 'Item Deleted',
        description: 'The item has been successfully removed from the board.',
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem deleting the item.',
      });
    }
  };

  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-500">
      <Card className="w-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <CardHeader className="flex-row items-center gap-4 space-y-0 p-4 bg-secondary/30">
          <CategoryIcon category={item.category} className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                <span>{item.category}</span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                </div>
            </div>
          </div>
          <Badge
            variant={item.type === 'Lost' ? 'destructive' : 'default'}
            className={
              item.type === 'Lost'
                ? 'bg-[#DC2626] text-white border-transparent'
                : 'bg-[#16A34A] text-white border-transparent hover:bg-[#16A34A]/90'
            }
          >
            {item.type}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-sm flex-grow">
          {item.photos && item.photos.length > 0 && (
            <div className="mb-4">
              {item.photos.length === 1 ? (
                <Image 
                  src={item.photos[0]} 
                  alt={item.name}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-video"
                />
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {item.photos.map((photo, index) => (
                      <CarouselItem key={index}>
                        <Image 
                          src={photo} 
                          alt={`${item.name} - photo ${index + 1}`}
                          width={600}
                          height={400}
                          className="rounded-lg object-cover w-full aspect-video"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              )}
            </div>
          )}
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="flex-1">
              <span className="font-semibold">Description: </span>{item.description}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="flex-1">
              <span className="font-semibold">Location: </span>{item.location}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="flex-1">
              <span className="font-semibold">Contact: </span>{item.contact}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-secondary/20 flex-col items-start">
            <Collapsible className="w-full">
              <div className="flex items-center justify-between w-full">
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="text-sm">
                      <MessageSquare className="mr-2 h-4 w-4"/> 
                      Show Queries
                    </Button>
                  </CollapsibleTrigger>
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this item
                          and remove its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <CollapsibleContent>
                <ItemQueries itemId={item.id} />
              </CollapsibleContent>
            </Collapsible>
        </CardFooter>
      </Card>
    </div>
  );
}
