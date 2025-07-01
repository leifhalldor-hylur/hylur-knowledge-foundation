
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { WebLinksGrid } from '@/components/web-links/web-links-grid';
import { AddLinkDialog } from '@/components/web-links/add-link-dialog';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WebLinksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const webLinks = await prisma.webLink.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LinkIcon className="w-8 h-8 text-primary" />
            Web Links
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your important website links
          </p>
        </div>
        <AddLinkDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        </AddLinkDialog>
      </div>

      {webLinks.length === 0 ? (
        <div className="text-center py-12">
          <LinkIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No web links yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first web link to build your knowledge collection
          </p>
          <AddLinkDialog>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          </AddLinkDialog>
        </div>
      ) : (
        <WebLinksGrid links={webLinks} />
      )}
    </div>
  );
}
