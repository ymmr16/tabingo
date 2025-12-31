'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTripByCode } from '@/data/trips';
import ErrorModal from '@/components/ErrorModal';

export default function Home() {
  const [name, setName] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = tripCode.trim();
    
    if (trimmedName && trimmedCode) {
      // 旅行コードの存在チェック
      const trip = getTripByCode(trimmedCode);
      if (!trip) {
        setShowError(true);
        return;
      }
      
      // 存在する場合のみ画面遷移
      router.push(`/trip/select?name=${encodeURIComponent(trimmedName)}&code=${encodeURIComponent(trimmedCode)}`);
    }
  };

  return (
    <>
      <ErrorModal
        isOpen={showError}
        message="旅行データが存在しません"
        onClose={() => setShowError(false)}
      />
      <div className="flex min-h-screen items-center justify-center">
        <main className="w-full max-w-md px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.svg" 
              alt="たびンゴ！" 
              className="h-16 sm:h-20 md:h-24 w-auto scale-[0.8]"
            />
          </div>
          <p className="text-center text-black mb-8">
            名前と旅行コードを入力してください
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-black mb-2"
              >
                名前
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="お名前を入力"
                className="w-full px-4 py-3 border-2 border-primary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-800 outline-none text-black"
                required
              />
            </div>
            <div>
              <label 
                htmlFor="tripCode" 
                className="block text-sm font-medium text-black mb-2"
              >
                旅行コード
              </label>
              <input
                id="tripCode"
                type="text"
                value={tripCode}
                onChange={(e) => setTripCode(e.target.value)}
                placeholder="例: 950106"
                className="w-full px-4 py-3 border-2 border-primary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-800 outline-none text-black"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              次へ
            </button>
          </form>
        </div>
      </main>
    </div>
    </>
  );
}
