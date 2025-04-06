// 仮のデータ型定義（Supabaseの型生成後に置き換える）
export type Performance = {
  id: string;
  user_id: string;
  name: string;
  performance_date: string;
  music_link?: string | null;
  notes?: string | null;
  is_completed: boolean;
  result_percentage?: number | null;
  ranking?: number | null;
  created_at: string;
  updated_at: string;
};

export type NewPerformance = Omit<Performance, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePerformance = Partial<NewPerformance>;
