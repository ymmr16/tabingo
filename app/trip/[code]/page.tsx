'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRandomActivities, getTripByCode } from '@/data/trips';
import { Activity } from '@/types/trip';
import ActivityBingo from '@/components/ActivityBingo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import ErrorModal from '@/components/ErrorModal';
import HelpModal from '@/components/HelpModal';

export const dynamic = 'force-dynamic';

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [cardType, setCardType] = useState('');
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const code = params.code as string;
    const nameParam = searchParams.get('name');
    const cardParam = searchParams.get('card');
    
    if (!nameParam || !cardParam) {
      router.push('/');
      return;
    }
    
    // 旅行コードの存在チェック
    const trip = getTripByCode(code);
    if (!trip) {
      setShowError(true);
      setLoading(false);
      return;
    }
    
    setName(nameParam);
    setTripCode(code);
    setCardType(cardParam);
    setTripName(trip.name);
    
    // カードタイプに基づいてアクティビティを生成
    const generatedActivities = getRandomActivities(code, cardParam);
    setActivities(generatedActivities);
    setLoading(false);
  }, [params.code, searchParams, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">読み込み中...</div>
      </div>
    );
  }

  if (!activities.length || !name || !tripCode || !cardType) {
    return null;
  }

  return (
    <>
      <ErrorModal
        isOpen={showError}
        message="旅行データが存在しません"
        onClose={() => router.push('/')}
      />
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      <div className="min-h-screen pb-20 sm:pb-24">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push(`/trip/select?name=${encodeURIComponent(name)}&code=${encodeURIComponent(tripCode)}`)}
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
          {tripName && tripCode !== '260108' && (
            <div className="mb-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {tripName}
              </h1>
            </div>
          )}
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
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
        {/* ビンゴゲーム */}
        <div className="w-full relative">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setShowHelp(true)}
              className="cursor-pointer"
            >
              <FontAwesomeIcon 
                icon={faCircleQuestion} 
                className="text-white text-lg sm:text-xl md:text-2xl"
              />
            </button>
            <div className="text-sm sm:text-base font-medium text-white">
              {name}
            </div>
          </div>
          <ActivityBingo activities={activities} tripCode={`${tripCode}-${cardType}`} />
        </div>
      </div>
    </div>
    </>
  );
}

