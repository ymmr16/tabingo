'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity } from '@/types/trip';
import ActivityModal from './ActivityModal';

interface ActivityBingoProps {
  activities: Activity[];
  tripCode: string;
}

export default function ActivityBingo({ activities, tripCode }: ActivityBingoProps) {
  const [localActivities, setLocalActivities] = useState<Activity[]>(activities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBingoAnimation, setShowBingoAnimation] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressCompleted = useRef<boolean>(false);
  const isTouchDevice = useRef<boolean>(false);
  const previousBingoCount = useRef<number>(-1);
  const longPressThreshold = 500; // 500msで長押しと判定

  useEffect(() => {
    // ローカルストレージから状態を読み込む
    const saved = localStorage.getItem(`trip-${tripCode}-activities`);
    if (saved) {
      try {
        const savedActivities = JSON.parse(saved);
        // FREEが含まれているか確認し、含まれていない場合は新しく生成されたactivitiesを使用
        const hasFree = savedActivities.some((a: Activity) => a.id === 'activity-free');
        if (hasFree && savedActivities.length === 25) {
          setLocalActivities(savedActivities);
        } else {
          // FREEが含まれていない、または数が合わない場合は新しく生成されたactivitiesを使用
          setLocalActivities(activities);
        }
      } catch (e) {
        // エラーが発生した場合は初期状態を使用
        setLocalActivities(activities);
      }
    } else {
      // ローカルストレージにデータがない場合は初期状態を使用
      setLocalActivities(activities);
    }
  }, [tripCode, activities]);

  const toggleActivity = (id: string) => {
    const updated = localActivities.map(activity =>
      activity.id === id
        ? { ...activity, completed: !activity.completed }
        : activity
    );
    setLocalActivities(updated);
    localStorage.setItem(`trip-${tripCode}-activities`, JSON.stringify(updated));
  };

  const handleTouchStart = (activity: Activity, e: React.TouchEvent) => {
    isTouchDevice.current = true;
    longPressCompleted.current = false;
    longPressTimer.current = setTimeout(() => {
      // 長押し: マスを開ける
      longPressCompleted.current = true;
      toggleActivity(activity.id);
      longPressTimer.current = null;
    }, longPressThreshold);
  };

  const handleTouchEnd = (activity: Activity, e: React.TouchEvent) => {
    if (longPressTimer.current) {
      // 長押しでない場合: タイマーをクリアしてモーダルを表示
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (!longPressCompleted.current) {
        // 少し遅延を入れて、確実にモーダルを表示
        setTimeout(() => {
          if (!longPressCompleted.current) {
            setSelectedActivity(activity);
            setIsModalOpen(true);
          }
        }, 50);
      }
    } else if (!longPressCompleted.current) {
      // タイマーが既にクリアされているが、長押しが完了していない場合
      setSelectedActivity(activity);
      setIsModalOpen(true);
    }
    longPressCompleted.current = false;
  };

  const handleMouseDown = (activity: Activity, e: React.MouseEvent) => {
    if (isTouchDevice.current) return; // タッチデバイスの場合は無視
    longPressCompleted.current = false;
    longPressTimer.current = setTimeout(() => {
      // 長押し: マスを開ける
      longPressCompleted.current = true;
      toggleActivity(activity.id);
      longPressTimer.current = null;
    }, longPressThreshold);
  };

  const handleMouseUp = (activity: Activity, e: React.MouseEvent) => {
    if (isTouchDevice.current) return; // タッチデバイスの場合は無視
    if (longPressTimer.current) {
      // 長押しでない場合: タイマーをクリア
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // 長押しが完了していない場合は、後でonClickで処理される
    if (longPressCompleted.current) {
      longPressCompleted.current = false;
    }
  };

  const handleClick = (activity: Activity, e: React.MouseEvent) => {
    // タッチデバイスの場合は無視（onTouchEndで処理済み）
    if (isTouchDevice.current) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // 長押しが完了していない場合のみモーダルを表示
    if (!longPressCompleted.current) {
      setSelectedActivity(activity);
      setIsModalOpen(true);
    }
    longPressCompleted.current = false;
  };

  const handlePressCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressCompleted.current = false;
  };

  // ビンゴの完成数を計算（5x5グリッド）
  const calculateBingoCount = (activities: Activity[]): number => {
    // 5x5グリッドに変換（インデックス0-24）
    const grid: boolean[] = activities.map(a => a.completed);
    let bingoCount = 0;

    // 横5行をチェック
    for (let row = 0; row < 5; row++) {
      let allCompleted = true;
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        if (!grid[index]) {
          allCompleted = false;
          break;
        }
      }
      if (allCompleted) bingoCount++;
    }

    // 縦5列をチェック
    for (let col = 0; col < 5; col++) {
      let allCompleted = true;
      for (let row = 0; row < 5; row++) {
        const index = row * 5 + col;
        if (!grid[index]) {
          allCompleted = false;
          break;
        }
      }
      if (allCompleted) bingoCount++;
    }

    // 斜め（左上から右下）
    let allCompleted = true;
    for (let i = 0; i < 5; i++) {
      const index = i * 5 + i;
      if (!grid[index]) {
        allCompleted = false;
        break;
      }
    }
    if (allCompleted) bingoCount++;

    // 斜め（右上から左下）
    allCompleted = true;
    for (let i = 0; i < 5; i++) {
      const index = i * 5 + (4 - i);
      if (!grid[index]) {
        allCompleted = false;
        break;
      }
    }
    if (allCompleted) bingoCount++;

    return bingoCount;
  };

  const bingoCount = calculateBingoCount(localActivities);

  // BINGO数が増えた時にアニメーションを表示
  useEffect(() => {
    // 初回読み込み時はpreviousBingoCountを設定するだけ（アニメーションを表示しない）
    if (previousBingoCount.current === -1) {
      previousBingoCount.current = bingoCount;
      return;
    }

    // BINGO数が増えた時（1列ビンゴが増えるたび）にアニメーションを表示
    if (bingoCount > previousBingoCount.current) {
      const increaseCount = bingoCount - previousBingoCount.current;
      // 増えた列数分だけアニメーションを順番に表示
      let animationIndex = 0;
      const timers: NodeJS.Timeout[] = [];

      const showNextAnimation = () => {
        if (animationIndex < increaseCount) {
          setShowBingoAnimation(true);
          const timer = setTimeout(() => {
            setShowBingoAnimation(false);
            animationIndex++;
            // 次のアニメーションを表示（少し遅延を入れる）
            if (animationIndex < increaseCount) {
              const nextTimer = setTimeout(showNextAnimation, 100);
              timers.push(nextTimer);
            } else {
              // すべてのアニメーションが終わったらpreviousBingoCountを更新
              previousBingoCount.current = bingoCount;
            }
          }, 2000);
          timers.push(timer);
        }
      };

      showNextAnimation();

      // クリーンアップ関数
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    } else if (bingoCount < previousBingoCount.current) {
      // BINGO数が減った場合（マスを未完了に戻した場合）もpreviousBingoCountを更新
      previousBingoCount.current = bingoCount;
    }
  }, [bingoCount]);

  return (
    <>
      <ActivityModal
        isOpen={isModalOpen}
        activityName={selectedActivity?.name || ''}
        isCompleted={selectedActivity?.completed || false}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="space-y-4 w-full relative">
        {showBingoAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div 
              className="w-48 sm:w-64 md:w-80 h-auto"
              style={{
                animation: 'fadeInScale 0.3s ease-out, fadeOut 0.3s ease-in 1.7s forwards'
              }}
            >
              <svg 
                id="_レイヤー_1" 
                data-name=" レイヤー 1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1251.46 259.22"
                className="w-full h-auto"
              >
                <g fill="#003521">
                  <path d="M254.64,204.18c3.08-16.72,6.6-33.22,10.34-49.72,3.96-16.5,7.92-32.78,12.54-49.06l-4.84-1.76-24.64,2.86-2.86-6.6c1.76-9.9,2.86-20.02,2.86-29.92,13.86-3.74,28.38-5.94,43.56-6.38,4.4-11.22,8.58-22.44,12.32-33.66l5.72-1.1c8.8,3.3,18.04,5.5,27.5,6.82v9.24l-3.96,12.1h3.96l22.88-3.74,1.76,6.6-2.86,21.34c-12.76,6.16-26.18,10.56-40.7,12.98-7.04,19.36-13.42,38.5-18.92,57.42l-17.16,57.42c-8.14,1.76-16.72,3.08-25.52,3.52l-1.98-8.36ZM321.08,202.2v-5.5c2.42-6.16,4.18-12.98,4.62-20.46l-.88-6.38c29.7-1.54,59.4-4.4,89.1-8.36,3.3,2.42,4.18,5.72,2.86,10.12l1.98,4.62c0,6.16-1.32,11.88-3.74,16.72-13.42,5.72-27.5,9.46-42.24,11.22-14.96,1.98-29.92,3.08-45.1,3.74l-6.6-5.72ZM413.92,144.56c-11.44-4.4-23.54-7.26-36.52-8.8s-25.74-3.08-38.28-4.18l-4.84,1.76c-1.98-2.42-2.64-5.5-1.76-9.24,1.1-7.92,3.74-15.4,7.48-22.44l29.26-.88c11.44.66,22.22,1.98,32.34,4.18l31.46,7.04,2.64,6.6-16.06,24.2-5.72,1.76ZM391.26,122.12h-5.72v2.86h5.72v-2.86ZM395,123.22h-2.86v2.86h2.86v-2.86ZM404.46,126.96v2.64l4.62.88-4.62-3.52Z"/>
                  <path d="M531.62,208.8l-8.58,1.1c-10.78-4.62-20.68-10.56-29.48-17.82-5.5-7.7-9.9-15.84-12.76-24.64-2.86-8.58-4.62-17.6-5.28-27.06.66-9.9,2.2-19.36,4.84-28.16,2.42-8.58,5.72-17.38,9.46-26.18h-3.74l-27.5,7.48-1.98-11.88,1.1-14.3-3.08-5.5,4.84-5.72c10.56-3.74,22-6.16,34.1-7.48,12.1-1.32,23.76-2.86,35.2-4.62l2.86,1.1,6.6-1.1,9.46,7.48c1.76,6.38,4.18,12.54,6.6,18.7-8.14,3.74-15.84,9.02-22.66,15.84-6.38,8.8-11.66,18.04-16.06,27.72-4.62,9.68-6.38,20.46-5.94,32.34,1.98,8.14,6.82,15.18,14.3,21.34,7.48,3.96,15.4,6.38,23.76,7.48,10.78-2.86,20.24-8.58,28.38-16.72,6.38-8.14,10.34-16.94,12.32-26.18s2.86-19.36,2.86-30.14c-1.32-11.66-4.18-23.1-8.58-34.54,9.02-5.5,18.48-9.24,28.6-11.22l11.44,11.22,44.44,30.14.88,4.4c-5.5,9.46-12.76,18.26-21.78,26.4h-2.64l-20.02-16.94h-2.86l.88,16.94c-.66,9.9-2.2,19.8-5.06,29.48-2.86,9.68-8.14,18.26-15.84,25.96l-14.08,12.98c-7.04,4.4-14.52,7.7-22.44,10.12-7.92,2.64-16.28,3.96-25.08,3.96l-7.48-1.98ZM537.12,60.96h-2.86l-1.76,3.74,2.64-.88,1.98-2.86ZM541.08,58.1l-2.86,2.86h2.86v-2.86ZM592.12,73.94l-.88,2.86h3.96l-3.08-2.86ZM620.72,58.98c-5.72-6.38-8.8-13.86-9.46-22.44-.66-8.8-1.1-17.6-1.1-26.4l3.96-1.54,2.64.88,2.86-.88c5.72,0,9.9,2.42,12.54,7.48l3.52,35.42-2.64,3.96-12.32,3.52ZM651.96,58.98c-3.74-6.82-5.94-14.74-6.6-23.32-.66-8.8-1.54-17.16-2.86-25.52l7.7-2.64,3.52,1.1,4.84-1.1,2.86,1.1c3.3,14.74,5.06,30.14,5.72,45.76l-1.98,3.74-13.2.88Z"/>
                  <path d="M765.26,104.52c-9.46-5.5-18.7-11.22-27.94-16.72-9.02-5.5-18.26-11-27.72-15.84v-5.72l12.32-21.34,2.86-.88c9.9,5.5,20.24,10.56,31.02,14.96,10.78,4.18,21.12,9.24,31.24,14.74l1.98,4.62c-1.32,6.82-5.06,12.76-11.44,17.82l-4.84,2.86-3.74,5.5h-3.74ZM711.36,167.88l3.96-7.48c25.74-6.16,50.16-15.4,73.04-27.94,23.1-12.54,44.88-26.4,65.78-41.8l12.1,25.96c-7.48,8.14-15.62,15.18-23.98,21.34-8.58,6.16-17.16,12.54-25.96,18.7-15.84,9.9-31.68,18.92-47.74,27.06-16.06,8.14-33.22,14.3-51.26,18.48-3.3-11-5.28-22.44-5.94-34.32ZM724.78,189.44h-2.86v3.52h2.86v-3.52ZM775.6,167.88v2.86l2.86-.88-2.86-1.98Z"/>
                  <path d="M929.6,187.46c-.66-11.66,1.32-21.34,5.72-28.82l21.56-2.86c6.6.44,13.2.66,19.8.88l16.06-2.64,2.86.88,27.5-5.72c2.42-9.24,4.18-18.92,5.06-29.26.88-10.34,1.98-20.68,3.3-31.24l-8.36-.88c-15.62,1.76-31.9,3.08-48.18,3.74-16.5.44-32.12,3.08-47.08,7.48-1.98-8.14-2.64-16.94-1.98-26.18l3.74-10.12c11.88-2.64,24.42-3.96,37.62-3.96l2.86,1.1c9.46-1.76,19.36-2.86,29.7-3.3l30.8-1.32,31.24,4.62,1.98-1.1,9.46,4.84c2.42,3.08,3.52,6.6,3.52,10.12-1.76,18.04-5.06,35.42-9.9,52.14-4.62,16.94-9.46,33.66-14.52,50.38-19.58,5.06-39.38,8.8-59.62,11.22-20.02,2.42-40.48,4.4-61.38,5.5l-1.76-5.5ZM1042.02,33.24c-1.98-7.7-3.52-15.62-4.62-23.76,7.26-1.98,14.96-3.52,22.44-4.62,4.4,12.98,7.92,26.4,10.34,40.04-1.1,3.08-3.74,4.4-7.48,3.74-3.74,3.74-8.14,5.94-13.2,6.6-3.08-7.04-5.72-14.3-7.48-22ZM1045.76,137.96h-2.86v2.86h1.98l.88-2.86ZM1077.66,8.6c6.38-3.74,13.2-5.94,20.9-6.6,2.64,14.96,5.06,29.92,7.48,44.66-5.06,3.3-10.56,5.5-16.94,6.6-4.4-14.3-8.14-29.26-11.44-44.66Z"/>
                  <path d="M1213.62,222.88c-6.82-.44-13.2-3.52-18.92-9.24l-2.64-6.6,1.1-4.84-3.08-11,3.96-7.48c6.16-3.52,13.2-6.38,20.68-8.36l15.18,4.62c4.84,6.82,6.82,15.18,5.5,25.08l-7.48,11.44-14.3,6.38ZM1198.66,155.78c-.22-28.82-.44-57.64-.88-86.68,1.98-15.62,5.28-30.14,10.34-43.78,5.72-3.3,12.32-4.4,19.8-3.74l2.86.88,2.86-.88,15.84,7.26,1.98,8.36c-6.16,19.36-11.66,39.16-16.06,58.96-4.18,20.02-7.7,40.04-10.34,60.5l-.88,6.6-16.06,2.64-9.46-10.12Z"/>
                </g>
                <g fill="#003521">
                  <circle cx="92.9" cy="38.55" r="38.55"/>
                  <path d="M75.48,68.34s-42.34,59.08-38.55,96.95,90.89,24.24,90.89,6.82-10.76-137.86-52.34-103.77Z"/>
                  <path d="M94.62,181.47s28.03,7.57,18.94,39.39,1.81,37.87,1.81,37.87c0,0,3.93,6.82,9.39-30.3s-4.39-54.54-21.05-53.78-9.09,6.82-9.09,6.82Z"/>
                  <path d="M55.45,171.56s11.36,28.03-6.06,29.54c-17.42,1.51-37.87-18.94-37.87-18.94,0,0-21.21-5.88-6.06,8.04,11.49,10.56,32.8,31.28,49.99,24.53,6.53-2.56,10.72-8.19,10.72-8.19,3.78-5.08,4.44-10.19,4.57-11.38.69-6.25-1.48-10.89-3.17-14.51-2.72-5.82-7.92-13.08-10.53-12.16-.97.34-1.39,1.76-1.59,3.07Z"/>
                  <path d="M65.87,105.1S-8.32,127.5.77,134.35s59.5-22.4,65.1-23.03,4.36-7.47,0-6.22Z"/>
                  <path d="M105.66,100.18s47.27-1.18,48.67-39.14,10.84-16.26,8.39,0c-2.45,16.26-5.59,23.65-11.88,28.58s-12.58,13.52-44.04,18.03c-31.46,4.5-1.13-7.47-1.13-7.47Z"/>
                  <rect x="159.26" y="4.45" width="5.23" height="49.73"/>
                  <path d="M163.13,4.45s13.26,4.69,21.92,3.54,15.69-7.03,24.69-4.74l.65,28.77s-16.35-4.41-23.05,0-25.46,0-25.46,0l1.25-27.58Z"/>
                </g>
              </svg>
            </div>
          </div>
        )}
        <div className="grid grid-cols-5 gap-0 w-full border-4 border-primary-700">
          {localActivities.map((activity, index) => {
            const isFree = activity.id === 'activity-free';
            const row = Math.floor(index / 5);
            const col = index % 5;
            
            return (
              <button
                key={activity.id}
                type="button"
                onTouchStart={(e) => handleTouchStart(activity, e)}
                onTouchEnd={(e) => handleTouchEnd(activity, e)}
                onTouchCancel={handlePressCancel}
                onMouseDown={(e) => handleMouseDown(activity, e)}
                onMouseUp={(e) => handleMouseUp(activity, e)}
                onMouseLeave={handlePressCancel}
                onClick={(e) => handleClick(activity, e)}
                className={`
                  aspect-square p-1 sm:p-2 md:p-3 lg:p-4 border border-primary-700 transition-all duration-200 touch-manipulation
                  w-full h-full min-w-0 bg-white relative cursor-pointer select-none
                  ${activity.completed ? 'active:scale-95' : 'hover:bg-gray-50 active:scale-95'}
                `}
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                {activity.completed && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none"
                    style={{
                      backgroundImage: 'url(/tree.svg)',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: '60%'
                    }}
                  />
                )}
                <div className="text-[9px] sm:text-xs md:text-sm font-bold text-center h-full flex items-center justify-center leading-tight break-words px-0.5 text-black relative z-10 pointer-events-none">
                  {activity.name}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-center mt-4">
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {bingoCount === 12 ? 'ALL CLEAR!' : `${bingoCount} BINGO!`}
          </p>
        </div>
      </div>
    </>
  );
}

