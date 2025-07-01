
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Link as LinkIcon, Trash2, ExternalLink, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface WebLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  createdAt: Date;
}

interface WebLinksGridProps {
  links: WebLink[];
}

export function WebLinksGrid({ links }: WebLinksGridProps) {
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/web-links/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Web link deleted successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete web link',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete web link',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteLinkId(null);
    }
  };

  const handleVisit = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => (
          <Card key={link.id} className="content-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {link.favicon ? (
                    <div className="relative w-4 h-4">
                      <Image
                        src={link.favicon}
                        alt=""
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <Globe className="w-4 h-4 text-purple-600 hidden" />
                    </div>
                  ) : (
                    <Globe className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 truncate">
                    {link.title}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {getDomain(link.url)}
                    </p>
                    {link.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {link.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVisit(link.url)}
                  className="flex-1"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Visit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteLinkId(link.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteLinkId} onOpenChange={() => setDeleteLinkId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Web Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this web link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLinkId && handleDelete(deleteLinkId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
