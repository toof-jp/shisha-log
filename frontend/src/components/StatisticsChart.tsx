import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
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
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.count),
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
    layout: {
      padding: {
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        fullSize: true,
        align: 'center' as const,
        labels: {
          padding: 10,
          font: {
            size: 12,
          },
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          generateLabels: function(chart: any) {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels || [];
            
            return labels.map((label: string, i: number) => {
              const dataset = datasets[0];
              const backgroundColor = Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor[i] 
                : dataset.backgroundColor;
              
              // Don't truncate labels - let them wrap
              const text = label || '';
              
              return {
                text: text,
                fillStyle: backgroundColor,
                hidden: false,
                index: i,
                strokeStyle: dataset.borderColor,
                lineWidth: dataset.borderWidth,
              };
            });
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
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
        <div className="w-full" style={{ minHeight: `${Math.max(400, data.length * 30 + 300)}px` }}>
          <Pie data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};