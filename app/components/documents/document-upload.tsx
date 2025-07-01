
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  children: React.ReactNode;
}

export function DocumentUpload({ children }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
        });
        setIsOpen(false);
        setFile(null);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError('');
    setIsUploading(false);
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
            <Upload className="w-5 h-5" />
            Upload PDF Document
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
