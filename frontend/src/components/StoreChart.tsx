import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StoreCount {
  store_name: string;
  count: number;
}

interface StoreChartProps {
  stores: StoreCount[];
  title?: string;
}

export const StoreChart: React.FC<StoreChartProps> = ({ stores, title = "店舗別セッション" }) => {
  const data = {
    labels: stores.map(s => s.store_name || '店舗名なし'),
    datasets: [
      {
        data: stores.map(s => s.count),
        backgroundColor: [
          '#4F46E5', // indigo-600
          '#7C3AED', // violet-600
          '#2563EB', // blue-600
          '#0891B2', // cyan-600
          '#059669', // emerald-600
          '#84CC16', // lime-600
          '#EAB308', // yellow-600
          '#EA580C', // orange-600
          '#DC2626', // red-600
          '#DB2777', // pink-600
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
      {stores.length === 0 ? (
        <p className="text-gray-500 text-sm">データがありません</p>
      ) : (
        <div className="h-64">
          <Pie data={data} options={options} />
        </div>
      )}
    </div>
  );
};