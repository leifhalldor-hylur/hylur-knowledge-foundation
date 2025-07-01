
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
import { FileText, Trash2, ExternalLink, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
}

interface DocumentsGridProps {
  documents: Document[];
}

export function DocumentsGrid({ documents }: DocumentsGridProps) {
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document deleted successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete document',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDocId(null);
    }
  };

  const handleView = (document: Document) => {
    window.open(document.filePath, '_blank');
  };

  const handleDownload = (doc: Document) => {
    const link = globalThis.document.createElement('a');
    link.href = doc.filePath;
    link.download = doc.originalName;
    link.click();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <Card key={document.id} className="content-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 truncate">
                    {document.originalName}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {(document.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(document)}
                  className="flex-1"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDocId(document.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDocId && handleDelete(deleteDocId)}
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
