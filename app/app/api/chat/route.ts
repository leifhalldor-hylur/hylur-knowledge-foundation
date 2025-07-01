
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

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's knowledge base context
    const [documents, dataTables, webLinks] = await Promise.all([
      prisma.document.findMany({
        where: { userId: session.user.id },
        select: { originalName: true, uploadedAt: true },
        orderBy: { uploadedAt: 'desc' },
        take: 10,
      }),
      prisma.dataTable.findMany({
        where: { userId: session.user.id },
        select: { name: true, description: true, columns: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.webLink.findMany({
        where: { userId: session.user.id },
        select: { title: true, url: true, description: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Build context for the AI
    const context = `
You are an AI assistant for the Hylur knowledge foundation platform. You have access to the user's knowledge base:

DOCUMENTS (${documents.length} PDFs):
${documents.map(doc => `- ${doc.originalName} (uploaded ${doc.uploadedAt.toISOString().split('T')[0]})`).join('\n')}

DATA TABLES (${dataTables.length} tables):
${dataTables.map(table => `- ${table.name}: ${table.description || 'No description'} (${Array.isArray(table.columns) ? table.columns.length : 0} columns)`).join('\n')}

WEB LINKS (${webLinks.length} links):
${webLinks.map(link => `- ${link.title}: ${link.url} - ${link.description || 'No description'}`).join('\n')}

User's message: ${message}

Please provide a helpful response based on the user's knowledge base context. If the user asks about specific documents, tables, or links, reference them appropriately.
    `;

    // Call the LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: context,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
