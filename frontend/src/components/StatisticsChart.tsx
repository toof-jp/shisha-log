import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DataItem {
  name: string;
  count: number;
}

interface StatisticsChartProps {
  data: DataItem[];
  title?: string;
  countLabel?: string; // e.g., "回", "個"
}

export const StatisticsChart: React.FC<StatisticsChartProps> = ({ 
  data, 
  title = "統計", 
  countLabel = "回" 
}) => {
  const colors = [
    '#2563EB', // blue-600 - 濃い青
    '#EA580C', // orange-600 - 濃いオレンジ
    '#059669', // emerald-600 - 濃い緑
    '#DB2777', // pink-600 - 濃いピンク
    '#7C3AED', // violet-600 - 濃い紫
    '#FACC15', // yellow-500 - 明るい黄色
    '#0891B2', // cyan-600 - 濃いシアン
    '#DC2626', // red-600 - 濃い赤
    '#84CC16', // lime-600 - 濃いライム
    '#6366F1', // indigo-500 - 中間の藍色
    '#FB923C', // orange-500 - 中間のオレンジ
    '#10B981', // emerald-500 - 中間の緑
    '#EC4899', // pink-500 - 中間のピンク
    '#8B5CF6', // violet-500 - 中間の紫
    '#3B82F6', // blue-500 - 中間の青
    '#EAB308', // yellow-600 - 濃い黄色
    '#06B6D4', // cyan-500 - 中間のシアン
    '#EF4444', // red-500 - 中間の赤
    '#A3E635', // lime-500 - 明るいライム
    '#4F46E5', // indigo-600 - 濃い藍色
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map((_, index) => colors[index % colors.length]),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        fullSize: true,
        align: 'center' as const,
        labels: {
          padding: 8,
          font: {
            size: 11,
          },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}${countLabel} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">データがありません</p>
      ) : (
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Pie data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};