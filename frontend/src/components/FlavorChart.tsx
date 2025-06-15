import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { FlavorCount } from '../types/api';

interface FlavorChartProps {
  data: FlavorCount[];
  title: string;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#67b7dc', '#a4de6c', '#ffd93d'
];

export const FlavorChart: React.FC<FlavorChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        データがありません
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.flavor_name} (${entry.count})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};