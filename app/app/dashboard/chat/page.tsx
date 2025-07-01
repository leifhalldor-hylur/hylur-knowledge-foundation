
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChatInterface } from '@/components/chat/chat-interface';
import { MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-primary" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Chat with your AI team that has access to all your documents and data
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatInterface userId={session.user.id} />
      </div>
    </div>
  );
}
