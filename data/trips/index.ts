import { Trip, Activity } from '@/types/trip';
import { trip260108 } from './260108';

// 全35個のアクティビティリスト
export const allActivities: string[] = [
  '仙台とわかる写真を撮る',
  '牡蠣を食べる',
  '三角揚げを食べる',
  'ずんだ餅を食べる',
  '海の写真を撮る',
  '仙台すずめ饅頭を食べる',
  '牛タンを食べる',
  '生パイを食べる',
  'ひょうたん揚げを食べる',
  'しそ巻きを食べる',
  'コーヒーを飲む',
  'お土産を買う',
  'お酒を飲む',
  '萩の月を食べる',
  'ずんだシェイクを飲む',
  'おはぎを食べる',
  'じゃんけんに勝つ',
  'ゲームセンターで1勝',
  'ガチャガチャで一発',
  'ヨーロッパの言語を見つける',
  '浜松ナンバーの車を見つける',
  'たまご舎を食べる',
  'ご当地キャラの立像を見つける',
  '狩野英孝のサインを見つける',
  'ホヤを食べる',
  'ローカルCMを見る',
  'ローカル番組を見る',
  'ご当地マンホールを見つける',
  'いぎなり東北産の写真を見つける',
  'ご当地ベアを見つける',
  '相手が出すクイズに正解する',
  'サンドイッチマンのサインを見つける',
  'パンサー尾形のサインを見つける',
  '10秒チャレンジに勝つ',
  '仙台牛を食べる',
];

// シード付きランダム関数（同じシードで同じ結果を返す）
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  let value = Math.abs(hash);
  
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// 35個からランダムに25個を選ぶ関数（カードタイプごとに異なる内容）
export function getRandomActivities(tripCode: string, cardType: string = 'A'): Activity[] {
  // tripCode + cardType をシードとして使用することで、同じコードでもカードタイプごとに異なる内容になる
  const seed = `${tripCode}-${cardType}`;
  const random = seededRandom(seed);
  const shuffled = [...allActivities].sort(() => random() - 0.5);
  const selected = shuffled.slice(0, 24); // 24個を選ぶ（中央のFREE用に1つ減らす）
  
  const activities: Activity[] = selected.map((name, index) => ({
    id: `activity-${index + 1}`,
    name,
    completed: false,
  }));
  
  // 中央（13番目、インデックス12）にFREEを挿入
  activities.splice(12, 0, {
    id: 'activity-free',
    name: 'FREE',
    completed: false, // FREEも初期状態では未完了
  });
  
  return activities;
}

// すべての旅行データをマップに格納
const tripMap: Record<string, Trip> = {
  '260108': trip260108,
};

export function getTripByCode(code: string): Trip | undefined {
  const trip = tripMap[code];
  if (trip) {
    return {
      ...trip,
      activities: getRandomActivities(code),
    };
  }
  return undefined;
}

