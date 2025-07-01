
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webLink = await prisma.webLink.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!webLink) {
      return NextResponse.json({ error: 'Web link not found' }, { status: 404 });
    }

    await prisma.webLink.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web link deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete web link' },
      { status: 500 }
    );
  }
}
