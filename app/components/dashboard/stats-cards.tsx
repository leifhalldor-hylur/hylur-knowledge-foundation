
'use client';

import { useEffect, useState } from 'react';
import { FileText, Table, Link as LinkIcon } from 'lucide-react';

interface StatsCardsProps {
  documentsCount: number;
  dataTablesCount: number;
  webLinksCount: number;
}

function CountUpAnimation({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const incrementTime = Math.max(duration / end, 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span className="count-up">{count}</span>;
}

export function StatsCards({ documentsCount, dataTablesCount, webLinksCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="stat-card">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              <CountUpAnimation target={documentsCount} />
            </p>
            <p className="text-muted-foreground">Documents</p>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Table className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              <CountUpAnimation target={dataTablesCount} />
            </p>
            <p className="text-muted-foreground">Data Tables</p>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <LinkIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              <CountUpAnimation target={webLinksCount} />
            </p>
            <p className="text-muted-foreground">Web Links</p>
          </div>
        </div>
      </div>
    </div>
  );
}
