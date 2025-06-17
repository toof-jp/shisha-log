import React from 'react';

interface DataItem {
  name: string;
  count: number;
}

interface StatisticsRankingProps {
  data: DataItem[];
  title?: string;
  countLabel?: string; // e.g., "回", "個"
}

export const StatisticsRanking: React.FC<StatisticsRankingProps> = ({ 
  data, 
  title = "ランキング",
  countLabel = "回"
}) => {
  const maxCount = data.length > 0 ? Math.max(...data.map(item => item.count)) : 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">データがありません</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.map((item, index) => (
            <div key={item.name || 'unknown'} className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-8">
                {index + 1}
              </span>
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{item.count}{countLabel}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};