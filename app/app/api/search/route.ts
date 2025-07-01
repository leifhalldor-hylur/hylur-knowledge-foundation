
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    // Search across documents, data tables, and web links
    const [documents, dataTables, webLinks] = await Promise.all([
      prisma.document.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { originalName: { contains: query, mode: 'insensitive' } },
            { filename: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.dataTable.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.webLink.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { url: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    const results = [
      ...documents.map(doc => ({
        id: doc.id,
        type: 'document',
        title: doc.originalName,
        description: `PDF document • ${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`,
        url: `/dashboard/documents`,
        createdAt: doc.uploadedAt,
      })),
      ...dataTables.map(table => ({
        id: table.id,
        type: 'table',
        title: table.name,
        description: table.description || 'Data table',
        url: `/dashboard/data-tables/${table.id}`,
        createdAt: table.createdAt,
      })),
      ...webLinks.map(link => ({
        id: link.id,
        type: 'link',
        title: link.title,
        description: link.description || link.url,
        url: `/dashboard/web-links`,
        createdAt: link.createdAt,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
