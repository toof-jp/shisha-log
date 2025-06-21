import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            シーシャログ
          </p>
          <div className="mt-8">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  新規登録
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ログイン
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  デモを試す
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};