
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddLinkDialogProps {
  children: React.ReactNode;
}

export function AddLinkDialog({ children }: AddLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = async () => {
    setError('');
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsAdding(true);
    
    try {
      const response = await fetch('/api/web-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Web link added successfully',
        });
        setIsOpen(false);
        resetForm();
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add link');
      }
    } catch (error) {
      setError('Failed to add link. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setError('');
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    // Auto-add https:// if no protocol is specified
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      if (!value.includes('://')) {
        setUrl(`https://${value}`);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Add Web Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter link title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isAdding}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={isAdding}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the link"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isAdding}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
