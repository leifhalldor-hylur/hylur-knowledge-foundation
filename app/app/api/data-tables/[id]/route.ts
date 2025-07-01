
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, columns, rows } = await request.json();

    const dataTable = await prisma.dataTable.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!dataTable) {
      return NextResponse.json({ error: 'Data table not found' }, { status: 404 });
    }

    const updatedTable = await prisma.dataTable.update({
      where: { id: params.id },
      data: {
        name: name || dataTable.name,
        description: description !== undefined ? description : dataTable.description,
        columns: columns || dataTable.columns,
        rows: rows || dataTable.rows,
      },
    });

    return NextResponse.json({ dataTable: updatedTable });
  } catch (error) {
    console.error('Data table update error:', error);
    return NextResponse.json(
      { error: 'Failed to update data table' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataTable = await prisma.dataTable.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!dataTable) {
      return NextResponse.json({ error: 'Data table not found' }, { status: 404 });
    }

    await prisma.dataTable.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Data table deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data table' },
      { status: 500 }
    );
  }
}
