import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { FlavorStats, StoreStats, CreatorStats, OrderStats } from '../types/api';
import { SessionCalendar } from '../components/SessionCalendar';
import { DailySessionsModal } from '../components/DailySessionsModal';
import { StatisticsChart } from '../components/StatisticsChart';
import { StatisticsRanking } from '../components/StatisticsRanking';

export const Dashboard: React.FC = () => {
  const [flavorStats, setFlavorStats] = useState<FlavorStats | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'calendar' | 'all-flavors' | 'main-flavors' | 'creators' | 'stores' | 'orders'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [sessionsResponse, flavorStatsData, storeStatsData, creatorStatsData, orderStatsData] = await Promise.all([
        apiClient.getSessions(1, 0), // Just get total count
        apiClient.getFlavorStats(),
        apiClient.getStoreStats(),
        apiClient.getCreatorStats(),
        apiClient.getOrderStats()
      ]);
      
      setTotalCount(sessionsResponse.total || 0);
      setFlavorStats(flavorStatsData);
      setStoreStats(storeStatsData);
      setCreatorStats(creatorStatsData);
      setOrderStats(orderStatsData);
    } catch (err) {
      console.error('Dashboard error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          ダッシュボード
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              総セッション数
            </dt>
            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
              {totalCount}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="p-5 sm:p-6">
            <Link
              to="/sessions/new"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              新規セッションを記録
            </Link>
          </div>
        </div>
      </div>


      {/* Tabs Section */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`${
                activeTab === 'calendar'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              カレンダー
            </button>
            <button
              onClick={() => setActiveTab('all-flavors')}
              className={`${
                activeTab === 'all-flavors'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              全フレーバー
            </button>
            <button
              onClick={() => setActiveTab('main-flavors')}
              className={`${
                activeTab === 'main-flavors'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              メインフレーバー
            </button>
            <button
              onClick={() => setActiveTab('creators')}
              className={`${
                activeTab === 'creators'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              作成者
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`${
                activeTab === 'stores'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              店舗
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              オーダー
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'calendar' && (
            <SessionCalendar 
              onDateClick={(date) => {
                setSelectedDate(date);
                setIsModalOpen(true);
              }}
            />
          )}

          {activeTab === 'all-flavors' && flavorStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">全フレーバー統計</h2>
              <StatisticsChart 
                data={flavorStats.all_flavors.map(f => ({ name: f.flavor_name, count: f.count }))} 
                title="全フレーバー構成比" 
              />
              <StatisticsRanking 
                data={flavorStats.all_flavors.map(f => ({ name: f.flavor_name, count: f.count }))} 
                title="全フレーバーランキング" 
              />
            </div>
          )}

          {activeTab === 'main-flavors' && flavorStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">メインフレーバー統計</h2>
              <StatisticsChart 
                data={flavorStats.main_flavors.map(f => ({ name: f.flavor_name, count: f.count }))} 
                title="メインフレーバー構成比" 
              />
              <StatisticsRanking 
                data={flavorStats.main_flavors.map(f => ({ name: f.flavor_name, count: f.count }))} 
                title="メインフレーバーランキング" 
              />
            </div>
          )}

          {activeTab === 'creators' && creatorStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">作成者統計</h2>
              {creatorStats.creators.length > 0 ? (
                <>
                  <StatisticsChart 
                    data={creatorStats.creators.map(c => ({ name: c.creator, count: c.count }))} 
                    title="作成者別構成比" 
                  />
                  <StatisticsRanking 
                    data={creatorStats.creators.map(c => ({ name: c.creator, count: c.count }))} 
                    title="作成者別セッション数" 
                  />
                </>
              ) : (
                <p className="text-gray-500">作成者データがありません</p>
              )}
            </div>
          )}

          {activeTab === 'stores' && storeStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">店舗統計</h2>
              {storeStats.stores.length > 0 ? (
                <>
                  <StatisticsChart 
                    data={storeStats.stores.map(s => ({ name: s.store_name, count: s.count }))} 
                    title="店舗別セッション構成比" 
                  />
                  <StatisticsRanking 
                    data={storeStats.stores.map(s => ({ name: s.store_name, count: s.count }))} 
                    title="店舗別セッション回数" 
                  />
                </>
              ) : (
                <p className="text-gray-500">店舗データがありません</p>
              )}
            </div>
          )}

          {activeTab === 'orders' && orderStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">オーダー統計</h2>
              {orderStats.orders.length > 0 ? (
                <>
                  <StatisticsChart 
                    data={orderStats.orders.map(o => ({ name: o.order_details, count: o.count }))} 
                    title="オーダー構成比" 
                  />
                  <StatisticsRanking 
                    data={orderStats.orders.map(o => ({ name: o.order_details, count: o.count }))} 
                    title="オーダーランキング" 
                  />
                </>
              ) : (
                <p className="text-gray-500">オーダーデータがありません</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Daily Sessions Modal */}
      <DailySessionsModal
        date={selectedDate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};