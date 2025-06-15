import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useSession, useUpdateSession } from '~/hooks/api/use-sessions';
import type { Route } from './+types/$id.edit';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: 'Edit Session - Shisha Log' },
    { name: 'description', content: 'Edit session details' },
  ];
}

const updateSessionSchema = z.object({
  sessionDate: z.string().min(1, 'Session date is required'),
  storeName: z.string().min(1, 'Store name is required'),
  mixName: z.string().optional(),
  notes: z.string().optional(),
  orderDetails: z.string().optional(),
});

type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;

export default function EditSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(id!);
  const updateSession = useUpdateSession();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSessionFormData>({
    resolver: zodResolver(updateSessionSchema),
  });

  useEffect(() => {
    if (session) {
      reset({
        sessionDate: new Date(session.session_date).toISOString().slice(0, 16),
        storeName: session.store_name,
        mixName: session.mix_name || '',
        notes: session.notes || '',
        orderDetails: session.order_details || '',
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: UpdateSessionFormData) => {
    if (!session) return;

    try {
      setError('');
      
      const updateData = {
        session_date: new Date(data.sessionDate).toISOString(),
        store_name: data.storeName,
        mix_name: data.mixName || undefined,
        notes: data.notes || undefined,
        order_details: data.orderDetails || undefined,
      };

      await updateSession.mutateAsync({ id: session.id, data: updateData });
      navigate(`/sessions/${session.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update session');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          Session not found.
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/sessions/${session.id}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Session
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Session
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Date & Time
              </label>
              <input
                {...register('sessionDate')}
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.sessionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.sessionDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Store Name
              </label>
              <input
                {...register('storeName')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter store name"
              />
              {errors.storeName && (
                <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="mixName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mix Name (Optional)
            </label>
            <input
              {...register('mixName')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter mix name"
            />
          </div>

          <div>
            <label htmlFor="orderDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Order Details (Optional)
            </label>
            <textarea
              {...register('orderDetails')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Describe what you ordered"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add any additional notes about this session"
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Flavor editing is not currently supported. To modify flavors, you'll need to delete and recreate the session.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Link
              to={`/sessions/${session.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}