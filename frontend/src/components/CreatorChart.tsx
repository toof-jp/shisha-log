import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CreatorCount {
  creator: string;
  count: number;
}

interface CreatorChartProps {
  creators: CreatorCount[];
  title?: string;
}

export const CreatorChart: React.FC<CreatorChartProps> = ({ creators, title = "作成者別セッション" }) => {
  const data = {
    labels: creators.map(c => c.creator || '作成者なし'),
    datasets: [
      {
        data: creators.map(c => c.count),
        backgroundColor: [
          '#059669', // emerald-600
          '#10B981', // emerald-500
          '#34D399', // emerald-400
          '#6EE7B7', // emerald-300
          '#A7F3D0', // emerald-200
          '#065F46', // emerald-800
          '#047857', // emerald-700
          '#D1FAE5', // emerald-100
          '#064E3B', // emerald-900
          '#F3F4F6', // gray-100
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}回 (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {creators.length === 0 ? (
        <p className="text-gray-500 text-sm">データがありません</p>
      ) : (
        <div className="h-64">
          <Pie data={data} options={options} />
        </div>
      )}
    </div>
  );
};