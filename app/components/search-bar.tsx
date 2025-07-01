
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Table, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'document' | 'table' | 'link';
  title: string;
  description: string;
  url: string;
  createdAt: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'table':
        return <Table className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search documents, tables, and links..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
          onFocus={() => query.trim().length > 2 && setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-full max-w-lg z-50 max-h-96 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={cn(
                      "p-1 rounded",
                      result.type === 'document' && "bg-blue-100 text-blue-600",
                      result.type === 'table' && "bg-green-100 text-green-600",
                      result.type === 'link' && "bg-purple-100 text-purple-600"
                    )}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{result.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
