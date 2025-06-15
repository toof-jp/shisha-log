import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Minus, Save } from 'lucide-react';
import { useCreateSession } from '~/hooks/api/use-sessions';
import { useAuth } from '~/hooks/use-auth';
import { useCurrentUser } from '~/hooks/api/use-user';
import type { Route } from './+types/new';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New Session - Shisha Log' },
    { name: 'description', content: 'Create a new shisha session' },
  ];
}

const sessionSchema = z.object({
  sessionDate: z.string().min(1, 'Session date is required'),
  storeName: z.string().min(1, 'Store name is required'),
  mixName: z.string().optional(),
  notes: z.string().optional(),
  orderDetails: z.string().optional(),
  flavors: z.array(z.object({
    flavorName: z.string().min(1, 'Flavor name is required'),
    brand: z.string().min(1, 'Brand is required'),
  })).min(1, 'At least one flavor is required'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export default function NewSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const createSession = useCreateSession();
  const [error, setError] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().slice(0, 16),
      flavors: [{ flavorName: '', brand: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'flavors',
  });

  const onSubmit = async (data: SessionFormData) => {
    if (!user || !currentUser) return;

    try {
      setError('');
      
      const sessionData = {
        user_id: currentUser.id,
        session_date: new Date(data.sessionDate).toISOString(),
        store_name: data.storeName,
        mix_name: data.mixName || undefined,
        notes: data.notes || undefined,
        order_details: data.orderDetails || undefined,
        flavors: data.flavors.map(f => ({
          flavor_name: f.flavorName,
          brand: f.brand,
        })),
      };

      const session = await createSession.mutateAsync(sessionData);
      navigate(`/sessions/${session.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create session');
    }
  };

  const addFlavor = () => {
    append({ flavorName: '', brand: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sessions
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          New Shisha Session
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
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Flavors
              </label>
              <button
                type="button"
                onClick={addFlavor}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Flavor
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      {...register(`flavors.${index}.flavorName`)}
                      type="text"
                      placeholder="Flavor name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors.flavors?.[index]?.flavorName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.flavors[index]?.flavorName?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      {...register(`flavors.${index}.brand`)}
                      type="text"
                      placeholder="Brand"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors.flavors?.[index]?.brand && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.flavors[index]?.brand?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-400 hover:text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.flavors && (
              <p className="mt-1 text-sm text-red-600">{errors.flavors.message}</p>
            )}
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

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Link
              to="/"
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
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}