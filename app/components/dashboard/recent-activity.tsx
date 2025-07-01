
'use client';

import Link from 'next/link';
import { FileText, Table, Link as LinkIcon, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  originalName: string;
  uploadedAt: Date;
}

interface DataTable {
  id: string;
  name: string;
  updatedAt: Date;
}

interface WebLink {
  id: string;
  title: string;
  createdAt: Date;
}

interface RecentActivityProps {
  documents: Document[];
  tables: DataTable[];
  links: WebLink[];
}

export function RecentActivity({ documents, tables, links }: RecentActivityProps) {
  const allActivities = [
    ...documents.map(doc => ({
      id: doc.id,
      type: 'document' as const,
      title: doc.originalName,
      date: doc.uploadedAt,
      url: '/dashboard/documents',
    })),
    ...tables.map(table => ({
      id: table.id,
      type: 'table' as const,
      title: table.name,
      date: table.updatedAt,
      url: `/dashboard/data-tables/${table.id}`,
    })),
    ...links.map(link => ({
      id: link.id,
      type: 'link' as const,
      title: link.title,
      date: link.createdAt,
      url: '/dashboard/web-links',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'table':
        return <Table className="w-4 h-4 text-green-600" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {allActivities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                {getIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </p>
                </div>
                <Link href={activity.url}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
