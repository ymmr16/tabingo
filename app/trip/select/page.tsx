'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { getTripByCode } from '@/data/trips';
import ErrorModal from '@/components/ErrorModal';

const cardTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const;

function SelectCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const nameParam = searchParams.get('name');
    const codeParam = searchParams.get('code');
    
    if (!nameParam || !codeParam) {
      router.push('/');
      return;
    }
    
    // 旅行コードの存在チェック
    const trip = getTripByCode(codeParam);
    if (!trip) {
      setShowError(true);
      return;
    }
    
    setName(nameParam);
    setTripCode(codeParam);
  }, [searchParams, router]);

  const handleCardSelect = (cardType: string) => {
    router.push(`/trip/${tripCode}?name=${encodeURIComponent(name)}&card=${cardType}`);
  };

  if (!name || !tripCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">読み込み中...</div>
      </div>
    );
  }

  return (
    <>
      <ErrorModal
        isOpen={showError}
        message="旅行データが存在しません"
        onClose={() => router.push('/')}
      />
      <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/')}
              className="text-white hover:text-primary-200 font-medium text-sm sm:text-base touch-manipulation flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faAngleLeft} />
              戻る
            </button>
            <img 
              src="/logo.svg" 
              alt="たびンゴ！" 
              className="h-10 sm:h-12 md:h-14 w-auto scale-[0.8]"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div className="w-16 sm:w-20 md:w-24"></div>
            {/* スペーサー（左右のバランスを取るため） */}
          </div>
        </div>
      </div>
      {tripCode === '260108' && (
        <div className="w-full px-4 sm:px-6 mb-4">
          <img 
            src="/logo-260108.png" 
            alt="260108" 
            className="w-full h-auto"
          />
        </div>
      )}
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 border-2 border-primary-700">
          <p className="text-center text-black mb-6">
            ビンゴカードを1枚選んでください
          </p>
          
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {cardTypes.map((cardType) => (
              <button
                key={cardType}
                onClick={() => handleCardSelect(cardType)}
                className="
                  aspect-square bg-gradient-to-br from-primary-500 to-primary-700 
                  text-white font-bold text-2xl sm:text-3xl rounded-lg
                  shadow-md hover:shadow-xl transform hover:scale-105
                  transition-all duration-200 touch-manipulation
                  flex items-center justify-center
                "
              >
                {cardType}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function SelectCardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">読み込み中...</div>
      </div>
    }>
      <SelectCardContent />
    </Suspense>
  );
}

