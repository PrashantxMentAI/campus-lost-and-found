import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Item } from '@/lib/types';
import { MapPin, User, Info, Calendar } from 'lucide-react';
import { CategoryIcon } from './icons';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const formattedDate = item.createdAt?.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-500">
      <Card className="w-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex-row items-center gap-4 space-y-0 p-4 bg-primary/10">
          <CategoryIcon category={item.category} className="h-8 w-8 text-primary-foreground" />
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
            className={item.type === 'Found' ? 'bg-accent text-accent-foreground' : ''}
          >
            {item.type}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-sm">
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
      </Card>
    </div>
  );
}
