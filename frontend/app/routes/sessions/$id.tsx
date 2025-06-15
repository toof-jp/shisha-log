import { Link, useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useSession, useDeleteSession } from '~/hooks/api/use-sessions';
import type { Route } from './+types/$id';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Session Details - Shisha Log` },
    { name: 'description', content: 'View session details' },
  ];
}

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session, isLoading, error } = useSession(id!);
  const deleteSession = useDeleteSession();

  const handleDelete = async () => {
    if (!session || !confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await deleteSession.mutateAsync(session.id);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          Session not found or failed to load.
        </div>
        <Link
          to="/"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sessions
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.mix_name || 'Unnamed Mix'}
            </h1>
            <div className="flex space-x-3">
              <Link
                to={`/sessions/${session.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteSession.isPending}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deleteSession.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Session Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{session.store_name}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>{format(new Date(session.session_date), 'h:mm a')}</span>
                  </div>
                </div>
              </div>

              {session.order_details && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Order Details
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {session.order_details}
                  </p>
                </div>
              )}

              {session.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Notes
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {session.notes}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Flavors {session.flavors && session.flavors.length > 0 ? `(${session.flavors.length})` : ''}
              </h3>
              {session.flavors && session.flavors.length > 0 ? (
                <div className="space-y-3">
                  {session.flavors.map((flavor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {flavor.flavor_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {flavor.brand}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No flavors recorded for this session.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Created on {format(new Date(session.created_at), 'MMM d, yyyy \'at\' h:mm a')}
              {session.updated_at !== session.created_at && (
                <span>
                  {' • '}
                  Last updated on {format(new Date(session.updated_at), 'MMM d, yyyy \'at\' h:mm a')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}