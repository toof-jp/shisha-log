import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import type { ShishaSession } from '../types/api';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<ShishaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSessions(5, 0);
      setRecentSessions(response.sessions || []);
    } catch (err) {
      setError('Failed to load sessions');
      console.error(err);
      setRecentSessions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_id}!
        </h1>
        <p className="mt-2 text-gray-600">
          Track your shisha sessions and discover new flavor combinations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Sessions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {recentSessions?.length || 0}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <Link
              to="/sessions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log New Session
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Sessions
          </h3>
        </div>
        {loading ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="text-center">Loading...</div>
          </div>
        ) : error ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="text-center text-gray-500">
              No sessions yet. Start logging your shisha experiences!
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
                        {session.store_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(session.session_date), 'PPP')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {session.flavors.map((flavor, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {flavor.flavor_name || 'Unknown'}
                          </span>
                        ))}
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
              View all sessions →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};