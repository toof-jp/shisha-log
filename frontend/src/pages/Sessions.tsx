import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { ShishaSession } from '../types/api';
import { formatDateTime } from '../utils/dateFormat';
import { sortFlavorsByOrder } from '../utils/flavorSort';

export const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<ShishaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const limit = 20;

  useEffect(() => {
    // Initial load
    fetchSessions(0);
  }, []);

  const fetchMoreSessions = useCallback(async () => {
    try {
      setLoadingMore(true);
      const response = await apiClient.getSessions(limit, offset);
      const newSessions = response.sessions || [];
      setSessions(prev => [...prev, ...newSessions]);
      setHasMore(newSessions.length === limit);
      setOffset(prev => prev + limit);
    } catch (err) {
      console.error('Error fetching more sessions:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    // Set up intersection observer
    if (loadingMore || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMoreSessions();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, offset, fetchMoreSessions]);

  const fetchSessions = async (newOffset: number) => {
    try {
      setLoading(true);
      const response = await apiClient.getSessions(limit, newOffset);
      console.log('Sessions API response:', response);
      setSessions(response.sessions || []);
      setHasMore((response.sessions || []).length === limit);
      setOffset(newOffset + limit);
    } catch (err) {
      setError('セッションの読み込みに失敗しました');
      console.error('Error fetching sessions:', err);
      setSessions([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このセッションを削除してもよろしいですか？')) return;
    
    try {
      await apiClient.deleteSession(id);
      // Remove the deleted session from the list
      setSessions(prev => prev.filter(session => session.id !== id));
    } catch {
      alert('セッションの削除に失敗しました');
    }
  };

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
                    {session.store_name && (
                      <p className="text-base font-medium text-gray-900 mt-1">
                        店舗: {session.store_name}
                      </p>
                    )}
                    {session.mix_name && (
                      <p className="text-base font-medium text-gray-900 mt-1">
                        ミックス: {session.mix_name}
                      </p>
                    )}
                    {!session.store_name && !session.mix_name && (
                      <p className="text-base font-medium text-gray-400 mt-1">
                        無題のセッション
                      </p>
                    )}
                    {session.creator && (
                      <p className="text-sm text-gray-600 mt-1">
                        作成者: {session.creator}
                      </p>
                    )}
                    {session.amount !== undefined && session.amount !== null && (
                      <p className="text-sm text-gray-600 mt-1">
                        金額: ¥{session.amount.toLocaleString()}
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
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                  >
                    詳細を見る
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="text-red-600 hover:text-red-900 p-2"
                    title="削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {/* Mobile infinite scroll loading indicator */}
            {(loadingMore || !hasMore) && sessions.length > 0 && (
              <div className="text-center py-4">
                {loadingMore && (
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600 text-sm">読み込み中...</span>
                  </div>
                )}
              </div>
            )}
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
                    店舗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ミックス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フレーバー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
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
                      {session.store_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.mix_name || '-'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.amount !== undefined && session.amount !== null ? `¥${session.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/sessions/${session.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block"
                        title="詳細を表示"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900 inline-block"
                        title="削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Infinite scroll loading indicator - Desktop only */}
          {sessions.length > 0 && (
            <div ref={loadMoreRef} className="hidden sm:block mt-8 text-center py-4">
              {loadingMore && (
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">読み込み中...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};