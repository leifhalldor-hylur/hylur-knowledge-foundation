
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Table, Trash2, Edit, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface DataTable {
  id: string;
  name: string;
  description: string | null;
  columns: any;
  rows: any;
  createdAt: Date;
  updatedAt: Date;
}

interface DataTablesGridProps {
  tables: DataTable[];
}

export function DataTablesGrid({ tables }: DataTablesGridProps) {
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/data-tables/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Data table deleted successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete data table',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete data table',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTableId(null);
    }
  };

  const getTableDimensions = (table: DataTable) => {
    const columns = Array.isArray(table.columns) ? table.columns.length : 0;
    const rows = Array.isArray(table.rows) ? table.rows.length : 0;
    return `${rows} rows × ${columns} columns`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="content-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Table className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 truncate">
                    {table.name}
                  </h3>
                  <div className="space-y-1">
                    {table.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {table.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {getTableDimensions(table)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Link href={`/dashboard/data-tables/${table.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/dashboard/data-tables/${table.id}?tab=visualization`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-3 h-3" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTableId(table.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTableId} onOpenChange={() => setDeleteTableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this data table? This action cannot be undone and all data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTableId && handleDelete(deleteTableId)}
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
