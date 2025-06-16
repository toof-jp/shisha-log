import React from 'react';

interface CreatorCount {
  creator: string;
  count: number;
}

interface CreatorRankingProps {
  creators: CreatorCount[];
  title?: string;
}

export const CreatorRanking: React.FC<CreatorRankingProps> = ({ creators, title = "作成者ランキング" }) => {
  const maxCount = creators.length > 0 ? Math.max(...creators.map(c => c.count)) : 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {creators.length === 0 ? (
        <p className="text-gray-500 text-sm">データがありません</p>
      ) : (
        <div className="space-y-3">
          {creators.map((creator, index) => (
            <div key={creator.creator || 'unknown'} className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-8">
                {index + 1}
              </span>
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {creator.creator || '作成者なし'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{creator.count}回</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(creator.count / maxCount) * 100}%` }}
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