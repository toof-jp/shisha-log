import React from 'react';

interface StoreCount {
  store_name: string;
  count: number;
}

interface StoreRankingProps {
  stores: StoreCount[];
  title?: string;
}

export const StoreRanking: React.FC<StoreRankingProps> = ({ stores, title = "店舗ランキング" }) => {
  const maxCount = stores.length > 0 ? Math.max(...stores.map(s => s.count)) : 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {stores.length === 0 ? (
        <p className="text-gray-500 text-sm">データがありません</p>
      ) : (
        <div className="space-y-3">
          {stores.map((store, index) => (
            <div key={store.store_name || 'unknown'} className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-8">
                {index + 1}
              </span>
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {store.store_name || '店舗名なし'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{store.count}回</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(store.count / maxCount) * 100}%` }}
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