
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DataTablesGrid } from '@/components/data-tables/data-tables-grid';
import { CreateTableDialog } from '@/components/data-tables/create-table-dialog';
import { Button } from '@/components/ui/button';
import { Table, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DataTablesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const dataTables = await prisma.dataTable.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Table className="w-8 h-8 text-primary" />
            Data Tables
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your data tables with visualization
          </p>
        </div>
        <CreateTableDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Table
          </Button>
        </CreateTableDialog>
      </div>

      {dataTables.length === 0 ? (
        <div className="text-center py-12">
          <Table className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data tables yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first data table to organize and visualize your data
          </p>
          <CreateTableDialog>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Table
            </Button>
          </CreateTableDialog>
        </div>
      ) : (
        <DataTablesGrid tables={dataTables} />
      )}
    </div>
  );
}
