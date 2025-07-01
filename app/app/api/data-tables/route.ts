
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, columns } = await request.json();

    if (!name || !columns) {
      return NextResponse.json({ error: 'Name and columns are required' }, { status: 400 });
    }

    const dataTable = await prisma.dataTable.create({
      data: {
        name,
        description: description || '',
        columns,
        rows: [],
        userId: session.user.id,
      },
    });

    return NextResponse.json({ dataTable });
  } catch (error) {
    console.error('Data table creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create data table' },
      { status: 500 }
    );
  }
}
