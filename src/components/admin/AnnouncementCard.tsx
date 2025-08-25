import React from 'react';
import { Announcement } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface AnnouncementCardProps {
  announcements: Announcement[];
}

export default function AnnouncementCard({ announcements }: AnnouncementCardProps) {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pengumuman</CardTitle>
        <Megaphone className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {announcements.map(announcement => (
              <CarouselItem key={announcement.id}>
                <div className="p-1">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {announcements.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
}