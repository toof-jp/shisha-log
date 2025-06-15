import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { CreateSessionRequest } from '@/types/api';

interface FlavorInput {
  flavor_name: string;
  brand: string;
}

const CreateSession = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().slice(0, 16),
    store_name: '',
    mix_name: '',
    notes: '',
    order_details: '',
  });
  const [flavors, setFlavors] = useState<FlavorInput[]>([
    { flavor_name: '', brand: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFlavorChange = (index: number, field: keyof FlavorInput, value: string) => {
    setFlavors(prev => prev.map((flavor, i) => 
      i === index ? { ...flavor, [field]: value } : flavor
    ));
  };

  const addFlavor = () => {
    setFlavors(prev => [...prev, { flavor_name: '', brand: '' }]);
  };

  const removeFlavor = (index: number) => {
    if (flavors.length > 1) {
      setFlavors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validFlavors = flavors.filter(f => f.flavor_name.trim() && f.brand.trim());
    
    if (validFlavors.length === 0) {
      setError('少なくとも1つのフレーバーを入力してください');
      return;
    }

    if (!formData.store_name.trim() || !formData.mix_name.trim()) {
      setError('店舗名とミックス名は必須です');
      return;
    }

    try {
      setIsLoading(true);
      const sessionData: CreateSessionRequest = {
        session_date: formData.session_date,
        store_name: formData.store_name,
        mix_name: formData.mix_name,
        flavors: validFlavors,
        notes: formData.notes || undefined,
        order_details: formData.order_details || undefined,
      };

      const newSession = await apiService.createSession(sessionData);
      navigate(`/sessions/${newSession.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'セッションの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新しいセッションを記録</h1>
        <p className="mt-1 text-sm text-gray-600">
          シーシャセッションの詳細を記録しましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="session_date" className="block text-sm font-medium text-gray-700">
                セッション日時 *
              </label>
              <input
                type="datetime-local"
                name="session_date"
                id="session_date"
                required
                value={formData.session_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
                店舗名 *
              </label>
              <input
                type="text"
                name="store_name"
                id="store_name"
                required
                value={formData.store_name}
                onChange={handleInputChange}
                placeholder="例: Cloud 9 Lounge"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="mix_name" className="block text-sm font-medium text-gray-700">
                ミックス名 *
              </label>
              <input
                type="text"
                name="mix_name"
                id="mix_name"
                required
                value={formData.mix_name}
                onChange={handleInputChange}
                placeholder="例: Blueberry Mint"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  フレーバー *
                </label>
                <button
                  type="button"
                  onClick={addFlavor}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  + フレーバーを追加
                </button>
              </div>
              <div className="space-y-3">
                {flavors.map((flavor, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="フレーバー名"
                        value={flavor.flavor_name}
                        onChange={(e) => handleFlavorChange(index, 'flavor_name', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="ブランド"
                        value={flavor.brand}
                        onChange={(e) => handleFlavorChange(index, 'brand', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    {flavors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlavor(index)}
                        className="text-red-600 hover:text-red-500"
                      >
                        削除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="order_details" className="block text-sm font-medium text-gray-700">
                注文詳細
              </label>
              <input
                type="text"
                name="order_details"
                id="order_details"
                value={formData.order_details}
                onChange={handleInputChange}
                placeholder="例: Bowl #3, Table 5"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                メモ
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="セッションについてのメモや感想..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/sessions')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? '保存中...' : 'セッションを保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSession;