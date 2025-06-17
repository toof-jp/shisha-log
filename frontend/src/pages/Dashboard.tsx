import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import type { ShishaSession, FlavorStats, StoreStats, CreatorStats } from '../types/api';
import { formatDateTime } from '../utils/dateFormat';
import { SessionCalendar } from '../components/SessionCalendar';
import { DailySessionsModal } from '../components/DailySessionsModal';
import { sortFlavorsByOrder } from '../utils/flavorSort';
import { StatisticsChart } from '../components/StatisticsChart';
import { StatisticsRanking } from '../components/StatisticsRanking';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<ShishaSession[]>([]);
  const [flavorStats, setFlavorStats] = useState<FlavorStats | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'all-flavors' | 'main-flavors' | 'creators' | 'stores'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      setLoading(true);
      
      // Fetch recent sessions and all stats in parallel
      const [sessionsResponse, flavorStatsData, storeStatsData, creatorStatsData] = await Promise.all([
        apiClient.getSessions(5, 0),
        apiClient.getFlavorStats(),
        apiClient.getStoreStats(),
        apiClient.getCreatorStats()
      ]);
      
      console.log('Dashboard sessions response:', sessionsResponse);
      setRecentSessions(sessionsResponse.sessions || []);
      setTotalCount(sessionsResponse.total || 0);
      setFlavorStats(flavorStatsData);
      setStoreStats(storeStatsData);
      setCreatorStats(creatorStatsData);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error('Dashboard error:', err);
      setRecentSessions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          おかえりなさい、{user?.user_id}さん！
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          シーシャセッションを記録して、新しいフレーバーの組み合わせを発見しましょう
        </p>
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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            最近のセッション
          </h3>
        </div>
        {loading ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="text-center">読み込み中...</div>
          </div>
        ) : error ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="text-center text-gray-500">
              まだセッションがありません。シーシャ体験の記録を始めましょう！
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  to={`/sessions/${session.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {session.store_name || session.mix_name || '無題のセッション'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(session.session_date)}
                        {session.creator && <span> • {session.creator}</span>}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {session.flavors && session.flavors.length > 0 ? (
                          sortFlavorsByOrder(session.flavors).map((flavor, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {flavor.flavor_name || '不明'}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">フレーバーなし</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {recentSessions.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <Link
              to="/sessions"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              すべてのセッションを見る →
            </Link>
          </div>
        )}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatisticsRanking 
                  data={flavorStats.all_flavors.map(f => ({ name: f.flavor_name, count: f.count }))} 
                  title="全フレーバーランキング" 
                />
                <StatisticsChart 
                  data={flavorStats.all_flavors.slice(0, 10).map(f => ({ name: f.flavor_name, count: f.count }))} 
                  title="全フレーバー構成比 (TOP 10)" 
                />
              </div>
            </div>
          )}

          {activeTab === 'main-flavors' && flavorStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">メインフレーバー統計</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatisticsRanking 
                  data={flavorStats.main_flavors.map(f => ({ name: f.flavor_name, count: f.count }))} 
                  title="メインフレーバーランキング" 
                />
                <StatisticsChart 
                  data={flavorStats.main_flavors.slice(0, 10).map(f => ({ name: f.flavor_name, count: f.count }))} 
                  title="メインフレーバー構成比 (TOP 10)" 
                />
              </div>
            </div>
          )}

          {activeTab === 'creators' && creatorStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">作成者統計</h2>
              {creatorStats.creators.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StatisticsRanking 
                    data={creatorStats.creators.map(c => ({ name: c.creator, count: c.count }))} 
                    title="作成者別セッション数" 
                  />
                  <StatisticsChart 
                    data={creatorStats.creators.slice(0, 10).map(c => ({ name: c.creator, count: c.count }))} 
                    title="作成者別構成比 (TOP 10)" 
                  />
                </div>
              ) : (
                <p className="text-gray-500">作成者データがありません</p>
              )}
            </div>
          )}

          {activeTab === 'stores' && storeStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">店舗統計</h2>
              {storeStats.stores.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StatisticsRanking 
                    data={storeStats.stores.map(s => ({ name: s.store_name, count: s.count }))} 
                    title="店舗別訪問回数" 
                  />
                  <StatisticsChart 
                    data={storeStats.stores.slice(0, 10).map(s => ({ name: s.store_name, count: s.count }))} 
                    title="店舗別訪問構成比 (TOP 10)" 
                  />
                </div>
              ) : (
                <p className="text-gray-500">店舗データがありません</p>
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