import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../services/api';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../types/api';

const sessionSchema = z.object({
  session_date: z.string().min(1, 'Date is required'),
  store_name: z.string().min(1, 'Store name is required'),
  flavors: z.array(z.object({
    flavor_name: z.string().optional(),
    brand: z.string().optional(),
  })).min(1, 'At least one flavor is required'),
  notes: z.string().optional(),
  order_details: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      session_date: new Date().toISOString().slice(0, 16),
      flavors: [{ flavor_name: '', brand: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'flavors',
  });

  const onSubmit = async (data: SessionFormData) => {
    try {
      setError('');
      // Filter out empty flavors
      const filteredFlavors = data.flavors.filter(
        f => f.flavor_name || f.brand
      );
      
      if (filteredFlavors.length === 0) {
        setError('Please add at least one flavor');
        return;
      }

      await apiClient.createSession({
        ...data,
        session_date: new Date(data.session_date).toISOString(),
        flavors: filteredFlavors,
      });
      navigate('/sessions');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.error || 'Failed to create session');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/sessions"
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          ← Back to sessions
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
            Log New Session
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="session_date" className="block text-sm font-medium text-gray-700">
                Date & Time
              </label>
              <input
                {...register('session_date')}
                type="datetime-local"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.session_date && (
                <p className="mt-1 text-sm text-red-600">{errors.session_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                {...register('store_name')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Cloud 9 Lounge"
              />
              {errors.store_name && (
                <p className="mt-1 text-sm text-red-600">{errors.store_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flavors
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input
                    {...register(`flavors.${index}.flavor_name`)}
                    type="text"
                    placeholder="Flavor name"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    {...register(`flavors.${index}.brand`)}
                    type="text"
                    placeholder="Brand (optional)"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ flavor_name: '', brand: '' })}
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Flavor
              </button>
              {errors.flavors && (
                <p className="mt-1 text-sm text-red-600">{errors.flavors.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Great mix, perfect balance..."
              />
            </div>

            <div>
              <label htmlFor="order_details" className="block text-sm font-medium text-gray-700">
                Order Details (optional)
              </label>
              <input
                {...register('order_details')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Bowl #3, Table 5"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                to="/sessions"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};