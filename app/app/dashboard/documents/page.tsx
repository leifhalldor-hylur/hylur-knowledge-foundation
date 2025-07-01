
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DocumentsGrid } from '@/components/documents/documents-grid';
import { DocumentUpload } from '@/components/documents/document-upload';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your PDF documents and files
          </p>
        </div>
        <DocumentUpload>
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload PDF
          </Button>
        </DocumentUpload>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first PDF document to get started
          </p>
          <DocumentUpload>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload PDF
            </Button>
          </DocumentUpload>
        </div>
      ) : (
        <DocumentsGrid documents={documents} />
      )}
    </div>
  );
}
