
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SearchBar } from '@/components/search-bar';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Get stats
  const [documentsCount, dataTablesCount, webLinksCount] = await Promise.all([
    prisma.document.count({ where: { userId: session.user.id } }),
    prisma.dataTable.count({ where: { userId: session.user.id } }),
    prisma.webLink.count({ where: { userId: session.user.id } }),
  ]);

  // Get recent activity
  const [recentDocuments, recentTables, recentLinks] = await Promise.all([
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: 'desc' },
      take: 3,
    }),
    prisma.dataTable.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
    prisma.webLink.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {session.user.name || 'Founder'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your knowledge foundation dashboard
        </p>
      </div>

      <SearchBar />

      <StatsCards
        documentsCount={documentsCount}
        dataTablesCount={dataTablesCount}
        webLinksCount={webLinksCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity
          documents={recentDocuments}
          tables={recentTables}
          links={recentLinks}
        />
        <QuickActions />
      </div>
    </div>
  );
}
