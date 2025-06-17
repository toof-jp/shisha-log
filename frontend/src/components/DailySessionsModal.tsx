import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { ShishaSession } from '../types/api';
import { formatDateTime, formatDate } from '../utils/dateFormat';
import { sortFlavorsByOrder } from '../utils/flavorSort';
import { getSessionsByDate } from '../utils/demoData';

interface DailySessionsModalProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  isDemo?: boolean;
  demoSessions?: ShishaSession[];
}

export const DailySessionsModal: React.FC<DailySessionsModalProps> = ({ 
  date, 
  isOpen, 
  onClose,
  isDemo = false,
  demoSessions = []
}) => {
  const [sessions, setSessions] = useState<ShishaSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && date) {
      fetchSessionsForDate();
    }
  }, [isOpen, date, isDemo, demoSessions]);

  const fetchSessionsForDate = async () => {
    try {
      setLoading(true);
      setError('');
      if (isDemo) {
        const demoDailySessions = getSessionsByDate(demoSessions, date);
        setSessions(demoDailySessions);
      } else {
        const response = await apiClient.getSessionsByDate(date);
        setSessions(response.sessions || []);
      }
    } catch (err) {
      setError('セッションの読み込みに失敗しました');
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDate(date)} のセッション
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            {loading ? (
              <div className="p-6 text-center text-gray-500">読み込み中...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                この日のセッションはありません
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      to={`/sessions/${session.id}`}
                      className="block hover:bg-gray-50 px-6 py-4"
                      onClick={onClose}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-indigo-600">
                            {session.store_name || session.mix_name || '無題のセッション'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
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
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  );
};