
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

    const { title, url, description } = await request.json();

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    // Extract favicon URL
    let favicon = null;
    try {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (error) {
      // If URL parsing fails, skip favicon
    }

    const webLink = await prisma.webLink.create({
      data: {
        title,
        url,
        description: description || '',
        favicon,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ webLink });
  } catch (error) {
    console.error('Web link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create web link' },
      { status: 500 }
    );
  }
}
