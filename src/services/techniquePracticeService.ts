import { supabase } from "@/lib/supabase/client";

// シークエンスの練習記録の型定義
export type TechniquePractice = {
  id: string;
  technique_id: string;
  success_rate: number;
  practice_date: string;
  notes?: string | null;
  created_at: string;
};

export type NewTechniquePractice = Omit<TechniquePractice, "id" | "created_at">;

// 特定のシークエンスの練習記録を取得
export async function getTechniquePractices(
  techniqueId: string
): Promise<TechniquePractice[]> {
  const { data, error } = await supabase
    .from("technique_practices")
    .select("*")
    .eq("technique_id", techniqueId)
    .order("practice_date", { ascending: false });

  if (error) {
    console.error("Error fetching technique practices:", error);
    throw new Error("練習記録の取得に失敗しました");
  }

  return data as TechniquePractice[];
}

// 新しい練習記録を作成
export async function createTechniquePractice(
  practice: NewTechniquePractice
): Promise<TechniquePractice> {
  const { data, error } = await supabase
    .from("technique_practices")
    .insert(practice)
    .select()
    .single();

  if (error) {
    console.error("Error creating technique practice:", error);
    throw new Error("練習記録の作成に失敗しました");
  }

  return data as TechniquePractice;
}

// 練習記録を削除
export async function deleteTechniquePractice(id: string): Promise<void> {
  const { error } = await supabase
    .from("technique_practices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting technique practice:", error);
    throw new Error("練習記録の削除に失敗しました");
  }
}

// 特定のシークエンスの最新の成功率を取得
export async function getLatestSuccessRate(
  techniqueId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("technique_practices")
    .select("success_rate")
    .eq("technique_id", techniqueId)
    .order("practice_date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // データが見つからない場合
      return null;
    }
    console.error("Error fetching latest success rate:", error);
    throw new Error("最新の成功率の取得に失敗しました");
  }

  return data.success_rate;
}

// 特定のシークエンスの成功率の推移を取得（グラフ表示用）
export async function getSuccessRateHistory(
  techniqueId: string,
  limit: number = 10
): Promise<TechniquePractice[]> {
  const { data, error } = await supabase
    .from("technique_practices")
    .select("practice_date, success_rate")
    .eq("technique_id", techniqueId)
    .order("practice_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching success rate history:", error);
    throw new Error("成功率の履歴の取得に失敗しました");
  }

  return data as TechniquePractice[];
}

// 特定のシークエンスの直近10回の成功率の平均を取得
export async function getAverageSuccessRate(
  techniqueId: string,
  count: number = 10
): Promise<number | null> {
  const { data, error } = await supabase
    .from("technique_practices")
    .select("success_rate")
    .eq("technique_id", techniqueId)
    .order("practice_date", { ascending: false })
    .limit(count);

  if (error) {
    console.error("Error fetching success rates:", error);
    throw new Error("成功率の取得に失敗しました");
  }

  if (data.length === 0) {
    return null;
  }

  // 平均値を計算
  const sum = data.reduce((acc, record) => acc + record.success_rate, 0);
  return Math.round(sum / data.length);
}
