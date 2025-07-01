
'use client';

import { Session } from 'next-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  user: Session['user'];
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="bg-card border-b border-border px-6 py-4 lg:pl-6">
      <div className="flex items-center justify-between lg:justify-end">
        <div className="lg:hidden">
          {/* Mobile menu handled by sidebar */}
        </div>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user.name || 'Founder'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
