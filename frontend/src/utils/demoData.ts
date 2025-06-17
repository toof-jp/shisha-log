import type { ShishaSession, FlavorStats, StoreStats, CreatorStats, CalendarData } from '../types/api';

// Helper function to generate date within range
function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// Popular flavor names
const flavorNames = [
  'ダブルアップル', 'ミント', 'ブルーベリー', 'グレープ', 'レモン',
  'オレンジ', 'ピーチ', 'ストロベリー', 'ウォーターメロン', 'マンゴー',
  'パイナップル', 'チェリー', 'バナナ', 'ココナッツ', 'バニラ',
  'シナモン', 'カプチーノ', 'コーラ', 'エナジードリンク', 'ローズ'
];

const storeNames = [
  'シーシャカフェ 渋谷', 'チルスポット 新宿', 'スモークラウンジ 六本木',
  'シーシャバー 池袋', 'リラックスカフェ 原宿', 'シーシャ横丁 上野',
  'チルアウト 青山', 'シーシャ天国 銀座'
];

const creatorNames = [
  '田中さん', '佐藤さん', '鈴木さん', '高橋さん', '渡辺さん',
  '伊藤さん', '山本さん', '中村さん'
];

// Generate demo sessions
export function generateDemoSessions(): ShishaSession[] {
  const sessions: ShishaSession[] = [];
  
  // Generate 50 sessions over the past 60 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const numFlavors = Math.floor(Math.random() * 3) + 1; // 1-3 flavors
    
    const flavors = [];
    const usedFlavors = new Set<string>();
    
    for (let j = 0; j < numFlavors; j++) {
      let flavorName: string;
      do {
        flavorName = flavorNames[Math.floor(Math.random() * flavorNames.length)];
      } while (usedFlavors.has(flavorName));
      usedFlavors.add(flavorName);
      
      flavors.push({
        id: `flavor-${i}-${j}`,
        session_id: `session-${i}`,
        flavor_name: flavorName,
        brand: Math.random() > 0.5 ? 'Al Fakher' : 'Fumari',
        flavor_order: j + 1,
        created_at: generateDate(daysAgo)
      });
    }
    
    sessions.push({
      id: `session-${i}`,
      user_id: 'demo-user',
      created_by: 'demo-user',
      session_date: generateDate(daysAgo),
      store_name: Math.random() > 0.2 ? storeNames[Math.floor(Math.random() * storeNames.length)] : undefined,
      mix_name: Math.random() > 0.7 ? `スペシャルミックス${i}` : undefined,
      creator: Math.random() > 0.3 ? creatorNames[Math.floor(Math.random() * creatorNames.length)] : undefined,
      flavors: flavors,
      notes: Math.random() > 0.6 ? `セッション${i}のメモ` : undefined,
      order_details: Math.random() > 0.8 ? `注文詳細${i}` : undefined,
      created_at: generateDate(daysAgo),
      updated_at: generateDate(daysAgo)
    });
  }
  
  return sessions.sort((a, b) => 
    new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );
}

// Generate flavor statistics from sessions
export function generateFlavorStats(sessions: ShishaSession[]): FlavorStats {
  const mainFlavorMap = new Map<string, number>();
  const allFlavorMap = new Map<string, number>();
  
  sessions.forEach(session => {
    session.flavors?.forEach(flavor => {
      if (flavor.flavor_name) {
        // Count all flavors
        allFlavorMap.set(
          flavor.flavor_name,
          (allFlavorMap.get(flavor.flavor_name) || 0) + 1
        );
        
        // Count main flavors (order = 1)
        if (flavor.flavor_order === 1) {
          mainFlavorMap.set(
            flavor.flavor_name,
            (mainFlavorMap.get(flavor.flavor_name) || 0) + 1
          );
        }
      }
    });
  });
  
  const mainFlavors = Array.from(mainFlavorMap.entries())
    .map(([name, count]) => ({ flavor_name: name, count }))
    .sort((a, b) => b.count - a.count);
    
  const allFlavors = Array.from(allFlavorMap.entries())
    .map(([name, count]) => ({ flavor_name: name, count }))
    .sort((a, b) => b.count - a.count);
  
  return { main_flavors: mainFlavors, all_flavors: allFlavors };
}

// Generate store statistics from sessions
export function generateStoreStats(sessions: ShishaSession[]): StoreStats {
  const storeMap = new Map<string, number>();
  
  sessions.forEach(session => {
    if (session.store_name) {
      storeMap.set(
        session.store_name,
        (storeMap.get(session.store_name) || 0) + 1
      );
    }
  });
  
  const stores = Array.from(storeMap.entries())
    .map(([name, count]) => ({ store_name: name, count }))
    .sort((a, b) => b.count - a.count);
  
  return { stores };
}

// Generate creator statistics from sessions
export function generateCreatorStats(sessions: ShishaSession[]): CreatorStats {
  const creatorMap = new Map<string, number>();
  
  sessions.forEach(session => {
    if (session.creator) {
      creatorMap.set(
        session.creator,
        (creatorMap.get(session.creator) || 0) + 1
      );
    }
  });
  
  const creators = Array.from(creatorMap.entries())
    .map(([name, count]) => ({ creator: name, count }))
    .sort((a, b) => b.count - a.count);
  
  return { creators };
}

// Generate calendar data from sessions
export function generateCalendarData(sessions: ShishaSession[], year: number, month: number): CalendarData[] {
  const dateMap = new Map<string, number>();
  
  sessions.forEach(session => {
    const date = new Date(session.session_date);
    if (date.getFullYear() === year && date.getMonth() + 1 === month) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
    }
  });
  
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Get sessions for a specific date
export function getSessionsByDate(sessions: ShishaSession[], dateStr: string): ShishaSession[] {
  return sessions.filter(session => {
    const sessionDate = new Date(session.session_date);
    const sessionDateStr = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}-${String(sessionDate.getDate()).padStart(2, '0')}`;
    return sessionDateStr === dateStr;
  });
}