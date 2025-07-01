
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Minus, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataTable {
  id: string;
  name: string;
  description: string | null;
  columns: Array<{ name: string; type: string }>;
  rows: Array<Array<any>>;
}

interface TableEditorProps {
  table: DataTable;
}

export function TableEditor({ table }: TableEditorProps) {
  const [name, setName] = useState(table.name);
  const [description, setDescription] = useState(table.description || '');
  const [columns, setColumns] = useState(table.columns || []);
  const [rows, setRows] = useState(table.rows || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Ensure all rows have the correct number of cells
    const updatedRows = rows.map(row => {
      const newRow = [...row];
      while (newRow.length < columns.length) {
        newRow.push('');
      }
      return newRow.slice(0, columns.length);
    });
    if (JSON.stringify(updatedRows) !== JSON.stringify(rows)) {
      setRows(updatedRows);
    }
  }, [columns.length]);

  const addRow = () => {
    const newRow = new Array(columns.length).fill('');
    setRows([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][colIndex] = value;
    setRows(updatedRows);
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/data-tables/${table.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          columns,
          rows,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Table saved successfully',
        });
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save table');
      }
    } catch (error) {
      setError('Failed to save table. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCellValue = (value: any, columnType: string) => {
    if (columnType === 'number' && value !== '') {
      return parseFloat(value) || 0;
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Table Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Table name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Table description (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={columns.length === 0}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Row
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {columns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No columns defined. Please add columns to start editing data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index} className="border border-border p-2 bg-muted text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{column.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({column.type})
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="border border-border p-2 bg-muted w-12">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="border border-border p-1">
                          <Input
                            value={row[colIndex] || ''}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="border-0 focus:ring-0 h-8 text-sm"
                            type={column.type === 'number' ? 'number' : 'text'}
                          />
                        </td>
                      ))}
                      <td className="border border-border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
