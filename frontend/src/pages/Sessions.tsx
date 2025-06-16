import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { ShishaSession } from '../types/api';
import { formatDateTime } from '../utils/dateFormat';
import { sortFlavorsByOrder } from '../utils/flavorSort';

export const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<ShishaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSessions(limit, page * limit);
      console.log('Sessions API response:', response);
      setSessions(response.sessions || []);
      setTotalSessions(response.total || 0);
    } catch (err) {
      setError('セッションの読み込みに失敗しました');
      console.error('Error fetching sessions:', err);
      setSessions([]);
      setTotalSessions(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このセッションを削除してもよろしいですか？')) return;
    
    try {
      await apiClient.deleteSession(id);
      fetchSessions();
    } catch (err) {
      alert('セッションの削除に失敗しました');
    }
  };

  const totalPages = Math.ceil(totalSessions / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">セッション</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-700">
            あなたのシーシャセッション一覧
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/sessions/new"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            セッションを追加
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 text-center">読み込み中...</div>
      ) : error ? (
        <div className="mt-8 text-center text-red-600">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          セッションが見つかりません。最初のセッションを作成してください！
        </div>
      ) : (
        <>
          {/* Mobile view - Cards */}
          <div className="mt-6 sm:hidden space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {formatDateTime(session.session_date)}
                    </p>
                    <h3 className="text-base font-medium text-gray-900 mt-1">
                      {session.store_name || session.mix_name || '無題のセッション'}
                    </h3>
                    {session.creator && (
                      <p className="text-sm text-gray-600 mt-1">
                        作成者: {session.creator}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {session.flavors && session.flavors.length > 0 ? (
                      sortFlavorsByOrder(session.flavors).map((flavor, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {flavor.flavor_name || '不明'}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">フレーバーなし</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/sessions/${session.id}`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    詳細を見る →
                  </Link>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden sm:block mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗 / ミックス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フレーバー
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">アクション</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(session.session_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {session.store_name || session.mix_name || '-'}
                        {session.store_name && session.mix_name && (
                          <span className="text-gray-500 text-xs block">{session.mix_name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.creator || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1 max-w-xs">
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
                          <span className="text-gray-400">フレーバーなし</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/sessions/${session.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        表示
                      </Link>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              {/* Mobile pagination */}
              <div className="flex items-center justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <span className="text-sm text-gray-700">
                  {totalPages}ページ中{page + 1}ページ目
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>

              {/* Desktop pagination */}
              <div className="hidden sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    表示中{' '}
                    <span className="font-medium">{page * limit + 1}</span>～{' '}
                    <span className="font-medium">
                      {Math.min((page + 1) * limit, totalSessions)}
                    </span>{' '}
                    / 全<span className="font-medium">{totalSessions}</span>件
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages - 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      次へ
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};