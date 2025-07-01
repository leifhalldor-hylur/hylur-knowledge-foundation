
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Table, Link as LinkIcon, MessageCircle, Zap } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/documents">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Upload Document</span>
            </Button>
          </Link>
          
          <Link href="/dashboard/data-tables">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Table className="w-6 h-6" />
              <span className="text-sm">Create Table</span>
            </Button>
          </Link>
          
          <Link href="/dashboard/web-links">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <LinkIcon className="w-6 h-6" />
              <span className="text-sm">Add Link</span>
            </Button>
          </Link>
          
          <Link href="/dashboard/chat">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">Ask Hylur</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
