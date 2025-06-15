import React from 'react';
import type { FlavorCount } from '../types/api';

interface FlavorRankingProps {
  data: FlavorCount[];
  title: string;
}

export const FlavorRanking: React.FC<FlavorRankingProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        データがありません
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.flavor_name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                  {index + 1}
                </span>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {item.flavor_name}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(item.count / data[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};