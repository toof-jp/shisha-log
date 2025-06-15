import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { Session } from '@/types/api';
import { format } from 'date-fns';

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;
      
      try {
        const sessionData = await apiService.getSession(id);
        setSession(sessionData);
      } catch (err: any) {
        setError('セッションの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('このセッションを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiService.deleteSession(id);
      navigate('/sessions');
    } catch (err: any) {
      setError('セッションの削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'セッションが見つかりません'}
        </div>
        <div className="mt-4">
          <Link
            to="/sessions"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← セッション一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            to="/sessions"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← セッション一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {session.mix_name}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/sessions/${session.id}/edit`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm font-medium"
          >
            編集
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            セッション詳細
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {format(new Date(session.session_date), 'yyyy年MM月dd日 HH:mm')}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">店舗名</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {session.store_name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ミックス名</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {session.mix_name}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">フレーバー</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {session.flavors && session.flavors.length > 0 ? (
                    session.flavors.map((flavor, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {flavor.flavor_name} ({flavor.brand})
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">フレーバーが記録されていません</span>
                  )}
                </div>
              </dd>
            </div>
            {session.order_details && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">注文詳細</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {session.order_details}
                </dd>
              </div>
            )}
            {session.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">メモ</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="whitespace-pre-wrap">{session.notes}</div>
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">記録日時</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(session.created_at), 'yyyy年MM月dd日 HH:mm')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;