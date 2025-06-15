import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-lg sm:text-xl font-semibold">シーシャログ</h1>
              </Link>
              {isAuthenticated && (
                <div className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
                  <Link
                    to="/dashboard"
                    className={`${
                      isActive('/dashboard')
                        ? 'text-gray-900 bg-gray-100'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    to="/sessions"
                    className={`${
                      isActive('/sessions')
                        ? 'text-gray-900 bg-gray-100'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    セッション
                  </Link>
                  <Link
                    to="/sessions/new"
                    className={`${
                      isActive('/sessions/new')
                        ? 'text-gray-900 bg-gray-100'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    新規セッション
                  </Link>
                </div>
              )}
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm">
                    ようこそ、<span className="font-medium">{user?.user_id}</span>さん
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">メニューを開く</span>
                {!isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-gray-700 text-sm border-b border-gray-200">
                  Welcome, <span className="font-medium">{user?.user_id}</span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    isActive('/dashboard')
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/sessions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    isActive('/sessions')
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                >
                  Sessions
                </Link>
                <Link
                  to="/sessions/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    isActive('/sessions/new')
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                >
                  New Session
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};