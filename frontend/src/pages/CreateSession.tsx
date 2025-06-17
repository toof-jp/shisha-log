import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../services/api';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../types/api';
import { getCurrentLocalDateTimeString, toLocalDateTimeString, toISOStringLocal } from '../utils/dateFormat';

const sessionSchema = z.object({
  session_date: z.string().min(1, '日付は必須です'),
  store_name: z.string().optional(),
  mix_name: z.string().optional(),
  creator: z.string().optional(),
  flavors: z.array(z.object({
    flavor_name: z.string().optional(),
    brand: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
  order_details: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      session_date: getCurrentLocalDateTimeString(),
      flavors: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'flavors',
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchSession();
    }
  }, [id, isEditMode]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const session = await apiClient.getSession(id!);
      
      // Convert session data to form data
      const formData: SessionFormData = {
        session_date: toLocalDateTimeString(session.session_date),
        store_name: session.store_name || '',
        mix_name: session.mix_name || '',
        creator: session.creator || '',
        notes: session.notes || '',
        order_details: session.order_details || '',
        flavors: session.flavors?.map(f => ({
          flavor_name: f.flavor_name || '',
          brand: f.brand || '',
        })) || [],
      };
      
      reset(formData);
    } catch (err) {
      setError('セッションの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      setError('');
      // Filter out empty flavors if any exist
      const filteredFlavors = data.flavors ? data.flavors.filter(
        f => f.flavor_name || f.brand
      ) : [];

      // Convert empty strings to undefined for optional fields
      const sessionData = {
        session_date: toISOStringLocal(data.session_date),
        store_name: data.store_name || undefined,
        mix_name: data.mix_name || undefined,
        creator: data.creator || undefined,
        notes: data.notes || undefined,
        order_details: data.order_details || undefined,
        flavors: filteredFlavors.length > 0 ? filteredFlavors.map(f => ({
          flavor_name: f.flavor_name || undefined,
          brand: f.brand || undefined,
        })) : undefined,
      };

      if (isEditMode) {
        await apiClient.updateSession(id!, sessionData);
      } else {
        await apiClient.createSession(sessionData);
      }
      
      navigate('/sessions');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.error || `セッションの${isEditMode ? '更新' : '作成'}に失敗しました`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <Link
          to="/sessions"
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          ← セッション一覧に戻る
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 sm:mb-6">
            {isEditMode ? 'セッションを編集' : '新しいセッションを記録'}
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="session_date" className="block text-sm font-medium text-gray-700">
                日時
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
                店舗名（任意）
              </label>
              <input
                {...register('store_name')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder=""
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div>
              <label htmlFor="mix_name" className="block text-sm font-medium text-gray-700">
                ミックス名（任意）
              </label>
              <input
                {...register('mix_name')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder=""
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div>
              <label htmlFor="creator" className="block text-sm font-medium text-gray-700">
                作成者（任意）
              </label>
              <input
                {...register('creator')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder=""
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フレーバー
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 mb-3">
                  <input
                    {...register(`flavors.${index}.flavor_name`)}
                    type="text"
                    placeholder="フレーバー名"
                    className="w-full sm:flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                  <input
                    {...register(`flavors.${index}.brand`)}
                    type="text"
                    placeholder="ブランド（任意）"
                    className="w-full sm:flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                  {fields.length > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ flavor_name: '', brand: '' })}
                className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                フレーバーを追加
              </button>
              {errors.flavors && (
                <p className="mt-1 text-sm text-red-600">{errors.flavors.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                メモ（任意）
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="order_details" className="block text-sm font-medium text-gray-700">
                オーダー（任意）
              </label>
              <input
                {...register('order_details')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder=""
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Link
                to="/sessions"
                className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (isEditMode ? '更新中...' : '作成中...') : (isEditMode ? 'セッションを更新' : 'セッションを作成')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};