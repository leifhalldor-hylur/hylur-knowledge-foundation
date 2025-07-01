
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TableEditor } from '@/components/data-tables/table-editor';
import { TableVisualization } from '@/components/data-tables/table-visualization';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Table, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function DataTablePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const dataTable = await prisma.dataTable.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!dataTable) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/data-tables">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{dataTable.name}</h1>
          {dataTable.description && (
            <p className="text-muted-foreground">{dataTable.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor" className="gap-2">
            <Table className="w-4 h-4" />
            Edit Data
          </TabsTrigger>
          <TabsTrigger value="visualization" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Visualize
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="space-y-4">
          <TableEditor table={dataTable as any} />
        </TabsContent>
        <TabsContent value="visualization" className="space-y-4">
          <TableVisualization table={dataTable as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
