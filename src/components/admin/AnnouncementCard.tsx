import React from 'react';
import { Announcement } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
        <div className="space-y-4 pt-2">
          {announcements.map((announcement, index) => (
            <React.Fragment key={announcement.id}>
              <div>
                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
              </div>
              {index < announcements.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}