
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Minus, Loader2, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateTableDialogProps {
  children: React.ReactNode;
}

interface Column {
  name: string;
  type: 'string' | 'number' | 'date';
}

export function CreateTableDialog({ children }: CreateTableDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<Column[]>([
    { name: '', type: 'string' }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'string' }]);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index: number, field: keyof Column, value: string) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    setColumns(updated);
  };

  const handleCreate = async () => {
    setError('');
    
    if (!name.trim()) {
      setError('Table name is required');
      return;
    }

    const validColumns = columns.filter(col => col.name.trim());
    if (validColumns.length === 0) {
      setError('At least one column is required');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/data-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          columns: validColumns,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: 'Data table created successfully',
        });
        setIsOpen(false);
        resetForm();
        router.push(`/dashboard/data-tables/${data.dataTable.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create table');
      }
    } catch (error) {
      setError('Failed to create table. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setColumns([{ name: '', type: 'string' }]);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Create Data Table
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name</Label>
              <Input
                id="name"
                placeholder="Enter table name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this table contains"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Columns</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColumn}
                disabled={isCreating}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Column
              </Button>
            </div>

            <div className="space-y-3">
              {columns.map((column, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Column name"
                      value={column.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      value={column.type}
                      onValueChange={(value) => updateColumn(index, 'type', value as Column['type'])}
                      disabled={isCreating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeColumn(index)}
                    disabled={columns.length === 1 || isCreating}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Table className="mr-2 h-4 w-4" />
                  Create Table
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
