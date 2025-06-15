import { Link, useNavigate } from 'react-router';
import { Home, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '~/hooks/use-auth';
import { BackendStatus } from './backend-status';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-gray-900 dark:text-white font-semibold text-lg"
            >
              Shisha Log
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                <Home className="w-4 h-4 mr-1" />
                Sessions
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <BackendStatus />
            <ThemeToggle />
            <button
              onClick={() => navigate('/sessions/new')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Session
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}