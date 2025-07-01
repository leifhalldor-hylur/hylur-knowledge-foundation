
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';

interface DataTable {
  id: string;
  name: string;
  columns: Array<{ name: string; type: string }>;
  rows: Array<Array<any>>;
}

interface TableVisualizationProps {
  table: DataTable;
}

const CHART_COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'];

export function TableVisualization({ table }: TableVisualizationProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxisColumn, setXAxisColumn] = useState<string>('');
  const [yAxisColumn, setYAxisColumn] = useState<string>('');

  const { stringColumns, numberColumns, chartData } = useMemo(() => {
    const stringColumns = (table.columns || []).filter(col => col.type === 'string').map(col => col.name);
    const numberColumns = (table.columns || []).filter(col => col.type === 'number').map(col => col.name);
    
    let chartData: any[] = [];
    
    if (xAxisColumn && yAxisColumn && table.rows) {
      const xIndex = table.columns.findIndex(col => col.name === xAxisColumn);
      const yIndex = table.columns.findIndex(col => col.name === yAxisColumn);
      
      if (xIndex !== -1 && yIndex !== -1) {
        chartData = table.rows
          .filter(row => row[xIndex] && row[yIndex] !== undefined && row[yIndex] !== '')
          .map(row => ({
            [xAxisColumn]: row[xIndex],
            [yAxisColumn]: parseFloat(row[yIndex]) || 0,
          }));
      }
    }
    
    return { stringColumns, numberColumns, chartData };
  }, [table, xAxisColumn, yAxisColumn]);

  // Auto-select first available columns
  useMemo(() => {
    if (!xAxisColumn && stringColumns.length > 0) {
      setXAxisColumn(stringColumns[0]);
    }
    if (!yAxisColumn && numberColumns.length > 0) {
      setYAxisColumn(numberColumns[0]);
    }
  }, [stringColumns, numberColumns, xAxisColumn, yAxisColumn]);

  const renderChart = () => {
    if (!chartData.length || !xAxisColumn || !yAxisColumn) {
      return (
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Select columns to generate visualization</p>
            <p className="text-sm mt-2">
              Need at least one text column (X-axis) and one number column (Y-axis)
            </p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 40, bottom: 60 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisColumn}
                tick={{ fontSize: 10 }}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                label={{ 
                  value: xAxisColumn, 
                  position: 'insideBottom', 
                  offset: -15, 
                  style: { textAnchor: 'middle', fontSize: 11 } 
                }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                label={{ 
                  value: yAxisColumn, 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fontSize: 11 } 
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: 11
                }}
              />
              <Bar 
                dataKey={yAxisColumn} 
                fill={CHART_COLORS[0]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisColumn}
                tick={{ fontSize: 10 }}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                label={{ 
                  value: xAxisColumn, 
                  position: 'insideBottom', 
                  offset: -15, 
                  style: { textAnchor: 'middle', fontSize: 11 } 
                }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                label={{ 
                  value: yAxisColumn, 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fontSize: 11 } 
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: 11
                }}
              />
              <Line 
                type="monotone" 
                dataKey={yAxisColumn} 
                stroke={CHART_COLORS[1]} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[1], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey={yAxisColumn}
                nameKey={xAxisColumn}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: 11
                }}
              />
              <Legend 
                verticalAlign="top"
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChartIcon className="w-4 h-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">X-Axis (Categories)</label>
              <Select value={xAxisColumn} onValueChange={setXAxisColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {stringColumns.map(column => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Y-Axis (Values)</label>
              <Select value={yAxisColumn} onValueChange={setYAxisColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {numberColumns.map(column => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(stringColumns.length === 0 || numberColumns.length === 0) && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                To create visualizations, your table needs at least one text column and one number column.
                {stringColumns.length === 0 && ' Add text columns for categories.'}
                {numberColumns.length === 0 && ' Add number columns for values.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chart Preview</CardTitle>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}
